import { useState } from "react";

function AdminPanel() {
  const [file, setFile] = useState(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(false);

  async function uploadFile() {
    if (!file) return setMessage("Please select a file first.");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      setFile(null);
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
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch("http://localhost:5001/knowledge");
      const data = await res.json();
      setKnowledge(data.items || []);
    } catch (err) {
      console.log("Could not load knowledge base");
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>🔐 Admin Panel</h2>
      <p style={{ textAlign: "center", color: "#666", fontSize: "14px" }}>
        Upload documents or add FAQs for students
      </p>

      {/* File Upload Section */}
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ marginTop: 0 }}>📄 Upload Document</h3>
        <p style={{ color: "#666", fontSize: "13px" }}>Supported: PDF, DOCX, TXT</p>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "10px", display: "block" }}
        />
        {file && <p style={{ fontSize: "13px", color: "#333" }}>Selected: {file.name}</p>}
        <button
          onClick={uploadFile}
          disabled={loading}
          style={{ padding: "10px 20px", background: loading ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* FAQ Section */}
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ marginTop: 0 }}>❓ Add FAQ</h3>
        <input
          type="text"
          placeholder="Question (e.g. When is the exam?)"
          value={faqQuestion}
          onChange={(e) => setFaqQuestion(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", boxSizing: "border-box" }}
        />
        <textarea
          placeholder="Answer (e.g. Exams start from 15th June 2025)"
          value={faqAnswer}
          onChange={(e) => setFaqAnswer(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", boxSizing: "border-box" }}
        />
        <button
          onClick={addFaq}
          disabled={loading}
          style={{ padding: "10px 20px", background: loading ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          {loading ? "Adding..." : "Add FAQ"}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div style={{ padding: "12px", background: "#f0fff0", border: "1px solid #90ee90", borderRadius: "6px", marginBottom: "20px", color: "#2d7a2d" }}>
          {message}
        </div>
      )}

      {/* Knowledge Base List */}
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ marginTop: 0 }}>📚 Knowledge Base</h3>
          <button
            onClick={loadKnowledge}
            style={{ padding: "6px 12px", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
          >
            Refresh
          </button>
        </div>
        {knowledge.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>Nothing uploaded yet. Click Refresh after uploading.</p>
        ) : (
          knowledge.map((item, index) => (
            <div key={index} style={{ padding: "10px", background: "#f9f9f9", borderRadius: "6px", marginBottom: "8px", fontSize: "14px" }}>
              <span style={{ marginRight: "8px" }}>{item.type === "faq" ? "❓" : "📄"}</span>
              <strong>{item.name}</strong>
              <span style={{ color: "#999", fontSize: "12px", marginLeft: "8px" }}>
                {new Date(item.uploadedAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPanel;