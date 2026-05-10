import { useState } from "react";

function QuickFAQ({ question, token, onAdded }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submitAnswer() {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json", "authorization": token },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      if (data.message) {
        setDone(true);
        setOpen(false);
        onAdded();
      }
    } catch (err) {
      console.log("Failed to add FAQ");
    }
    setLoading(false);
  }

  if (done) {
    return <div style={{ fontSize: "12px", color: "#2d7a2d", marginTop: "4px" }}>✅ Added to FAQ</div>;
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ fontSize: "12px", padding: "4px 10px", background: "white", border: "1px solid #0070f3", color: "#0070f3", borderRadius: "6px", cursor: "pointer" }}
        >
          + Add Answer to FAQ
        </button>
      ) : (
        <div style={{ marginTop: "8px" }}>
          <textarea
            placeholder="Type the answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box", marginBottom: "8px" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={submitAnswer}
              disabled={loading}
              style={{ padding: "6px 14px", background: loading ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
            >
              {loading ? "Saving..." : "Save to FAQ"}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ padding: "6px 14px", background: "white", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontSize: "13px", color: "#666" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanel({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [downloadable, setDownloadable] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [knowledge, setKnowledge] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  async function uploadFile() {
    if (!file) return setMessage("Please select a file first.");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("downloadable", downloadable);
    try {
      const res = await fetch("http://localhost:5001/upload", {
        method: "POST",
        headers: { "authorization": token },
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      setFile(null);
      setDownloadable(false);
      loadKnowledge();
    } catch (err) {
      setMessage("Upload failed. Is the backend running?");
    }
    setLoading(false);
  }

  async function addFaq() {
    if (!faqQuestion || !faqAnswer) return setMessage("Fill both question and answer.");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json", "authorization": token },
        body: JSON.stringify({ question: faqQuestion, answer: faqAnswer }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      setFaqQuestion("");
      setFaqAnswer("");
      loadKnowledge();
    } catch (err) {
      setMessage("Failed to add FAQ.");
    }
    setLoading(false);
  }

  async function loadKnowledge() {
    try {
      const res = await fetch("http://localhost:5001/knowledge", {
        headers: { "authorization": token }
      });
      const data = await res.json();
      setKnowledge(data.items || []);
    } catch (err) {
      console.log("Could not load knowledge base");
    }
  }

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/analytics", {
        headers: { "authorization": token }
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.log("Could not load analytics");
    }
    setLoading(false);
  }

  const tabStyle = (tab) => ({
    padding: "8px 16px",
    background: activeTab === tab ? "#0070f3" : "#f0f0f0",
    color: activeTab === tab ? "white" : "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: activeTab === tab ? "600" : "400"
  });

  return (
    <div style={{ maxWidth: "650px", margin: "30px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h2 style={{ textAlign: "center" }}>🔐 Admin Panel</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", justifyContent: "center" }}>
        <button style={tabStyle("upload")} onClick={() => setActiveTab("upload")}>📄 Upload</button>
        <button style={tabStyle("faq")} onClick={() => setActiveTab("faq")}>❓ FAQ</button>
        <button style={tabStyle("knowledge")} onClick={() => { setActiveTab("knowledge"); loadKnowledge(); }}>📚 Knowledge Base</button>
        <button style={tabStyle("analytics")} onClick={() => { setActiveTab("analytics"); loadAnalytics(); }}>📊 Analytics</button>
      </div>

      {message && (
        <div style={{ padding: "12px", background: "#f0fff0", border: "1px solid #90ee90", borderRadius: "6px", marginBottom: "16px", color: "#2d7a2d" }}>
          {message}
          <button onClick={() => setMessage("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#2d7a2d" }}>✕</button>
        </div>
      )}

      {activeTab === "upload" && (
        <div style={{ border: "1px solid #eee", borderRadius: "10px", padding: "24px" }}>
          <h3 style={{ marginTop: 0 }}>📄 Upload Document</h3>
          <p style={{ color: "#666", fontSize: "13px" }}>Supported: PDF, DOCX, TXT</p>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: "12px", display: "block" }}
          />
          {file && (
            <p style={{ fontSize: "13px", color: "#333", marginBottom: "12px" }}>
              Selected: <strong>{file.name}</strong>
            </p>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontSize: "14px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={downloadable}
              onChange={(e) => setDownloadable(e.target.checked)}
            />
            Allow students to download this file
          </label>
          <button
            onClick={uploadFile}
            disabled={loading}
            style={{ padding: "10px 24px", background: loading ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {activeTab === "faq" && (
        <div style={{ border: "1px solid #eee", borderRadius: "10px", padding: "24px" }}>
          <h3 style={{ marginTop: 0 }}>❓ Add FAQ</h3>
          <p style={{ color: "#666", fontSize: "13px" }}>Add frequently asked questions so students get instant answers</p>
          <input
            type="text"
            placeholder="Question (e.g. When are the exams?)"
            value={faqQuestion}
            onChange={(e) => setFaqQuestion(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
          />
          <textarea
            placeholder="Answer (e.g. Final exams start from 15th June 2025)"
            value={faqAnswer}
            onChange={(e) => setFaqAnswer(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
          />
          <button
            onClick={addFaq}
            disabled={loading}
            style={{ padding: "10px 24px", background: loading ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
          >
            {loading ? "Adding..." : "Add FAQ"}
          </button>
        </div>
      )}

      {activeTab === "knowledge" && (
        <div style={{ border: "1px solid #eee", borderRadius: "10px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>📚 Knowledge Base</h3>
            <button
              onClick={loadKnowledge}
              style={{ padding: "6px 14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
            >
              Refresh
            </button>
          </div>
          {knowledge.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>Nothing uploaded yet.</p>
          ) : (
            knowledge.map((item, index) => (
              <div key={index} style={{ padding: "12px", background: "#f9f9f9", borderRadius: "8px", marginBottom: "8px", fontSize: "14px" }}>
                <span style={{ marginRight: "8px" }}>{item.type === "faq" ? "❓" : "📄"}</span>
                <strong>{item.name}</strong>
                {item.downloadable && <span style={{ marginLeft: "8px", fontSize: "11px", background: "#e8f0fe", color: "#0070f3", padding: "2px 6px", borderRadius: "4px" }}>downloadable</span>}
                <span style={{ color: "#666", fontSize: "12px", marginLeft: "8px" }}>by {item.uploadedBy}</span>
                <span style={{ color: "#999", fontSize: "12px", marginLeft: "8px" }}>
                  {new Date(item.uploadedAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div style={{ border: "1px solid #eee", borderRadius: "10px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>📊 Student Questions Analytics</h3>
            <button
              onClick={loadAnalytics}
              style={{ padding: "6px 14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
            >
              Refresh
            </button>
          </div>

          {loading && <p style={{ color: "#999" }}>Loading...</p>}

          {analytics && (
            <>
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <div style={{ flex: 1, padding: "16px", background: "#f0f7ff", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#0070f3" }}>{analytics.totalQuestions}</div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Total Questions Asked</div>
                </div>
                <div style={{ flex: 1, padding: "16px", background: "#fff7f0", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#f07000" }}>{analytics.uniqueQuestions}</div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Frequently Repeated</div>
                </div>
              </div>

              {analytics.topQuestions.length === 0 ? (
                <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", textAlign: "center", color: "#999", fontSize: "14px" }}>
                  No repeated questions yet. Questions asked 2+ times will appear here.
                </div>
              ) : (
                <>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                    Questions asked 2 or more times — consider adding these to your FAQ:
                  </p>
                  {analytics.topQuestions.map((item, index) => (
                    <div key={index} style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: "8px", marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "500", color: "#333" }}>{item.question}</div>
                          <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
                            Last asked: {new Date(item.lastAsked).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ minWidth: "60px", textAlign: "center" }}>
                          <div style={{ background: item.count >= 5 ? "#ff4444" : item.count >= 3 ? "#ff9900" : "#0070f3", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "13px", fontWeight: "600" }}>
                            {item.count}x
                          </div>
                        </div>
                      </div>
                      <QuickFAQ
                        question={item.question}
                        token={token}
                        onAdded={() => { setMessage("FAQ added successfully!"); loadAnalytics(); }}
                      />
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;