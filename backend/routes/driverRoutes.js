import express from "express";
import DriverLog from "../models/DriverLog.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Save Checkpoint
router.post("/checkpoint", async (req, res) => {
  try {
    const { driverName, checkpointName, location } = req.body;

    let log = await DriverLog.findOne({ driverName });
    if (!log) {
      log = new DriverLog({ driverName, checkpoints: [] });
    }

    const newCheckpoint = { name: checkpointName, location };
    log.checkpoints.push(newCheckpoint);
    log.lastUpdated = new Date();
    await log.save();

    // 🕒 Check for delay
    if (log.checkpoints.length > 1) {
      const prev = log.checkpoints[log.checkpoints.length - 2];
      const now = newCheckpoint.time || new Date();
      const hoursPassed = (now - prev.time) / (1000 * 60 * 60);

      if (hoursPassed > 3) {
        // 🚨 Send email alert
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.DEALER_EMAIL,
          subject: "Driver Delay Alert",
          text: `Driver ${driverName} is delayed more than 3 hours after ${prev.name}.`,
        });
        console.log("🚨 Email alert sent to dealer");
      }
    }

    res.json({ success: true, message: "Checkpoint saved", log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ Get all driver logs
router.get("/logs", async (req, res) => {
  const logs = await DriverLog.find();
  res.json(logs);
});

export default router;