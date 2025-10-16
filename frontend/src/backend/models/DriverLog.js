import mongoose from "mongoose";

const checkpointSchema = new mongoose.Schema({
  pointName: String,
  timestamp: { type: Date, default: Date.now },
  gps: { lat: Number, lng: Number },
});

const driverLogSchema = new mongoose.Schema({
  driverName: String,
  checkpoints: [checkpointSchema],
  lastCheckpointTime: Date,
  dealerEmail: String,
});

export default mongoose.model("DriverLog", driverLogSchema);

