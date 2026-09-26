const express = require("express");

const {
  authenticate,
  requireAdmin
} = require("./middleware/authMiddleware");

const router = express.Router();

const packages = [
  {
    id: "1",
    name: "Package 1",
    price: 35000,
    description: "Package ya kwanza",
    maxPurchases: 2,
    active: true
  },
  {
    id: "2",
    name: "Package 2",
    price: 70000,
    description: "Package ya pili",
    maxPurchases: 4,
    active: true
  }
];

// =====================================
// GET ACTIVE PACKAGES
// Public
// =====================================
router.get("/", (req, res) => {
  const activePackages = packages.filter(
    pkg => pkg.active
  );

  res.json({
    success: true,
    packages: activePackages
  });
});

// =====================================
// GET ONE PACKAGE
// Public
// =====================================
router.get("/:id", (req, res) => {
  const pkg = packages.find(
    pkg => pkg.id === req.params.id && pkg.active
  );

  if (!pkg) {
    return res.status(404).json({
      message: "Package not found"
    });
  }

  res.json({
    success: true,
    package: pkg
  });
});

// =====================================
// CREATE PACKAGE
// Admin only
// =====================================
router.post(
  "/",
  authenticate,
  requireAdmin,
  (req, res) => {
    const {
      name,
      price,
      description,
      maxPurchases
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        message: "Name and price are required"
      });
    }

    const numericPrice = Number(price);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {
      return res.status(400).json({
        message: "Price must be greater than 0"
      });
    }

    const numericMaxPurchases =
      maxPurchases === undefined
        ? 4
        : Number(maxPurchases);

    if (
      Number.isNaN(numericMaxPurchases) ||
      numericMaxPurchases <= 0
    ) {
      return res.status(400).json({
        message: "maxPurchases must be greater than 0"
      });
    }

    const newPackage = {
      id: String(packages.length + 1),
      name,
      price: numericPrice,
      description: description || "",
      maxPurchases: numericMaxPurchases,
      active: true
    };

    packages.push(newPackage);

    res.status(201).json({
      message: "Package created successfully",
      package: newPackage
    });
  }
);

// =====================================
// UPDATE PACKAGE
// Admin only
// =====================================
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  (req, res) => {
    const pkg = packages.find(
      pkg => pkg.id === req.params.id
    );

    if (!pkg) {
      return res.status(404).json({
        message: "Package not found"
      });
    }

    const {
      name,
      price,
      description,
      maxPurchases,
      active
    } = req.body;

    if (name !== undefined) {
      pkg.name = name;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          message: "Price must be greater than 0"
        });
      }

      pkg.price = numericPrice;
    }

    if (description !== undefined) {
      pkg.description = description;
    }

    if (maxPurchases !== undefined) {
      const numericMaxPurchases =
        Number(maxPurchases);

      if (
        Number.isNaN(numericMaxPurchases) ||
        numericMaxPurchases <= 0
      ) {
        return res.status(400).json({
          message: "maxPurchases must be greater than 0"
        });
      }

      pkg.maxPurchases = numericMaxPurchases;
    }

    if (active !== undefined) {
      pkg.active = Boolean(active);
    }

    res.json({
      message: "Package updated successfully",
      package: pkg
    });
  }
);

// =====================================
// DISABLE PACKAGE
// Admin only
// =====================================
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  (req, res) => {
    const pkg = packages.find(
      pkg => pkg.id === req.params.id
    );

    if (!pkg) {
      return res.status(404).json({
        message: "Package not found"
      });
    }

    pkg.active = false;

    res.json({
      message: "Package disabled successfully",
      package: pkg
    });
  }
);

module.exports = router;
