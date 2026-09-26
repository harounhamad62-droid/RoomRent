const express = require("express");
const cors = require("cors");

const authRouter = require("./auth");
const roomsRouter = require("./rooms");
const bookingsRouter = require("./bookings");
const paymentsRouter = require("./payments");
const packagesRouter = require("./packages");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {
  res.json({
    app: "RoomRent",
    status: "running",
    message: "Welcome to RoomRent API"
  });
});

// ===============================
// AUTHENTICATION
// ===============================
app.use("/api/auth", authRouter);

// ===============================
// ROOMS
// ===============================
app.use("/api/rooms", roomsRouter);

// ===============================
// BOOKINGS
// ===============================
app.use("/api/bookings", bookingsRouter);

// ===============================
// PAYMENTS
// ===============================
app.use("/api/payments", paymentsRouter);

// ===============================
// PACKAGES
// ===============================
app.use("/api/packages", packagesRouter);

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// ===============================
// SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `RoomRent API running on port ${PORT}`
  );
});
