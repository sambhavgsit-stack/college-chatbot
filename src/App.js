import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your College Assistant. Ask me about timetables, notices, T&P updates and more." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.reply };
      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      setMessages([...updatedMessages, { sender: "bot", text: "Sorry, something went wrong. Please try again." }]);
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>🎓 College Assistant</h2>

      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", height: "400px", overflowY: "auto", marginBottom: "12px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left", marginBottom: "10px" }}>
            <span style={{
              background: msg.sender === "user" ? "#0070f3" : "#f0f0f0",
              color: msg.sender === "user" ? "white" : "black",
              padding: "8px 14px",
              borderRadius: "18px",
              display: "inline-block",
              maxWidth: "80%",
              textAlign: "left"
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: "left", marginBottom: "10px" }}>
            <span style={{ background: "#f0f0f0", padding: "8px 14px", borderRadius: "18px", display: "inline-block" }}>
              Typing...
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "15px" }}
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          style={{ padding: "10px 20px", background: loading ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px" }}
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;