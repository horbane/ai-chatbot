export default async function handler(req, res) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    const userMessage = req.body.message;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing NVIDIA API key." });
    }

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
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "No reply from NVIDIA API.", full: data });
    }

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
