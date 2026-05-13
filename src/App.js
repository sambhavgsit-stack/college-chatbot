import { useState, useEffect, useRef } from "react";
import Login from "./Login";
import AdminPanel from "./AdminPanel";
import "./App.css";

function useTheme() {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "auto";
  });

  useEffect(() => {
    const applyTheme = (t) => {
      const resolved = t === "auto" ? getSystemTheme() : t;
      document.documentElement.setAttribute("data-theme", resolved);
    };
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    if (theme === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("auto");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  return [theme, setTheme];
}

function ThemeDropdown({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const options = [
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "auto", label: "Auto", icon: "⚙️" },
    { value: "light", label: "Light", icon: "☀️" },
  ];

  const current = options.find(o => o.value === theme);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 14px",
          background: "var(--navy-card)",
          border: "1px solid var(--navy-border)",
          borderRadius: "20px",
          color: "var(--text-secondary)",
          fontSize: "13px",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.2s",
        }}
      >
        <span>{current.icon}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: "10px", opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "var(--navy-card)",
          border: "1px solid var(--navy-border)",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "var(--shadow)",
          zIndex: 999,
          minWidth: "130px",
          animation: "fadeUp 0.15s ease",
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setTheme(opt.value); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "11px 16px",
                border: "none",
                background: theme === opt.value ? "var(--gold-dim)" : "transparent",
                color: theme === opt.value ? "var(--gold)" : "var(--text-secondary)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: theme === opt.value ? "600" : "400",
                transition: "all 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={e => {
                if (theme !== opt.value) e.currentTarget.style.background = "var(--navy-border)";
              }}
              onMouseLeave={e => {
                if (theme !== opt.value) e.currentTarget.style.background = "transparent";
              }}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
              {theme === opt.value && (
                <span style={{ marginLeft: "auto", fontSize: "11px" }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your College Assistant.", docs: [] }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (input.trim() === "") return;
    const userMessage = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://college-chatbot-backend-production-d24b.up.railway.app/chat", {
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
    <div className="chat-container">
      <div className="chat-header">
        <h2>College <span>Assistant</span></h2>
        <p>Ask me anything about timetables, notices, T&P updates and more</p>
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={"message-wrapper " + msg.sender}>
            {msg.sender === "bot" && <div className="bot-avatar">🎓</div>}
            <div className={"message-bubble " + msg.sender}>
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.text.split('\n').length - 1 && <br />}
                </span>
              ))}
              {msg.docs && msg.docs.length > 0 && (
                <div className="doc-suggestions">
                  <p>📎 You can also refer to:</p>
                  {msg.docs.map((doc, i) => (
                    <button
                      key={i}
                      className="doc-btn"
                      onClick={() => window.open("https://college-chatbot-backend-production-d24b.up.railway.app/download/" + doc.id)}
                    >
                      ⬇️ {doc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper bot">
            <div className="bot-avatar">🎓</div>
            <div className="message-bubble bot">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="btn-send"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "..." : "Send →"}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useTheme();
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
      <nav className="navbar">
        {/* Left — Brand */}
        <div className="navbar-brand">
          🎓 <span>College Assistant</span>
        </div>

        {/* Center — perfectly centered tabs */}
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{ pointerEvents: "auto" }}>
            <div className="navbar-tabs">
              <button
                className={"nav-tab" + (page === "chat" ? " active" : "")}
                onClick={() => setPage("chat")}
              >
                💬 Student Chat
              </button>
              {adminUser && (
                <button
                  className={"nav-tab" + (page === "admin" ? " active" : "")}
                  onClick={() => setPage("admin")}
                >
                  🔐 Admin Panel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right — Theme + Auth */}
        <div className="navbar-right">
          <ThemeDropdown theme={theme} setTheme={setTheme} />
          {adminUser ? (
            <>
              <div className="user-badge">👤 {adminUser.name}</div>
              <button className="btn-logout" onClick={handleAdminLogout}>Logout</button>
            </>
          ) : (
            <button className="btn-faculty-login" onClick={() => setShowAdminLogin(true)}>
              🔐 Faculty Login
            </button>
          )}
        </div>
      </nav>

      {page === "chat" ? <ChatBot /> : <AdminPanel token={adminToken} />}
    </div>
  );
}

export default App;