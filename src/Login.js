import { useState } from "react";

function Login({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return setError("Please fill in both fields.");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || "Login failed.");
      }
    } catch (err) {
      setError("Cannot connect to server. Is backend running?");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", fontFamily: "sans-serif" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: "380px" }}>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px" }}>🎓</div>
          <h2 style={{ margin: "8px 0 4px" }}>Faculty Login</h2>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Sign in to manage college content</p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#333", display: "block", marginBottom: "6px" }}>Email</label>
          <input
            type="email"
            placeholder="your@college.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#333", display: "block", marginBottom: "6px" }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
          />
        </div>

        {error && (
          <div style={{ padding: "10px", background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "6px", color: "#cc0000", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: loading ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "6px", fontSize: "15px", cursor: "pointer", fontWeight: "500" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div style={{ marginTop: "20px", padding: "16px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
          <strong>Test accounts:</strong><br />
          👨‍💼 admin@college.com / admin123<br />
          👨‍🏫 faculty@college.com / faculty123
        </div>

        {onBack && (
          <button
            onClick={onBack}
            style={{ width: "100%", padding: "10px", background: "white", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", cursor: "pointer", marginTop: "12px", color: "#666" }}
          >
            ← Back to Student Chat
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;