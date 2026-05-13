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
      const res = await fetch("https://college-chatbot-backend-production-d24b.up.railway.app/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json", "authorization": token },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      if (data.message) { setDone(true); setOpen(false); onAdded(); }
    } catch (err) {}
    setLoading(false);
  }

  if (done) return <div style={{ fontSize: "12px", color: "#6ee7b7", marginTop: "6px" }}>✅ Added to FAQ</div>;

  return (
    <div>
      {!open ? (
        <button className="quick-faq-btn" onClick={() => setOpen(true)}>+ Add Answer to FAQ</button>
      ) : (
        <div className="quick-faq-area">
          <textarea
            placeholder="Type the answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            className="admin-input"
            style={{ marginBottom: "8px" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={submitAnswer} disabled={loading}>
              {loading ? "Saving..." : "Save to FAQ"}
            </button>
            <button className="btn-secondary" style={{ padding: "8px 14px" }} onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanel({ token }) {
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
      const res = await fetch("https://college-chatbot-backend-production-d24b.up.railway.app/upload", {
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
      setMessage("Upload failed.");
    }
    setLoading(false);
  }

  async function addFaq() {
    if (!faqQuestion || !faqAnswer) return setMessage("Fill both question and answer.");
    setLoading(true);
    try {
      const res = await fetch("https://college-chatbot-backend-production-d24b.up.railway.app/faq", {
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
      const res = await fetch("https://college-chatbot-backend-production-d24b.up.railway.app/knowledge", { headers: { "authorization": token } });
      const data = await res.json();
      setKnowledge(data.items || []);
    } catch (err) {}
  }

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("https://college-chatbot-backend-production-d24b.up.railway.app/analytics", { headers: { "authorization": token } });
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {}
    setLoading(false);
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>🔐 Admin Panel</h2>
        <p>Manage college knowledge base and monitor student activity</p>
      </div>

      <div className="admin-tabs">
        <button className={"admin-tab" + (activeTab === "upload" ? " active" : "")} onClick={() => setActiveTab("upload")}>📄 Upload</button>
        <button className={"admin-tab" + (activeTab === "faq" ? " active" : "")} onClick={() => setActiveTab("faq")}>❓ FAQ</button>
        <button className={"admin-tab" + (activeTab === "knowledge" ? " active" : "")} onClick={() => { setActiveTab("knowledge"); loadKnowledge(); }}>📚 Knowledge</button>
        <button className={"admin-tab" + (activeTab === "analytics" ? " active" : "")} onClick={() => { setActiveTab("analytics"); loadAnalytics(); }}>📊 Analytics</button>
      </div>

      {message && (
        <div className="success-banner">
          <span>{message}</span>
          <button onClick={() => setMessage("")} style={{ background: "none", border: "none", color: "#6ee7b7", cursor: "pointer", fontSize: "16px" }}>×</button>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="admin-card">
          <h3>📄 Upload Document</h3>
          <p className="subtitle">Upload PDF, DOCX, or TXT files to the knowledge base</p>

          <label className="file-upload-area" onClick={() => document.getElementById('fileInput').click()}>
            <span className="upload-icon">☁️</span>
            <p>{file ? file.name : "Click to select a file"}</p>
            <p style={{ fontSize: "11px", marginTop: "4px", color: "var(--text-dim)" }}>PDF, DOCX, TXT supported</p>
            <input id="fileInput" type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
          </label>

          {file && (
            <div className="file-selected">
              <span>📎</span>
              <span>{file.name}</span>
            </div>
          )}

          <label className="checkbox-label">
            <input type="checkbox" checked={downloadable} onChange={(e) => setDownloadable(e.target.checked)} />
            Allow students to download this file
          </label>

          <button className="btn-primary" onClick={uploadFile} disabled={loading}>
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      )}

      {activeTab === "faq" && (
        <div className="admin-card">
          <h3>❓ Add FAQ</h3>
          <p className="subtitle">Add frequently asked questions for instant student answers</p>
          <input
            type="text"
            className="admin-input"
            placeholder="Question (e.g. When are the exams?)"
            value={faqQuestion}
            onChange={(e) => setFaqQuestion(e.target.value)}
          />
          <textarea
            className="admin-input"
            placeholder="Answer (e.g. Final exams start from 15th June 2025)"
            value={faqAnswer}
            onChange={(e) => setFaqAnswer(e.target.value)}
            rows={4}
            style={{ resize: "vertical" }}
          />
          <button className="btn-primary" onClick={addFaq} disabled={loading}>
            {loading ? "Adding..." : "Add FAQ"}
          </button>
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3>📚 Knowledge Base</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px" }}>{knowledge.length} items</p>
            </div>
            <button className="btn-secondary" onClick={loadKnowledge}>Refresh</button>
          </div>

          {knowledge.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>Nothing uploaded yet. Add documents or FAQs to get started.</p>
            </div>
          ) : (
            knowledge.map((item, index) => (
              <div key={index} className="knowledge-item">
                <div className="knowledge-item-left">
                  <div className="knowledge-icon">{item.type === "faq" ? "❓" : "📄"}</div>
                  <div>
                    <div className="knowledge-name">{item.name}</div>
                    <div className="knowledge-meta">by {item.uploadedBy} · {new Date(item.uploadedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {item.downloadable && <span className="badge badge-download">⬇️ Downloadable</span>}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3>📊 Analytics</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px" }}>Student question insights</p>
            </div>
            <button className="btn-secondary" onClick={loadAnalytics}>Refresh</button>
          </div>

          {loading && (
            <div className="empty-state">
              <span className="empty-icon">⏳</span>
              <p>Loading analytics...</p>
            </div>
          )}

          {analytics && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{analytics.totalQuestions}</div>
                  <div className="stat-label">Total Questions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analytics.uniqueQuestions}</div>
                  <div className="stat-label">Frequently Repeated</div>
                </div>
              </div>

              {analytics.topQuestions.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📊</span>
                  <p>No repeated questions yet. Questions asked 2+ times will appear here.</p>
                </div>
              ) : (
                <>
                  <p className="section-hint">Questions asked 2+ times — consider adding these to your FAQ</p>
                  {analytics.topQuestions.map((item, index) => (
                    <div key={index} className="question-item">
                      <div className="question-top">
                        <div>
                          <div className="question-text">{item.question}</div>
                          <div className="question-meta">Last asked: {new Date(item.lastAsked).toLocaleString()}</div>
                        </div>
                        <span className={"count-badge " + (item.count >= 5 ? "count-high" : item.count >= 3 ? "count-mid" : "count-low")}>
                          {item.count}×
                        </span>
                      </div>
                      <QuickFAQ question={item.question} token={token} onAdded={() => { setMessage("FAQ added!"); loadAnalytics(); }} />
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