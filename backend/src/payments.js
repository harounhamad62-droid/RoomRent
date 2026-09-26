const express = require("express");

const router = express.Router();

const payments = [];

const PAYMENT_DETAILS = {
  AIRTEL_MONEY: {
    provider: "Airtel Money",
    name: "HARUNA HAMAD",
    number: "0667872515"
  },

  HALOPESA: {
    provider: "HaloPesa",
    name: "SADA BAKAR",
    number: "0626486148"
  },

  TIGOPESA: {
    provider: "Tigo Pesa",
    name: "HARUNA HAMAD",
    number: "0651590936"
  }
};

const allowedMethods = Object.keys(PAYMENT_DETAILS);

// Create payment
router.post("/", (req, res) => {
  const {
    bookingId,
    method,
    amount,
    phone
  } = req.body;

  if (!bookingId || !method || !amount || !phone) {
    return res.status(400).json({
      message:
        "Booking ID, payment method, amount and phone are required"
    });
  }

  if (!allowedMethods.includes(method)) {
    return res.status(400).json({
      message: "Unsupported payment method"
    });
  }

  const paymentInfo = PAYMENT_DETAILS[method];

  const payment = {
    id: String(payments.length + 1),
    bookingId,
    method,
    amount: Number(amount),
    customerPhone: phone,

    paymentProvider: paymentInfo.provider,
    paymentName: paymentInfo.name,
    paymentNumber: paymentInfo.number,

    status: "PENDING",
    transactionId: null,
    createdAt: new Date().toISOString()
  };

  payments.push(payment);

  res.status(201).json({
    message: "Payment request created",
    instructions: {
      provider: paymentInfo.provider,
      name: paymentInfo.name,
      number: paymentInfo.number,
      amount: Number(amount),
      message:
        "Tuma kiasi cha booking kwenye namba iliyoonyeshwa kisha subiri uthibitisho wa malipo."
    },
    payment
  });
});

// Get payment by ID
router.get("/:id", (req, res) => {
  const payment = payments.find(
    payment => payment.id === req.params.id
  );

  if (!payment) {
    return res.status(404).json({
      message: "Payment not found"
    });
  }

  res.json({
    success: true,
    payment
  });
});

// Get all payments
router.get("/", (req, res) => {
  res.json({
    success: true,
    payments
  });
});

// Payment callback / webhook
router.post("/callback", (req, res) => {
  const {
    paymentId,
    transactionId,
    status
  } = req.body;

  const payment = payments.find(
    payment => payment.id === paymentId
  );

  if (!payment) {
    return res.status(404).json({
      message: "Payment not found"
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

  payment.transactionId = transactionId || null;
  payment.status = status;

  res.json({
    message: "Payment status updated",
    payment
  });
});

module.exports = router;
