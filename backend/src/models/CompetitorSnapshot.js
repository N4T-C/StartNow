const mongoose = require("mongoose");

const CompetitorSnapshotSchema = new mongoose.Schema({
  competitorId: { type: String, required: true },
  competitorName: { type: String, required: true },
  url: { type: String, required: true },
  crawledAt: { type: Date, default: Date.now },
  content: {
    title: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    headings: { type: [String], default: [] },
    bodyText: { type: String, default: "" },
    pricingMentions: { type: [String], default: [] },
    ctaTexts: { type: [String], default: [] },
    featureClaims: { type: [String], default: [] },
  },
  rawHtml: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("CompetitorSnapshot", CompetitorSnapshotSchema);
