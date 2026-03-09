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
        <div style={styles.card}>
          <h2>Ask Anything From Websites or PDFs</h2>

          <p>Select what you want to chat with.</p>

          <div style={styles.buttonRow}>
            <button
              style={styles.button}
              onClick={() => router.push("/webchat")}
            >
              Web Chat
            </button>

            <button
              style={styles.button}
              onClick={() => window.open("http://localhost:8501", "_blank")}
            >
              PDF Chat
            </button>
          </div>
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
    maxWidth: "500px",
    textAlign: "center",
  },

  card: {
    background: "#000",
    color: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },

  button: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
    color: "#ffffff",
  },
};