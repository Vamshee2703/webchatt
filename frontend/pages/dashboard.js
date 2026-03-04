import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

const startChat = async () => {
  if (!url) {
    alert("Please enter a website URL");
    return;
  }

  let formattedUrl = url;
  if (!url.startsWith("http")) {
    formattedUrl = "https://" + url;
  }

  const token = localStorage.getItem("access");

  await fetch("http://127.0.0.1:8000/api/crawl/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: formattedUrl }),
  });

  router.push(`/copilot?url=${encodeURIComponent(formattedUrl)}`);
};
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Web Copilot Dashboard</h1>

        <div style={styles.card}>
          <h2>🌐 Chat With Any Website</h2>

          <p>Enter a website URL and start chatting with its content.</p>

          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button} onClick={startChat}>
            Start Web Chat
          </button>

          <hr style={styles.divider} />

          <h2>📄 PDF Chat</h2>

          <p>Upload a PDF and chat with your document.</p>

          <button
            style={styles.button}
            onClick={() => window.open("http://localhost:8501", "_blank")}
          >
          Open PDF Chat
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },

  heading: {
    marginBottom: "24px",
  },

  card: {
    background: "#000",
    color: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    background: "linear-gradient(135deg,#22c55e,#4ade80)",
    color: "#052e16",
  },

  pdfButton: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
  },

  divider: {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    margin: "10px 0",
  },
};