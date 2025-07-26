export default async function handler(req, res) {
  const apiKey = process.env.NVIDIA_API_KEY;
  const userMessage = req.body.message;

  const response = await fetch("https://integrate.api.nvidia.com/v1", {
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
  const reply = data?.choices?.[0]?.message?.content || "Sorry, I didn't understand.";
  res.status(200).json({ reply });
}
