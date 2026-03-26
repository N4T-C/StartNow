const express = require("express");
const UserShopPin = require("../models/UserShopPin");

const router = express.Router();

router.get("/pins", async (req, res) => {
  try {
    const { userId, idea } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId required" });
    }
    const query = { userId };
    if (idea) {
      // Fuzzy match for minor variations
      query.idea = { $regex: new RegExp(`^${idea.trim()}$`, "i") };
    }

    const pins = await UserShopPin.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, pins });
  } catch (err) {
    console.error("GET /pins error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/pins", async (req, res) => {
  try {
    const { userId, userEmail, name, type, lat, lng, address, idea } = req.body;
    
    if (!userId || !name || !type || !idea || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newPin = await UserShopPin.create({
      userId,
      userEmail,
      name,
      type,
      lat,
      lng,
      address: address || "Unknown Location",
      idea,
    });

    return res.status(201).json({ success: true, pin: newPin });
  } catch (err) {
    console.error("POST /pins error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/pins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!id || !userId) {
      return res.status(400).json({ success: false, message: "ID and userId required" });
    }

    const deleted = await UserShopPin.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Pin not found or unauthorized" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("DELETE /pins error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
