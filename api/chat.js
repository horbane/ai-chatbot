export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ reply: "⚠️ Please provide a message." });
  }

  try {
    // Use the correct endpoint that matches the backend
    const response = await fetch("https://ai-horba.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage }),
      timeout: 15000 // 15 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the backend response format
    let reply = "";
    if (data.reply) {
      reply = data.reply;
    } else if (data.message) {
      reply = data.message;
    } else {
      reply = "⚠️ I received a response but couldn't understand the format.";
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error("API Error:", error);
    
    res.status(500).json({ 
      reply: "⚠️ Sorry, I'm having trouble connecting to my backend. Please check if your backend server is running at https://ai-horba.onrender.com" 
    });
  }
}
