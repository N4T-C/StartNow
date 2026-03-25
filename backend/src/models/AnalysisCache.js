const mongoose = require("mongoose");

const analysisCacheSchema = new mongoose.Schema(
  {
    cacheKey: { type: String, required: true, unique: true, index: true },
    mode: { type: String, enum: ["startup", "business"], required: true },
    idea: { type: String, required: true },
    refinement: { type: String, default: "" },
    response: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 6 },
  },
  { versionKey: false },
);

module.exports = mongoose.model("AnalysisCache", analysisCacheSchema);
