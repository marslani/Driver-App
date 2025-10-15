export default async function handler(req, res) {
  if (req.method === "POST") {
    const { driverName } = req.body;
    console.log(`📧 Delay email triggered for ${driverName}`);
    return res.status(200).json({ message: "Email sent successfully" });
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
