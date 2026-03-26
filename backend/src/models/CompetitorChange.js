const mongoose = require("mongoose");

const CompetitorChangeSchema = new mongoose.Schema({
  competitorId: { type: String, required: true },
  competitorName: { type: String, required: true },
  detectedAt: { type: Date, default: Date.now },
  changeType: { type: String, enum: ['pricing', 'messaging', 'feature', 'cta', 'general'], required: true },
  field: { type: String, required: true },
  before: { type: String, default: "" },
  after: { type: String, default: "" },
  summary: { type: String, required: true },
  noveltyScore: { type: Number, default: 50 },
  frequencyScore: { type: Number, default: 0 },
  relevanceScore: { type: Number, default: 50 },
  priorityScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("CompetitorChange", CompetitorChangeSchema);
