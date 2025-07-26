export default async function handler(req, res) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    const userMessage = req.body.message;

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
        max_tokens: 512,
        stream: false
      })
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const raw = await response.text();
      console.error("❌ RAW RESPONSE FROM NVIDIA:", raw); // 👈 ADD THIS
      return res.status(500).json({ reply: "⚠️ Unexpected response from NVIDIA", raw });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    res.status(200).json({ reply });

  } catch (err) {
    console.error("🔥 Server error:", err.message);
    res.status(500).json({ reply: "⚠️ Server crashed" });
  }
}
