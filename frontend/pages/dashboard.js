import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

return (
  <div style={styles.page}>
    <div style={styles.container}>
      <h1 style={styles.heading}>Dashboard</h1>

      {/* WEB CHAT */}
      <div style={styles.card}>
        <h2>Web Chat</h2>
        <p>
          Chat with Nueve IT Solutions.
        </p>

        <div style={styles.tech}>
          
        </div>

        <button onClick={() => router.push("/copilot")}>
          Open Web Chat
        </button>
      </div>

      {/* PDF CHAT */}
      <div style={{ ...styles.card, marginTop: "20px" }}>
        <h2>PDF Chat</h2>
        <p>
          Upload a PDF and chat with your document.
        </p>

        <div style={styles.tech}>
      
        </div>

        <button
  onClick={() =>
    window.open("http://localhost:8501", "_blank")
  }
>
  Open PDF Chat
</button>
      </div>
    </div>
  </div>
);
}

const styles = {
  /* FULL SCREEN CENTERING */
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
    padding: "28px",
    borderRadius: "16px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  tech: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    fontSize: "13px",
    opacity: 0.8,
  },
};