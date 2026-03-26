const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const analyzeRoutes = require("./routes/analyze");
const analyzeCitiesRoutes = require("./routes/analyzeCities");
const pinsRoutes = require("./routes/pins");
const predictNextShopRoutes = require("./routes/predictNextShop");
const coursesRoutes = require("./routes/courses");
const authRoutes = require("./routes/auth");
const competitorsRoutes = require("./routes/competitors");
const { connectToDatabase } = require("./utils/db");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use("/api", async (_req, _res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", analyzeRoutes);
app.use("/api", coursesRoutes);
app.use("/api", authRoutes);
app.use("/api", analyzeCitiesRoutes);
app.use("/api", pinsRoutes);
app.use("/api", predictNextShopRoutes);
app.use("/api", competitorsRoutes);

app.use((err, _req, res, _next) => {
  if (err?.message?.includes("CORS")) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  if (err?.message?.includes("MONGO_URI")) {
    return res.status(500).json({ error: err.message });
  }

  return res.status(500).json({ error: "Server error" });
});

module.exports = app;
