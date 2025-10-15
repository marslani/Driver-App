import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import DriverLog from "./models/DriverLog.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🚚 Add checkpoint
app.post("/api/checkpoint", async (req, res) => {
  const { driverName, pointName, gps } = req.body;

  try {
    let log = await DriverLog.findOne({ driverName });
    if (!log) {
      log = new DriverLog({
        driverName,
        dealerEmail: process.env.DEALER_EMAIL,
        checkpoints: [],
        lastCheckpointTime: new Date(),
      });
    }

    log.checkpoints.push({ pointName, gps, timestamp: new Date() });
    log.lastCheckpointTime = new Date();
    await log.save();

    res.json({ success: true, message: `${pointName} recorded.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ⏳ Delay Email
app.post("/api/delay-email", async (req, res) => {
  const { driverName } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.DEALER_EMAIL,
      subject: `⚠️ Delay Alert for ${driverName}`,
      text: `Driver ${driverName} has not reached the next checkpoint in over 3 hours.`,
    });
    res.json({ success: true, message: "Delay email sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Email send failed" });
  }
});

// 🔄 Fetch last 1 minute logs
app.get("/api/logs", async (req, res) => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000); // last 1 minute
    const logs = await DriverLog.find({ "checkpoints.timestamp": { $gte: oneMinuteAgo } });
    res.json(logs);

    // Delete old checkpoints automatically (older than 1 minute)
    await DriverLog.updateMany(
      {},
      { $pull: { checkpoints: { timestamp: { $lt: oneMinuteAgo } } } }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
});

// Test route
app.get("/", (req, res) => res.send("🚛 Driver Log Backend Running ✅"));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));