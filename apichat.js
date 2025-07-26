export default async function handler(req, res) {
  const apiKey = process.env.NVIDIA_API_KEY;
  const userMessage = req.body.message;

const response = await fetch("https://ai-horba.onrender.com", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message: userMessage })
});

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || "Sorry, I didn't understand.";
  res.status(200).json({ reply });
}
