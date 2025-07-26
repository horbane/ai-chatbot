export default async function handler(req, res) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    const userMessage = req.body.message;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing NVIDIA API key." });
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/llama-3-8b-instruct", // or the larger model if you prefer
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 512,
        stream: false
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("No reply in response:", data);
      return res.status(500).json({ reply: "⚠️ No reply from model." });
    }

    res.status(200).json({ reply });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ reply: "⚠️ Server error occurred." });
  }
}
