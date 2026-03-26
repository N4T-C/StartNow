const mongoose = require("mongoose");

const UserShopPinSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['shop', 'warehouse', 'pos'], required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String, required: true },
  idea: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserShopPin", UserShopPinSchema);
