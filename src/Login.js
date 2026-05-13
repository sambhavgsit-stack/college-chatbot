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
      const res = await fetch("https://college-chatbot-backend-production-d24b.up.railway.app/login", {
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
    <div className="login-page">
      <div className="login-bg-glow" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon-wrapper">🎓</div>
          <h1>Faculty Portal</h1>
          <p>Sign in to manage college content</p>
        </div>

        <div className="login-divider">
          <div className="login-divider-line" />
          <span>credentials</span>
          <div className="login-divider-line" />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon">✉️</span>
            <input
              type="email"
              className="form-input"
              placeholder="your@college.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon">🔒</span>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {error && (
          <div className="error-box">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button className="btn-login" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        {onBack && (
          <button className="btn-back" onClick={onBack}>
            ← Back to Student Chat
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;