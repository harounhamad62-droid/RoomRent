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

const allowedStatuses = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "CANCELLED"
];

const finalStatuses = [
  "PAID",
  "FAILED",
  "CANCELLED"
];

// =====================================
// USER WALLET BALANCE
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
// USER WALLET TRANSACTIONS
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
// USER REFERRAL COMMISSIONS
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
            `Minimum withdrawal is TSh ${MIN_WITHDRAWAL.toLocaleString()}`
        });
      }

      if (
        !allowedMethods.includes(method)
      ) {
        return res.status(400).json({
          message:
            "Unsupported withdrawal method"
        });
      }

      const result =
        await prisma.$transaction(
          async (tx) => {
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
                Number(transaction.amount);

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

            if (
              numericAmount > balance
            ) {
              throw new Error(
                `Insufficient balance. Available balance is TSh ${balance.toLocaleString()}`
              );
            }

            const fee =
              numericAmount *
              WITHDRAWAL_FEE_RATE;

            const netAmount =
              numericAmount - fee;

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
// USER'S WITHDRAWALS
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
// ADMIN: ALL WITHDRAWALS
//
// IMPORTANT:
// This route comes BEFORE /:id
// so /admin/all is not captured by /:id.
// =====================================
router.get(
  "/admin/all",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        status,
        search
      } = req.query;

      const where = {};

      // -------------------------------
      // STATUS FILTER
      // -------------------------------
      if (status) {
        const normalizedStatus =
          String(status)
            .trim()
            .toUpperCase();

        if (
          !allowedStatuses.includes(
            normalizedStatus
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid withdrawal status"
          });
        }

        where.status =
          normalizedStatus;
      }

      // -------------------------------
      // CUSTOMER SEARCH
      // -------------------------------
      if (search) {
        const searchText =
          String(search).trim();

        if (searchText) {
          where.user = {
            OR: [
              {
                name: {
                  contains:
                    searchText,
                  mode:
                    "insensitive"
                }
              },

              {
                email: {
                  contains:
                    searchText,
                  mode:
                    "insensitive"
                }
              },

              {
                phone: {
                  contains:
                    searchText,
                  mode:
                    "insensitive"
                }
              }
            ]
          };
        }
      }

      const withdrawals =
        await prisma.withdrawal.findMany({
          where,

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

        filters: {
          status:
            status || null,

          search:
            search || null
        },

        count:
          withdrawals.length,

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
// ADMIN: WITHDRAWAL SUMMARY
// =====================================
router.get(
  "/admin/summary",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const withdrawals =
        await prisma.withdrawal.findMany({
          select: {
            amount: true,
            fee: true,
            netAmount: true,
            status: true
          }
        });

      const summary = {
        total: 0,
        pending: 0,
        processing: 0,
        paid: 0,
        failed: 0,
        cancelled: 0,
        totalAmount: 0,
        totalFees: 0,
        totalNetAmount: 0
      };

      for (
        const withdrawal
        of withdrawals
      ) {
        summary.total++;

        const amount =
          Number(withdrawal.amount);

        const fee =
          Number(withdrawal.fee);

        const netAmount =
          Number(
            withdrawal.netAmount
          );

        summary.totalAmount +=
          amount;

        summary.totalFees +=
          fee;

        summary.totalNetAmount +=
          netAmount;

        switch (
          withdrawal.status
        ) {
          case "PENDING":
            summary.pending++;
            break;

          case "PROCESSING":
            summary.processing++;
            break;

          case "PAID":
            summary.paid++;
            break;

          case "FAILED":
            summary.failed++;
            break;

          case "CANCELLED":
            summary.cancelled++;
            break;
        }
      }

      res.json({
        success: true,
        currency: "TZS",
        summary
      });
    } catch (error) {
      console.error(
        "Admin withdrawal summary error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load withdrawal summary"
      });
    }
  }
);

// =====================================
// USER: SINGLE WITHDRAWAL
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
            userId: req.user.id
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
// ADMIN: UPDATE WITHDRAWAL STATUS
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

      if (
        !allowedStatuses.includes(
          status
        )
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

      // ---------------------------------
      // Do not modify a final withdrawal
      // to another final status.
      // ---------------------------------
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
                  id: withdrawal.id
                },

                data: {
                  status,

                  transactionId:
                    transactionId !==
                    undefined
                      ? String(
                          transactionId
                        ).trim()
                      : withdrawal.transactionId,

                  processedAt:
                    finalStatuses.includes(
                      status
                    )
                      ? new Date()
                      : withdrawal.processedAt
                }
              });

            // ---------------------------------
            // REFUND WHEN WITHDRAWAL FAILS
            // OR IS CANCELLED
            // ---------------------------------
            if (
              (
                status === "FAILED" ||
                status ===
                  "CANCELLED"
              ) &&
              withdrawal.status !==
                "FAILED" &&
              withdrawal.status !==
                "CANCELLED"
            ) {
              const refundReference =
                `WITHDRAWAL-REFUND-${withdrawal.id}`;

              const existingRefund =
                await tx.walletTransaction.findUnique(
                  {
                    where: {
                      reference:
                        refundReference
                    }
                  }
                );

              if (!existingRefund) {
                await tx.walletTransaction.create(
                  {
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
                  }
                );
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
        "Update withdrawal status error:",
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
