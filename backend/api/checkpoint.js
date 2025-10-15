import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { driverName, pointName, gps } = req.body;
    // Example: Save to MongoDB or log (for demo, we just return it)
    return res.status(200).json({
      message: "Checkpoint recorded",
      data: { driverName, pointName, gps },
    });
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
