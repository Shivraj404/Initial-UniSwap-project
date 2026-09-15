const express = require("express");
const path = require("path");
const listingRoutes = require("./routes/listingRoutes");
const orderRoutes = require("./routes/orderRoutes");
const requestRoutes = require("./routes/requestRoutes");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Trust the reverse proxy on hosts like Render/Railway so req.protocol
// correctly reports "https" (otherwise generated image URLs come back as
// http:// and get blocked as mixed content on the deployed https:// site).
app.set("trust proxy", 1);

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded listing images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/requests", requestRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "UniSwap API is running successfully 🚀",
    database: "MongoDB",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`UniSwap backend running on http://localhost:${PORT}`);
});
