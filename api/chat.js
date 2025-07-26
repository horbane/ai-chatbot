export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userMessage = req.body.message;

  try {
    const response = await fetch("https://your-backend.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();

    if (!data.reply) {
      return res.status(500).json({ reply: "⚠️ Unexpected response from backend." });
    }

    res.status(200).json({ reply: data.reply });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "⚠️ Server error occurred." });
  }
}
