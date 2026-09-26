const express = require("express");
const { PrismaClient } = require("@prisma/client");

const {
  authenticate,
  requireAdmin
} = require("./middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// =====================================
// DEFAULT PACKAGES
// =====================================
const DEFAULT_PACKAGES = [
  {
    id: "1",
    name: "Package 1",
    price: 35000,
    description: "Package ya kwanza",
    maxPurchases: 2
  },
  {
    id: "2",
    name: "Package 2",
    price: 70000,
    description: "Package ya pili",
    maxPurchases: 4
  }
];

// =====================================
// ENSURE DEFAULT PACKAGES EXIST
// =====================================
async function ensureDefaultPackages() {
  for (const pkg of DEFAULT_PACKAGES) {
    await prisma.package.upsert({
      where: {
        id: pkg.id
      },

      update: {},

      create: {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        maxPurchases: pkg.maxPurchases,
        active: true
      }
    });
  }
}

// =====================================
// GET ACTIVE PACKAGES
// =====================================
router.get(
  "/",
  async (req, res) => {
    try {
      await ensureDefaultPackages();

      const packages =
        await prisma.package.findMany({
          where: {
            active: true
          },

          orderBy: {
            price: "asc"
          }
        });

      res.json({
        success: true,
        packages
      });
    } catch (error) {
      console.error(
        "Get packages error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load packages"
      });
    }
  }
);

// =====================================
// GET ONE ACTIVE PACKAGE
// =====================================
router.get(
  "/:id",
  async (req, res) => {
    try {
      await ensureDefaultPackages();

      const pkg =
        await prisma.package.findFirst({
          where: {
            id: req.params.id,
            active: true
          }
        });

      if (!pkg) {
        return res.status(404).json({
          message:
            "Package not found"
        });
      }

      res.json({
        success: true,
        package: pkg
      });
    } catch (error) {
      console.error(
        "Get package error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load package"
      });
    }
  }
);

// =====================================
// CREATE PACKAGE - ADMIN
// =====================================
router.post(
  "/",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        price,
        description,
        maxPurchases
      } = req.body;

      if (
        !name ||
        price === undefined
      ) {
        return res.status(400).json({
          message:
            "Name and price are required"
        });
      }

      const numericPrice =
        Number(price);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          message:
            "Price must be greater than 0"
        });
      }

      const numericMaxPurchases =
        maxPurchases === undefined
          ? 4
          : Number(maxPurchases);

      if (
        Number.isNaN(
          numericMaxPurchases
        ) ||
        numericMaxPurchases <= 0
      ) {
        return res.status(400).json({
          message:
            "maxPurchases must be greater than 0"
        });
      }

      const newPackage =
        await prisma.package.create({
          data: {
            name:
              String(name).trim(),

            price:
              numericPrice,

            description:
              description
                ? String(description).trim()
                : null,

            maxPurchases:
              numericMaxPurchases,

            active: true
          }
        });

      res.status(201).json({
        message:
          "Package created successfully",

        package:
          newPackage
      });
    } catch (error) {
      console.error(
        "Create package error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create package"
      });
    }
  }
);

// =====================================
// UPDATE PACKAGE - ADMIN
// =====================================
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        price,
        description,
        maxPurchases,
        active
      } = req.body;

      const existingPackage =
        await prisma.package.findUnique({
          where: {
            id: req.params.id
          }
        });

      if (!existingPackage) {
        return res.status(404).json({
          message:
            "Package not found"
        });
      }

      const data = {};

      if (name !== undefined) {
        data.name =
          String(name).trim();
      }

      if (price !== undefined) {
        const numericPrice =
          Number(price);

        if (
          Number.isNaN(
            numericPrice
          ) ||
          numericPrice <= 0
        ) {
          return res.status(400).json({
            message:
              "Price must be greater than 0"
          });
        }

        data.price =
          numericPrice;
      }

      if (
        description !==
        undefined
      ) {
        data.description =
          description
            ? String(description).trim()
            : null;
      }

      if (
        maxPurchases !==
        undefined
      ) {
        const numericMaxPurchases =
          Number(maxPurchases);

        if (
          Number.isNaN(
            numericMaxPurchases
          ) ||
          numericMaxPurchases <= 0
        ) {
          return res.status(400).json({
            message:
              "maxPurchases must be greater than 0"
          });
        }

        data.maxPurchases =
          numericMaxPurchases;
      }

      if (active !== undefined) {
        data.active =
          Boolean(active);
      }

      const updatedPackage =
        await prisma.package.update({
          where: {
            id: req.params.id
          },

          data
        });

      res.json({
        message:
          "Package updated successfully",

        package:
          updatedPackage
      });
    } catch (error) {
      console.error(
        "Update package error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update package"
      });
    }
  }
);

// =====================================
// DISABLE PACKAGE - ADMIN
// =====================================
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const existingPackage =
        await prisma.package.findUnique({
          where: {
            id: req.params.id
          }
        });

      if (!existingPackage) {
        return res.status(404).json({
          message:
            "Package not found"
        });
      }

      const disabledPackage =
        await prisma.package.update({
          where: {
            id: req.params.id
          },

          data: {
            active: false
          }
        });

      res.json({
        message:
          "Package disabled successfully",

        package:
          disabledPackage
      });
    } catch (error) {
      console.error(
        "Disable package error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to disable package"
      });
    }
  }
);

module.exports = router;
