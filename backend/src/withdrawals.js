const express = require("express");

const {
  authenticate,
  requireAdmin
} = require("./middleware/authMiddleware");

const router = express.Router();

const withdrawals = [];

const MIN_WITHDRAWAL = 3000;
const WITHDRAWAL_FEE_RATE = 0.10;

const allowedMethods = [
  "AIRTEL_MONEY",
  "HALOPESA",
  "TIGOPESA"
];

// =====================================
// CREATE WITHDRAWAL REQUEST
// Customer
// =====================================

router.post("/", authenticate, (req, res) => {
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

  const numericAmount = Number(amount);

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
      message: "Unsupported withdrawal method"
    });
  }

  const fee =
    numericAmount * WITHDRAWAL_FEE_RATE;

  const netAmount =
    numericAmount - fee;

  const withdrawal = {
    id: String(withdrawals.length + 1),

    userId: req.user.id,

    amount: numericAmount,

    fee,

    netAmount,

    method,

    phone,

    status: "PENDING",

    transactionId: null,

    processedAt: null,

    createdAt: new Date().toISOString()
  };

  withdrawals.push(withdrawal);

  res.status(201).json({
    message:
      "Withdrawal request submitted successfully",

    withdrawal
  });
});

// =====================================
// GET MY WITHDRAWALS
// Customer
// =====================================

router.get("/my", authenticate, (req, res) => {
  const userWithdrawals =
    withdrawals.filter(
      withdrawal =>
        withdrawal.userId === req.user.id
    );

  res.json({
    success: true,
    withdrawals: userWithdrawals
  });
});

// =====================================
// GET ONE WITHDRAWAL
// Customer
// =====================================

router.get("/:id", authenticate, (req, res) => {
  const withdrawal =
    withdrawals.find(
      withdrawal =>
        withdrawal.id === req.params.id &&
        withdrawal.userId === req.user.id
    );

  if (!withdrawal) {
    return res.status(404).json({
      message: "Withdrawal not found"
    });
  }

  res.json({
    success: true,
    withdrawal
  });
});

// =====================================
// GET ALL WITHDRAWALS
// Admin
// =====================================

router.get(
  "/admin/all",
  authenticate,
  requireAdmin,
  (req, res) => {
    res.json({
      success: true,
      withdrawals
    });
  }
);

// =====================================
// UPDATE WITHDRAWAL STATUS
// Admin
// =====================================

router.put(
  "/admin/:id/status",
  authenticate,
  requireAdmin,
  (req, res) => {
    const withdrawal =
      withdrawals.find(
        withdrawal =>
          withdrawal.id === req.params.id
      );

    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal not found"
      });
    }

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

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid withdrawal status"
      });
    }

    withdrawal.status = status;

    if (transactionId !== undefined) {
      withdrawal.transactionId =
        transactionId;
    }

    if (
      status === "PAID" ||
      status === "FAILED" ||
      status === "CANCELLED"
    ) {
      withdrawal.processedAt =
        new Date().toISOString();
    }

    res.json({
      message:
        "Withdrawal status updated successfully",

      withdrawal
    });
  }
);

module.exports = router;
