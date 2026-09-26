const express = require("express");

const router = express.Router();

const bookings = [];

// Create booking
router.post("/", (req, res) => {
  const {
    userId,
    roomId,
    startDate,
    endDate,
    totalAmount
  } = req.body;

  if (
    !userId ||
    !roomId ||
    !startDate ||
    !endDate ||
    !totalAmount
  ) {
    return res.status(400).json({
      message: "All booking fields are required"
    });
  }

  const booking = {
    id: String(bookings.length + 1),
    userId,
    roomId,
    startDate,
    endDate,
    totalAmount: Number(totalAmount),
    status: "PENDING",
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);

  res.status(201).json({
    message: "Booking created successfully",
    booking
  });
});

// Get bookings for a customer
router.get("/user/:userId", (req, res) => {
  const userBookings = bookings.filter(
    booking => booking.userId === req.params.userId
  );

  res.json({
    success: true,
    bookings: userBookings
  });
});

// Get one booking
router.get("/:id", (req, res) => {
  const booking = bookings.find(
    booking => booking.id === req.params.id
  );

  if (!booking) {
    return res.status(404).json({
      message: "Booking not found"
    });
  }

  res.json(booking);
});

// Update booking status
router.put("/:id/status", (req, res) => {
  const booking = bookings.find(
    booking => booking.id === req.params.id
  );

  if (!booking) {
    return res.status(404).json({
      message: "Booking not found"
    });
  }

  const { status } = req.body;

  const allowedStatuses = [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED"
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid booking status"
    });
  }

  booking.status = status;

  res.json({
    message: "Booking status updated",
    booking
  });
});

module.exports = router;
