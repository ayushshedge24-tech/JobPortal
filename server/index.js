const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS Configuration
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];
const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (
      allowedOrigins.includes(cleanOrigin) ||
      allowedOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Rate Limiting on Auth Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // allow sufficient attempts for normal usage and testing
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts. Please try again in 15 minutes.",
    },
  },
});

app.use("/api/auth", authLimiter, authRoutes);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", messageRoutes);

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "jobportal-api",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbConnected: mongoose.connection.readyState === 1,
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Job Portal 2.0 Backend is Running 🚀",
    version: "2.0.0",
  });
});

// Centralized 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized Error Handler
app.use((err, req, res, _next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An internal server error occurred.",
    },
  });
});

const devSeed = require("./utils/devSeed");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const localFallbackUri = process.env.MONGODB_FALLBACK_URI || "mongodb://127.0.0.1:27017/JobPortalDB";

  if (primaryUri) {
    try {
      console.log("Connecting to primary MongoDB URI...");
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
        family: 4,
      });
      console.log("MongoDB Connected Successfully to Primary URI ✅");
      return;
    } catch (err) {
      console.warn("⚠️ Primary MongoDB connection failed:", err.message);
      if (err.message && err.message.includes("whitelist")) {
        console.warn("💡 Note: To connect directly to MongoDB Atlas, add your current dynamic IP to the Atlas IP Whitelist (or 0.0.0.0/0).");
      }
    }
  }

  // Fallback to local MongoDB
  try {
    console.log(`Connecting to local MongoDB fallback at ${localFallbackUri}...`);
    await mongoose.connect(localFallbackUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log("MongoDB Connected Successfully to Local Fallback Database ✅");
  } catch (fallbackErr) {
    console.error("❌ Both Primary and Local Fallback MongoDB connections failed!");
    console.error(fallbackErr.message);
    throw fallbackErr;
  }
};

connectDB()
  .then(async () => {
    // Run idempotent development seed if in development
    await devSeed();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`JobPortal Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Startup Failed ❌");
    console.error(error.message);
  });

module.exports = app;