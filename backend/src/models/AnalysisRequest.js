const mongoose = require("mongoose");

const regionSummarySchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    opportunityScore: Number,
  },
  { _id: false },
);

const analysisRequestSchema = new mongoose.Schema(
  {
    mode: { type: String, enum: ["startup", "business"], required: true },
    idea: { type: String, required: true },
    refinement: { type: String, default: "" },
    opportunityScore: { type: Number, required: true },
    trendSignals: {
      growth: Number,
      demand: Number,
      buzz: Number,
    },
    topRegions: [regionSummarySchema],
    source: { type: String, enum: ["live", "cache"], required: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("AnalysisRequest", analysisRequestSchema);
