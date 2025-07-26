export default async function handler(req, res) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    const userMessage = req.body.message;

    const response = await fetch("https://integrate.api.nvidia.com/v1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.1-nemotron-ultra-253b-v1", // ✅ Your model
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 4096,
        stream: true
      })
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        console.error("⚠️ Model returned no message:", JSON.stringify(data));
        return res.status(500).json({ reply: "⚠️ Model returned no message." });
      }
      return res.status(200).json({ reply });
    } catch (err) {
      console.error("❌ Response not valid JSON:", text);
      return res.status(500).json({ reply: "⚠️ Invalid response from NVIDIA.", raw: text });
    }

  } catch (err) {
    console.error("🔥 Backend error:", err.message);
    return res.status(500).json({ reply: "⚠️ Server error occurred." });
  }
}
