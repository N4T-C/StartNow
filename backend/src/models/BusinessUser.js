const mongoose = require("mongoose");

const businessUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
  },
  { versionKey: false },
);

module.exports = mongoose.model("BusinessUser", businessUserSchema);
