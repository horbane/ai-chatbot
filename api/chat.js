export default async function handler(req, res) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    const userMessage = req.body.message;

    if (!apiKey) {
      return res.status(500).json({ reply: "API key missing" });
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/llama-3-8b-instruct",
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 256,
        stream: false
      })
    });

    const text = await response.text();

    // Try to parse JSON safely
    try {
      const data = JSON.parse(text);
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        console.error("⚠️ Model returned no message:", JSON.stringify(data));
        return res.status(500).json({ reply: "⚠️ Model returned no message." });
      }
      return res.status(200).json({ reply });
    } catch (parseError) {
      console.error("❌ Response not valid JSON:", text);
      return res.status(500).json({ reply: "⚠️ Invalid response from NVIDIA.", raw: text });
    }

  } catch (err) {
    console.error("🔥 Backend error:", err.message);
    return res.status(500).json({ reply: "⚠️ Server error occurred." });
  }
}
