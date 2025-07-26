export default async function handler(req, res) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    const userMessage = req.body.message;

    const response = await fetch("https://integrate.api.nvidia.com/v1/llama3-8b-instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
        max_tokens: 256
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("⚠️ Model replied with empty or invalid message:", JSON.stringify(data));
      return res.status(500).json({ reply: "⚠️ Model returned no message." });
    }

    res.status(200).json({ reply });

  } catch (err) {
    console.error("🔥 Backend error:", err.message);
    res.status(500).json({ reply: "⚠️ Server error occurred." });
  }
}
