const express = require("express");
const cors = require("cors");
const authRouter = require("./auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "RoomRent",
    status: "running",
    message: "Welcome to RoomRent API"
  });
});

// Authentication
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`RoomRent API running on port ${PORT}`);
});
