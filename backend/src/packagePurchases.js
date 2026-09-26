const express = require("express");

const {
  authenticate
} = require("./middleware/authMiddleware");

const router = express.Router();

const purchases = [];

// =====================================
// PACKAGE PURCHASE
// =====================================

router.post("/", authenticate, (req, res) => {
  const {
    packageId,
    amount,
    paymentMethod
  } = req.body;

  if (!packageId || amount === undefined || !paymentMethod) {
    return res.status(400).json({
      message:
        "Package ID, amount and payment method are required"
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

  const numericAmount = Number(amount);

  if (
    Number.isNaN(numericAmount) ||
    numericAmount <= 0
  ) {
    return res.status(400).json({
      message: "Invalid package amount"
    });
  }

  const purchase = {
    id: String(purchases.length + 1),

    userId: req.user.id,

    packageId,

    amount: numericAmount,

    paymentMethod,

    status: "PENDING",

    transactionId: null,

    createdAt: new Date().toISOString(),

    paidAt: null
  };

  purchases.push(purchase);

  res.status(201).json({
    message:
      "Package purchase request created successfully",

    purchase,

    nextStep:
      "Complete the payment and wait for payment verification."
  });
});

// =====================================
// GET MY PURCHASES
// =====================================

router.get("/my", authenticate, (req, res) => {
  const userPurchases = purchases.filter(
    purchase =>
      purchase.userId === req.user.id
  );

  res.json({
    success: true,
    purchases: userPurchases
  });
});

// =====================================
// GET ONE PURCHASE
// =====================================

router.get("/:id", authenticate, (req, res) => {
  const purchase = purchases.find(
    purchase =>
      purchase.id === req.params.id &&
      purchase.userId === req.user.id
  );

  if (!purchase) {
    return res.status(404).json({
      message: "Purchase not found"
    });
  }

  res.json({
    success: true,
    purchase
  });
});

// =====================================
// PAYMENT VERIFICATION CALLBACK
// =====================================

router.post(
  "/callback",
  (req, res) => {
    const {
      purchaseId,
      transactionId,
      status
    } = req.body;

    const purchase = purchases.find(
      purchase =>
        purchase.id === purchaseId
    );

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found"
      });
    }

    const allowedStatuses = [
      "PENDING",
      "SUCCESS",
      "FAILED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid payment status"
      });
    }

    purchase.status = status;

    purchase.transactionId =
      transactionId || null;

    if (status === "SUCCESS") {
      purchase.paidAt =
        new Date().toISOString();
    }

    res.json({
      message:
        "Purchase payment status updated",
      purchase
    });
  }
);

module.exports = router;
