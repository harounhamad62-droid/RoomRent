const express = require("express");
const { PrismaClient } = require("@prisma/client");

const {
  authenticate
} = require("./middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

const DAILY_RATE = 0.04;
const CYCLE_DAYS = 50;

// Referral commission rates
const REFERRAL_RATES = {
  A: 0.05,
  B: 0.02,
  C: 0.01
};

// =====================================
// BUY PACKAGE
// =====================================
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      packageId,
      paymentMethod
    } = req.body;

    if (!packageId || !paymentMethod) {
      return res.status(400).json({
        message:
          "Package ID and payment method are required"
      });
    }

    const allowedMethods = [
      "AIRTEL_MONEY",
      "HALOPESA",
      "TIGOPESA"
    ];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message:
          "Unsupported payment method"
      });
    }

    const selectedPackage =
      await prisma.package.findUnique({
        where: {
          id: packageId
        }
      });

    if (!selectedPackage) {
      return res.status(404).json({
        message:
          "Package not found"
      });
    }

    if (!selectedPackage.active) {
      return res.status(400).json({
        message:
          "Package is not active"
      });
    }

    // Check successful purchases
    const purchaseCount =
      await prisma.packagePurchase.count({
        where: {
          userId: req.user.id,
          packageId: selectedPackage.id,
          status: "SUCCESS"
        }
      });

    if (
      purchaseCount >=
      selectedPackage.maxPurchases
    ) {
      return res.status(400).json({
        message:
          "You have reached the purchase limit for this package"
      });
    }

    const purchase =
      await prisma.packagePurchase.create({
        data: {
          userId: req.user.id,

          packageId:
            selectedPackage.id,

          amountPaid:
            selectedPackage.price,

          status: "PENDING",

          dailyRate:
            DAILY_RATE,

          totalCredited: 0
        },

        include: {
          package: true
        }
      });

    res.status(201).json({
      message:
        "Package purchase created successfully",

      purchase,

      payment: {
        method:
          paymentMethod,

        amount:
          selectedPackage.price,

        status:
          "PENDING",

        message:
          "Complete payment and wait for verification."
      }
    });
  } catch (error) {
    console.error(
      "Package purchase error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create package purchase"
    });
  }
});

// =====================================
// GET MY PURCHASES
// =====================================
router.get(
  "/my",
  authenticate,
  async (req, res) => {
    try {
      const purchases =
        await prisma.packagePurchase.findMany({
          where: {
            userId: req.user.id
          },

          include: {
            package: true,
            transactions: true,
            referralCommissions: {
              include: {
                receiver: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },

          orderBy: {
            createdAt: "desc"
          }
        });

      res.json({
        success: true,
        purchases
      });
    } catch (error) {
      console.error(
        "Load purchases error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load purchases"
      });
    }
  }
);

// =====================================
// GET ONE PURCHASE
// =====================================
router.get(
  "/:id",
  authenticate,
  async (req, res) => {
    try {
      const purchase =
        await prisma.packagePurchase.findFirst({
          where: {
            id: req.params.id,
            userId: req.user.id
          },

          include: {
            package: true,
            transactions: true,
            referralCommissions: {
              include: {
                receiver: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        });

      if (!purchase) {
        return res.status(404).json({
          message:
            "Purchase not found"
        });
      }

      res.json({
        success: true,
        purchase
      });
    } catch (error) {
      console.error(
        "Get purchase error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load purchase"
      });
    }
  }
);

// =====================================
// PAYMENT VERIFICATION
// =====================================
// NOTE:
// Hii ni prototype callback.
// Production lazima itumie official
// payment provider webhook + verification.
router.post(
  "/callback",
  async (req, res) => {
    try {
      const {
        purchaseId,
        transactionId,
        status
      } = req.body;

      if (!purchaseId || !status) {
        return res.status(400).json({
          message:
            "Purchase ID and status are required"
        });
      }

      const allowedStatuses = [
        "PENDING",
        "SUCCESS",
        "FAILED"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Invalid payment status"
        });
      }

      // =================================
      // FAILED
      // =================================
      if (status === "FAILED") {
        const purchase =
          await prisma.packagePurchase.findUnique({
            where: {
              id: purchaseId
            }
          });

        if (!purchase) {
          return res.status(404).json({
            message:
              "Purchase not found"
          });
        }

        if (purchase.status === "SUCCESS") {
          return res.status(400).json({
            message:
              "Purchase has already been confirmed"
          });
        }

        const updatedPurchase =
          await prisma.packagePurchase.update({
            where: {
              id: purchaseId
            },

            data: {
              status: "FAILED"
            }
          });

        return res.json({
          message:
            "Payment marked as failed",

          purchase:
            updatedPurchase
        });
      }

      // =================================
      // PENDING
      // =================================
      if (status === "PENDING") {
        const purchase =
          await prisma.packagePurchase.findUnique({
            where: {
              id: purchaseId
            },

            include: {
              package: true
            }
          });

        if (!purchase) {
          return res.status(404).json({
            message:
              "Purchase not found"
          });
        }

        return res.json({
          message:
            "Payment is still pending",

          purchase
        });
      }

      // =================================
      // SUCCESS
      // =================================

      const result =
        await prisma.$transaction(
          async (tx) => {
            // ---------------------------------
            // Atomically change PENDING -> SUCCESS
            // ---------------------------------
            const activation =
              await tx.packagePurchase.updateMany({
                where: {
                  id: purchaseId,
                  status: "PENDING"
                },

                data: {
                  status: "SUCCESS",

                  purchasedAt:
                    new Date(),

                  cycleStartDate:
                    new Date(),

                  cycleEndDate:
                    new Date(
                      Date.now() +
                      (CYCLE_DAYS - 1) *
                        24 *
                        60 *
                        60 *
                        1000
                    ),

                  dailyRate:
                    DAILY_RATE,

                  totalCredited:
                    0
                }
              });

            // ---------------------------------
            // Prevent duplicate callback
            // ---------------------------------
            if (activation.count === 0) {
              const existingPurchase =
                await tx.packagePurchase.findUnique({
                  where: {
                    id: purchaseId
                  },

                  include: {
                    package: true
                  }
                });

              if (!existingPurchase) {
                throw new Error(
                  "Purchase not found"
                );
              }

              if (
                existingPurchase.status ===
                "SUCCESS"
              ) {
                return {
                  alreadyProcessed: true,
                  purchase:
                    existingPurchase
                };
              }

              throw new Error(
                "Purchase cannot be activated"
              );
            }

            const purchase =
              await tx.packagePurchase.findUnique({
                where: {
                  id: purchaseId
                },

                include: {
                  package: true,
                  user: true
                }
              });

            if (!purchase) {
              throw new Error(
                "Purchase not found after activation"
              );
            }

            // ---------------------------------
            // Check purchase limit again
            // ---------------------------------
            const successfulPurchases =
              await tx.packagePurchase.count({
                where: {
                  userId:
                    purchase.userId,

                  packageId:
                    purchase.packageId,

                  status:
                    "SUCCESS"
                }
              });

            if (
              successfulPurchases >
              purchase.package.maxPurchases
            ) {
              throw new Error(
                "Package purchase limit exceeded"
              );
            }

            // =================================
            // REFERRAL CHAIN
            // =================================

            let currentUserId =
              purchase.user.referredById;

            const referralLevels = [
              {
                level: "A",
                rate:
                  REFERRAL_RATES.A
              },
              {
                level: "B",
                rate:
                  REFERRAL_RATES.B
              },
              {
                level: "C",
                rate:
                  REFERRAL_RATES.C
              }
            ];

            const commissions = [];

            for (
              let index = 0;
              index <
              referralLevels.length;
              index++
            ) {
              if (!currentUserId) {
                break;
              }

              const levelInfo =
                referralLevels[index];

              const receiver =
                await tx.user.findUnique({
                  where: {
                    id: currentUserId
                  }
                });

              if (!receiver) {
                break;
              }

              const commissionAmount =
                Number(
                  purchase.amountPaid
                ) *
                levelInfo.rate;

              const reference =
                `REFERRAL-${purchase.id}-${levelInfo.level}`;

              // ---------------------------------
              // Duplicate protection
              // ---------------------------------
              const existingCommission =
                await tx.referralCommission.findUnique({
                  where: {
                    reference
                  }
                });

              if (!existingCommission) {
                const commission =
                  await tx.referralCommission.create({
                    data: {
                      receiverId:
                        receiver.id,

                      sourceUserId:
                        purchase.userId,

                      purchaseId:
                        purchase.id,

                      level:
                        levelInfo.level,

                      rate:
                        levelInfo.rate,

                      amount:
                        commissionAmount,

                      reference
                    }
                  });

                // ---------------------------------
                // Put commission into receiver wallet
                // ---------------------------------
                await tx.walletTransaction.create({
                  data: {
                    userId:
                      receiver.id,

                    purchaseId:
                      purchase.id,

                    type:
                      "CREDIT",

                    amount:
                      commissionAmount,

                    reference:
                      `WALLET-${reference}`,

                    description:
                      `Referral commission Level ${levelInfo.level}`
                  }
                });

                commissions.push(
                  commission
                );
              }

              // ---------------------------------
              // Move to next referral level
              // ---------------------------------
              currentUserId =
                receiver.referredById;
            }

            return {
              alreadyProcessed: false,
              purchase,
              commissions
            };
          }
        );

      // =================================
      // ALREADY PROCESSED
      // =================================
      if (result.alreadyProcessed) {
        return res.status(200).json({
          message:
            "Payment was already processed",

          purchase:
            result.purchase,

          commissions: []
        });
      }

      // =================================
      // RESPONSE
      // =================================
      res.json({
        message:
          "Package payment verified successfully",

        purchase:
          result.purchase,

        referralCommissions:
          result.commissions,

        referralRates: {
          A: "5%",
          B: "2%",
          C: "1%"
        },

        cycleDays:
          CYCLE_DAYS,

        dailyRate:
          DAILY_RATE,

        transactionId:
          transactionId || null
      });
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      res.status(500).json({
        message:
          "Payment verification failed"
      });
    }
  }
);

module.exports = router;
