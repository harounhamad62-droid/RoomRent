const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET =
  process.env.JWT_SECRET || "development-secret";

// =====================================
// CREATE UNIQUE REFERRAL CODE
// =====================================
async function createReferralCode(name) {
  const prefix =
    String(name || "USER")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4) || "USER";

  for (let attempt = 0; attempt < 20; attempt++) {
    const random = Math.floor(
      100000 + Math.random() * 900000
    );

    const code = `${prefix}${random}`;

    const existing =
      await prisma.user.findUnique({
        where: {
          referralCode: code
        }
      });

    if (!existing) {
      return code;
    }
  }

  throw new Error(
    "Failed to generate unique referral code"
  );
}

// =====================================
// REGISTER CUSTOMER
// =====================================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      referralCode
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required"
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters"
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail
        }
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "Email already registered"
      });
    }

    let referredById = null;

    if (referralCode) {
      const normalizedReferralCode =
        String(referralCode)
          .trim()
          .toUpperCase();

      const referrer =
        await prisma.user.findUnique({
          where: {
            referralCode:
              normalizedReferralCode
          }
        });

      if (!referrer) {
        return res.status(400).json({
          message:
            "Invalid referral code"
        });
      }

      referredById = referrer.id;
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const newReferralCode =
      await createReferralCode(name);

    const user =
      await prisma.user.create({
        data: {
          name:
            String(name).trim(),

          email:
            normalizedEmail,

          phone:
            phone
              ? String(phone).trim()
              : null,

          password:
            hashedPassword,

          role:
            "CUSTOMER",

          referralCode:
            newReferralCode,

          referredById
        }
      });

    res.status(201).json({
      message:
        "Account created successfully",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode:
          user.referralCode
      }
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      message:
        "Registration failed"
    });
  }
});

// =====================================
// LOGIN
// =====================================
router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required"
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const user =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail
        }
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          role: user.role
        },
        JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

    res.json({
      message:
        "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode:
          user.referralCode
      }
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message:
        "Login failed"
    });
  }
});

// =====================================
// GET MY REFERRAL INFORMATION
// =====================================
router.get(
  "/referral",
  async (req, res) => {
    try {
      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res.status(401).json({
          message:
            "Authentication required"
        });
      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          JWT_SECRET
        );

      const user =
        await prisma.user.findUnique({
          where: {
            id: decoded.id
          },

          include: {
            referrals: {
              select: {
                id: true,
                name: true,
                createdAt: true
              }
            }
          }
        });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found"
        });
      }

      const appUrl =
        process.env.APP_URL ||
        "https://roomrent.app";

      const referralLink =
        `${appUrl}/register?ref=${encodeURIComponent(
          user.referralCode
        )}`;

      res.json({
        success: true,

        referral: {
          referralCode:
            user.referralCode,

          referralLink,

          totalReferrals:
            user.referrals.length,

          referrals:
            user.referrals
        }
      });
    } catch (error) {
      console.error(
        "Referral information error:",
        error
      );

      res.status(401).json({
        message:
          "Invalid or expired token"
      });
    }
  }
);

// =====================================
// ADMIN LOGIN
// =====================================
// Admin credentials come from environment
// variables, NOT from GitHub/source code.
//
// Required:
// ADMIN_EMAIL
// ADMIN_PASSWORD
//
// On successful login, the system creates
// or updates the corresponding database
// user as ADMIN.
router.post(
  "/admin-login",
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      const adminEmail =
        process.env.ADMIN_EMAIL;

      const adminPassword =
        process.env.ADMIN_PASSWORD;

      if (
        !adminEmail ||
        !adminPassword
      ) {
        return res.status(503).json({
          message:
            "Admin login is not configured"
        });
      }

      if (
        String(email)
          .trim()
          .toLowerCase() !==
        String(adminEmail)
          .trim()
          .toLowerCase()
      ) {
        return res.status(401).json({
          message:
            "Invalid admin credentials"
        });
      }

      if (
        String(password) !==
        String(adminPassword)
      ) {
        return res.status(401).json({
          message:
            "Invalid admin credentials"
        });
      }

      const normalizedEmail =
        String(adminEmail)
          .trim()
          .toLowerCase();

      let admin =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail
          }
        });

      const hashedPassword =
        await bcrypt.hash(
          adminPassword,
          12
        );

      if (!admin) {
        const referralCode =
          await createReferralCode(
            "ADMIN"
          );

        admin =
          await prisma.user.create({
            data: {
              name:
                "RoomRent Admin",

              email:
                normalizedEmail,

              password:
                hashedPassword,

              role:
                "ADMIN",

              referralCode
            }
          });
      } else if (
        admin.role !== "ADMIN"
      ) {
        admin =
          await prisma.user.update({
            where: {
              id: admin.id
            },

            data: {
              role:
                "ADMIN",

              password:
                hashedPassword
            }
          });
      }

      const token =
        jwt.sign(
          {
            id: admin.id,
            role: "ADMIN"
          },
          JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );

      res.json({
        message:
          "Admin login successful",

        token,

        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      res.status(500).json({
        message:
          "Admin login failed"
      });
    }
  }
);

module.exports = router;
