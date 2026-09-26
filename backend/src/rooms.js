const express = require("express");

const router = express.Router();

const rooms = [];

// Get all rooms
router.get("/", (req, res) => {
  res.json({
    success: true,
    rooms
  });
});

// Get one room
router.get("/:id", (req, res) => {
  const room = rooms.find(room => room.id === req.params.id);

  if (!room) {
    return res.status(404).json({
      message: "Room not found"
    });
  }

  res.json(room);
});

// Add room
router.post("/", (req, res) => {
  const {
    title,
    description,
    location,
    price,
    images
  } = req.body;

  if (!title || !location || !price) {
    return res.status(400).json({
      message: "Title, location and price are required"
    });
  }

  const room = {
    id: String(rooms.length + 1),
    title,
    description: description || "",
    location,
    price: Number(price),
    images: Array.isArray(images) ? images : [],
    status: "AVAILABLE"
  };

  rooms.push(room);

  res.status(201).json({
    message: "Room created successfully",
    room
  });
});

// Update room
router.put("/:id", (req, res) => {
  const room = rooms.find(room => room.id === req.params.id);

  if (!room) {
    return res.status(404).json({
      message: "Room not found"
    });
  }

  const {
    title,
    description,
    location,
    price,
    images,
    status
  } = req.body;

  if (title !== undefined) room.title = title;
  if (description !== undefined) room.description = description;
  if (location !== undefined) room.location = location;
  if (price !== undefined) room.price = Number(price);
  if (images !== undefined) room.images = images;
  if (status !== undefined) room.status = status;

  res.json({
    message: "Room updated successfully",
    room
  });
});

// Delete room
router.delete("/:id", (req, res) => {
  const index = rooms.findIndex(room => room.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: "Room not found"
    });
  }

  const deletedRoom = rooms.splice(index, 1);

  res.json({
    message: "Room deleted successfully",
    room: deletedRoom[0]
  });
});

module.exports = router;
