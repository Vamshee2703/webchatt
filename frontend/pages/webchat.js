import { useState } from "react";
import { useRouter } from "next/router";

export default function WebChat() {
  const router = useRouter();
  const [url, setUrl] = useState("");

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

    fetch("http://127.0.0.1:8000/api/crawl/", {
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
      <div style={styles.card}>
        <h2><center>Chat With Any Website</center></h2>

        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={styles.input}
        />

        <button style={styles.button} onClick={startChat}>
          Start Chat
        </button>
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

  card: {
    background: "#000",
    padding: "30px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "400px",
    color: "#fff",
  },

  input: {
    color: "#ffffff",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
    color: "#fff",
    fontWeight: "600",
  },
};