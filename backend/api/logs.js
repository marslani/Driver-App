export default async function handler(req, res) {
  if (req.method === "GET") {
    // Demo logs — آپ اصل MongoDB سے بھی لے سکتے ہیں
    return res.status(200).json([
      {
        checkpoints: [
          {
            pointName: "Arrive at UCIC Plant",
            gps: { lat: 24.8607, lng: 67.0011 },
            timestamp: new Date(),
          },
        ],
      },
    ]);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
