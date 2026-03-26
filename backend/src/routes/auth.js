const express = require("express");
const BusinessUser = require("../models/BusinessUser");
const { seedBusinessUsers } = require("../utils/seedBusinessUsers");

const router = express.Router();

router.post("/auth/business-login", async (req, res) => {
  try {
    // Seed on first use if the collection is empty
    await seedBusinessUsers();

    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await BusinessUser.findOne({ email }).lean();

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid business credentials" });
    }

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        companyName: user.companyName,
        role: user.role,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server error during authentication." });
  }
});

module.exports = router;
