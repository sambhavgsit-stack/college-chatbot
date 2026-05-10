import { useState, useEffect } from "react";
import Login from "./Login";
import AdminPanel from "./AdminPanel";

function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your College Assistant.", docs: [] }
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
      setMessages([...updatedMessages, {
        sender: "bot",
        text: data.reply,
        docs: data.suggestedDocs || []
      }]);
    } catch (error) {
      setMessages([...updatedMessages, {
        sender: "bot",
        text: "Sorry, something went wrong.",
        docs: []
      }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h2 style={{ textAlign: "center" }}>🎓 College Assistant</h2>
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", height: "420px", overflowY: "auto", marginBottom: "12px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left", marginBottom: "12px" }}>
            <span style={{
              background: msg.sender === "user" ? "#0070f3" : "#f0f0f0",
              color: msg.sender === "user" ? "white" : "black",
              padding: "8px 14px",
              borderRadius: "18px",
              display: "inline-block",
              maxWidth: "80%",
              textAlign: "left"
            }}>
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.text.split('\n').length - 1 && <br />}
                </span>
              ))}
              {msg.docs && msg.docs.length > 0 && (
                <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #ddd" }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>
                    📎 You can also refer to:
                  </div>
                  {msg.docs.map((doc, i) => (
                    <button
                      key={i}
                      onClick={() => window.open("http://localhost:5001/download/" + doc.index)}
                      style={{ display: "inline-block", padding: "4px 10px", background: "#e8f0fe", color: "#0070f3", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer", marginRight: "6px", marginBottom: "4px" }}
                    >
                      {"⬇️ " + doc.name}
                    </button>
                  ))}
                </div>
              )}
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

function App() {
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [page, setPage] = useState("chat");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setAdminToken(savedToken);
      setAdminUser(JSON.parse(savedUser));
    }
  }, []);

  function handleAdminLogin(userData) {
    setAdminUser(userData);
    setAdminToken(localStorage.getItem("token"));
    setShowAdminLogin(false);
    setPage("admin");
  }

  function handleAdminLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAdminUser(null);
    setAdminToken(null);
    setPage("chat");
  }

  if (showAdminLogin) {
    return <Login onLogin={handleAdminLogin} onBack={() => setShowAdminLogin(false)} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setPage("chat")}
            style={{ padding: "8px 20px", background: page === "chat" ? "#0070f3" : "#f0f0f0", color: page === "chat" ? "white" : "black", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            💬 Student Chat
          </button>
          {adminUser && (
            <button
              onClick={() => setPage("admin")}
              style={{ padding: "8px 20px", background: page === "admin" ? "#0070f3" : "#f0f0f0", color: page === "admin" ? "white" : "black", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              🔐 Admin Panel
            </button>
          )}
        </div>
        <div>
          {adminUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "13px", color: "#666" }}>{"👤 " + adminUser.name}</span>
              <button
                onClick={handleAdminLogout}
                style={{ padding: "6px 12px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminLogin(true)}
              style={{ padding: "6px 14px", background: "white", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontSize: "13px", color: "#666" }}
            >
              🔐 Faculty Login
            </button>
          )}
        </div>
      </div>
      {page === "chat"
        ? <ChatBot />
        : <AdminPanel token={adminToken} onLogout={handleAdminLogout} />
      }
    </div>
  );
}

export default App;