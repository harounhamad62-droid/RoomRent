const express = require("express");
const { PrismaClient } = require("@prisma/client");

const {
  authenticate,
  requireAdmin
} = require("./middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

const MIN_WITHDRAWAL = 3000;
const WITHDRAWAL_FEE_RATE = 0.10;

const allowedMethods = [
  "AIRTEL_MONEY",
  "HALOPESA",
  "TIGOPESA"
];

// =====================================
// GET WALLET BALANCE
// =====================================
router.get(
  "/balance",
  authenticate,
  async (req, res) => {
    try {
      const transactions =
        await prisma.walletTransaction.findMany({
          where: {
            userId: req.user.id
          },

          select: {
            type: true,
            amount: true
          }
        });

      let totalCredits = 0;
      let totalDebits = 0;

      for (const transaction of transactions) {
        const amount =
          Number(transaction.amount);

        if (transaction.type === "CREDIT") {
          totalCredits += amount;
        }

        if (transaction.type === "DEBIT") {
          totalDebits += amount;
        }
      }

      const balance =
        totalCredits - totalDebits;

      res.json({
        success: true,

        wallet: {
          balance,
          totalCredits,
          totalDebits,
          currency: "TZS"
        }
      });
    } catch (error) {
      console.error(
        "Wallet balance error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load wallet balance"
      });
    }
  }
);

// =====================================
// GET WALLET TRANSACTIONS
// =====================================
router.get(
  "/transactions",
  authenticate,
  async (req, res) => {
    try {
      const transactions =
        await prisma.walletTransaction.findMany({
          where: {
            userId: req.user.id
          },

          include: {
            purchase: {
              include: {
                package: true
              }
            }
          },

          orderBy: {
            createdAt: "desc"
          }
        });

      res.json({
        success: true,
        transactions
      });
    } catch (error) {
      console.error(
        "Wallet transactions error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load wallet transactions"
      });
    }
  }
);

// =====================================
// GET MY REFERRAL COMMISSIONS
// =====================================
router.get(
  "/commissions",
  authenticate,
  async (req, res) => {
    try {
      const commissions =
        await prisma.referralCommission.findMany({
          where: {
            receiverId: req.user.id
          },

          include: {
            sourceUser: {
              select: {
                id: true,
                name: true
              }
            },

            purchase: {
              include: {
                package: true
              }
            }
          },

          orderBy: {
            createdAt: "desc"
          }
        });

      let totalCommission = 0;

      for (const commission of commissions) {
        totalCommission +=
          Number(commission.amount);
      }

      res.json({
        success: true,

        summary: {
          totalCommission,
          currency: "TZS"
        },

        commissions
      });
    } catch (error) {
      console.error(
        "Commission error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load referral commissions"
      });
    }
  }
);

// =====================================
// CREATE WITHDRAWAL
// =====================================
router.post(
  "/",
  authenticate,
  async (req, res) => {
    try {
      const {
        amount,
        method,
        phone
      } = req.body;

      if (
        amount === undefined ||
        !method ||
        !phone
      ) {
        return res.status(400).json({
          message:
            "Amount, payment method and phone are required"
        });
      }

      const numericAmount =
        Number(amount);

      if (
        Number.isNaN(numericAmount) ||
        numericAmount < MIN_WITHDRAWAL
      ) {
        return res.status(400).json({
          message:
            `Minimum withdrawal is TSh ${MIN_WITHDRAWAL}`
        });
      }

      if (!allowedMethods.includes(method)) {
        return res.status(400).json({
          message:
            "Unsupported withdrawal method"
        });
      }

      const result =
        await prisma.$transaction(
          async (tx) => {
            // =================================
            // CALCULATE CURRENT BALANCE
            // =================================
            const transactions =
              await tx.walletTransaction.findMany({
                where: {
                  userId: req.user.id
                },

                select: {
                  type: true,
                  amount: true
                }
              });

            let totalCredits = 0;
            let totalDebits = 0;

            for (
              const transaction
              of transactions
            ) {
              const value =
                Number(
                  transaction.amount
                );

              if (
                transaction.type ===
                "CREDIT"
              ) {
                totalCredits += value;
              }

              if (
                transaction.type ===
                "DEBIT"
              ) {
                totalDebits += value;
              }
            }

            const balance =
              totalCredits -
              totalDebits;

            // =================================
            // CHECK AVAILABLE BALANCE
            // =================================
            if (
              numericAmount >
              balance
            ) {
              throw new Error(
                `Insufficient balance. Available balance is TSh ${balance.toLocaleString()}`
              );
            }

            // =================================
            // CALCULATE FEE
            // =================================
            const fee =
              numericAmount *
              WITHDRAWAL_FEE_RATE;

            const netAmount =
              numericAmount - fee;

            // =================================
            // CREATE WITHDRAWAL
            // =================================
            const withdrawal =
              await tx.withdrawal.create({
                data: {
                  userId:
                    req.user.id,

                  amount:
                    numericAmount,

                  fee,

                  netAmount,

                  method,

                  phone:
                    String(phone).trim(),

                  status:
                    "PENDING"
                }
              });

            // =================================
            // RESERVE BALANCE
            // =================================
            await tx.walletTransaction.create({
              data: {
                userId:
                  req.user.id,

                type:
                  "DEBIT",

                amount:
                  numericAmount,

                reference:
                  `WITHDRAWAL-${withdrawal.id}`,

                description:
                  `Withdrawal request - ${withdrawal.id}`
              }
            });

            return {
              withdrawal,
              balanceBefore:
                balance,
              balanceAfter:
                balance -
                numericAmount
            };
          }
        );

      res.status(201).json({
        message:
          "Withdrawal request submitted successfully",

        withdrawal:
          result.withdrawal,

        wallet: {
          balanceBefore:
            result.balanceBefore,

          balanceAfter:
            result.balanceAfter,

          currency: "TZS"
        },

        feeRate: "10%"
      });
    } catch (error) {
      console.error(
        "Withdrawal error:",
        error
      );

      if (
        error.message &&
        error.message.startsWith(
          "Insufficient balance"
        )
      ) {
        return res.status(400).json({
          message:
            error.message
        });
      }

      res.status(500).json({
        message:
          "Failed to create withdrawal request"
      });
    }
  }
);

// =====================================
// GET MY WITHDRAWALS
// =====================================
router.get(
  "/my",
  authenticate,
  async (req, res) => {
    try {
      const withdrawals =
        await prisma.withdrawal.findMany({
          where: {
            userId: req.user.id
          },

          orderBy: {
            createdAt: "desc"
          }
        });

      res.json({
        success: true,
        withdrawals
      });
    } catch (error) {
      console.error(
        "My withdrawals error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load withdrawals"
      });
    }
  }
);

// =====================================
// GET ONE WITHDRAWAL
// =====================================
router.get(
  "/:id",
  authenticate,
  async (req, res) => {
    try {
      const withdrawal =
        await prisma.withdrawal.findFirst({
          where: {
            id: req.params.id,

            userId:
              req.user.id
          }
        });

      if (!withdrawal) {
        return res.status(404).json({
          message:
            "Withdrawal not found"
        });
      }

      res.json({
        success: true,
        withdrawal
      });
    } catch (error) {
      console.error(
        "Get withdrawal error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load withdrawal"
      });
    }
  }
);

// =====================================
// ADMIN - GET ALL WITHDRAWALS
// =====================================
router.get(
  "/admin/all",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const withdrawals =
        await prisma.withdrawal.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          },

          orderBy: {
            createdAt: "desc"
          }
        });

      res.json({
        success: true,
        withdrawals
      });
    } catch (error) {
      console.error(
        "Admin withdrawals error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load withdrawals"
      });
    }
  }
);

// =====================================
// ADMIN - UPDATE WITHDRAWAL STATUS
// =====================================
router.put(
  "/admin/:id/status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        status,
        transactionId
      } = req.body;

      const allowedStatuses = [
        "PENDING",
        "PROCESSING",
        "PAID",
        "FAILED",
        "CANCELLED"
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid withdrawal status"
        });
      }

      const withdrawal =
        await prisma.withdrawal.findUnique({
          where: {
            id: req.params.id
          }
        });

      if (!withdrawal) {
        return res.status(404).json({
          message:
            "Withdrawal not found"
        });
      }

      // =================================
      // PREVENT REPEATED FINAL STATUS
      // =================================
      const finalStatuses = [
        "PAID",
        "FAILED",
        "CANCELLED"
      ];

      if (
        finalStatuses.includes(
          withdrawal.status
        ) &&
        withdrawal.status !== status
      ) {
        return res.status(400).json({
          message:
            "This withdrawal has already reached a final status"
        });
      }

      const result =
        await prisma.$transaction(
          async (tx) => {
            const updated =
              await tx.withdrawal.update({
                where: {
                  id:
                    withdrawal.id
                },

                data: {
                  status,

                  transactionId:
                    transactionId !==
                    undefined
                      ? transactionId
                      : withdrawal.transactionId,

                  processedAt:
                    finalStatuses.includes(
                      status
                    )
                      ? new Date()
                      : withdrawal.processedAt
                }
              });

            // =================================
            // REFUND RESERVED BALANCE
            // =================================
            if (
              (
                status === "FAILED" ||
                status === "CANCELLED"
              ) &&
              withdrawal.status !==
                "FAILED" &&
              withdrawal.status !==
                "CANCELLED"
            ) {
              const refundReference =
                `WITHDRAWAL-REFUND-${withdrawal.id}`;

              const existingRefund =
                await tx.walletTransaction.findUnique({
                  where: {
                    reference:
                      refundReference
                  }
                });

              if (!existingRefund) {
                await tx.walletTransaction.create({
                  data: {
                    userId:
                      withdrawal.userId,

                    type:
                      "CREDIT",

                    amount:
                      withdrawal.amount,

                    reference:
                      refundReference,

                    description:
                      `Withdrawal refund - ${withdrawal.id}`
                  }
                });
              }
            }

            return updated;
          }
        );

      res.json({
        message:
          "Withdrawal status updated successfully",

        withdrawal:
          result
      });
    } catch (error) {
      console.error(
        "Update withdrawal error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update withdrawal status"
      });
    }
  }
);

module.exports = router;
