const express = require("express");
const { PrismaClient } = require("@prisma/client");

const {
  authenticate
} = require("./middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

const DAILY_RATE = 0.04;
const CYCLE_DAYS = 50;

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
        message: "Unsupported payment method"
      });
    }

    // Find package
    const selectedPackage =
      await prisma.package.findUnique({
        where: {
          id: packageId
        }
      });

    if (!selectedPackage) {
      return res.status(404).json({
        message: "Package not found"
      });
    }

    if (!selectedPackage.active) {
      return res.status(400).json({
        message: "Package is not active"
      });
    }

    // Count customer's purchases
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

    // Create pending purchase
    const purchase =
      await prisma.packagePurchase.create({
        data: {
          userId: req.user.id,
          packageId: selectedPackage.id,

          amountPaid:
            selectedPackage.price,

          status: "PENDING",

          dailyRate: DAILY_RATE,

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
        method: paymentMethod,
        amount: selectedPackage.price,

        status: "PENDING",

        message:
          "Complete payment and wait for verification."
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to create package purchase"
    });
  }
});

// =====================================
// GET MY PURCHASES
// =====================================

router.get("/my", authenticate, async (req, res) => {
  try {
    const purchases =
      await prisma.packagePurchase.findMany({
        where: {
          userId: req.user.id
        },

        include: {
          package: true,
          transactions: true
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
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load purchases"
    });
  }
});

// =====================================
// GET ONE PURCHASE
// =====================================

router.get("/:id", authenticate, async (req, res) => {
  try {
    const purchase =
      await prisma.packagePurchase.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id
        },

        include: {
          package: true,
          transactions: true
        }
      });

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found"
      });
    }

    res.json({
      success: true,
      purchase
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load purchase"
    });
  }
});

// =====================================
// PAYMENT VERIFICATION
// =====================================

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

      // Prevent changing an already successful payment
      if (
        purchase.status === "SUCCESS"
      ) {
        return res.status(400).json({
          message:
            "Purchase has already been confirmed"
        });
      }

      if (status === "FAILED") {
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

          purchase: updatedPurchase
        });
      }

      if (status === "PENDING") {
        return res.json({
          message:
            "Payment is still pending",

          purchase
        });
      }

      // =================================
      // SUCCESS
      // =================================

      const now = new Date();

      const cycleEnd =
        new Date(now);

      cycleEnd.setDate(
        cycleEnd.getDate() +
        CYCLE_DAYS
      );

      const dailyCredit =
        Number(purchase.amountPaid) *
        DAILY_RATE;

      const updatedPurchase =
        await prisma.$transaction(
          async (tx) => {

            const updated =
              await tx.packagePurchase.update({
                where: {
                  id: purchaseId
                },

                data: {
                  status: "SUCCESS",

                  purchasedAt: now,

                  cycleStartDate: now,

                  cycleEndDate: cycleEnd,

                  dailyRate: DAILY_RATE,

                  totalCredited: 0
                }
              });

            // Record the original verified payment
            await tx.walletTransaction.create({
              data: {
                userId:
                  purchase.userId,

                purchaseId:
                  purchase.id,

                type: "CREDIT",

                amount:
                  purchase.amountPaid,

                reference:
                  transactionId || undefined,

                description:
                  "Verified package payment"
              }
            });

            return updated;
          }
        );

      res.json({
        message:
          "Package payment verified and package activated",

        purchase: updatedPurchase,

        dailyCredit,

        cycleDays: CYCLE_DAYS,

        transactionId:
          transactionId || null
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Payment verification failed"
      });
    }
  }
);

module.exports = router;
