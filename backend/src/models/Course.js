const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    duration: { type: String, required: true },
    priceInr: { type: Number, required: true },
    highlights: { type: [String], default: [] },
    isPremium: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Course", courseSchema);
