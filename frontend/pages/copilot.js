"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Copilot() {
  const router = useRouter();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi! Ask me anything about this website.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showWebsite, setShowWebsite] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const messagesEndRef = useRef(null);

  /* 🔄 Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* 📜 Load chat history */
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/copilot/history/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };

    loadHistory();
  }, [router]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", text: input, time: timestamp },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/copilot/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify({
            question: input,
            url: "https://nuevesolutions.com/",
          }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            data.answer ||
            "This information is not available on the website.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Error talking to Copilot.",
          time: timestamp,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="layout">
        {/* 🌐 WEBSITE */}
        {showWebsite && !fullscreen && (
          <div className="website">
            <iframe
              src="https://nuevesolutions.com/"
              title="Website"
              className="iframe"
            />
          </div>
        )}

        {/* 🤖 COPILOT */}
        <div className={`copilot ${fullscreen ? "fullscreen" : ""}`}>
          <div className="header">
            <div>
              <h3>Web Copilot</h3>
              <span className="online">● Online</span>
            </div>

            <div className="actions">
              <button onClick={() => setShowWebsite(!showWebsite)}>
                {showWebsite ? "Hide Site" : "Show Site"}
              </button>
              <button onClick={() => setFullscreen(!fullscreen)}>
                {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>

          <div className="messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "userMsg" : "botMsg"}
              >
                <div>{m.text}</div>
                <div className="time">{m.time}</div>
              </div>
            ))}

            {loading && (
              <div className="botMsg">
                🤖 Thinking…
                <div className="time">now</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="inputArea">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>

      {/* 🎨 STYLES */}
      <style jsx>{`
        .page {
  height: calc(100vh - 64px);
  margin-top: 64px;
  background: #020617;
}

        .layout {
          display: flex;
          height: 100%;
          min-width: 0;
        }

        /* WEBSITE */
        .website {
          flex: 2;
          min-width: 50%;
        }

        .iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        /* COPILOT */
        .copilot {
          flex: 1;
          min-width: 380px;
          display: flex;
          flex-direction: column;
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          width: 100vw;
          height: 100vh;
          flex: none;
        }

        .header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .online {
          font-size: 12px;
          color: #22c55e;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .actions button {
          background: none;
          border: none;
          color: #22c55e;
          font-size: 12px;
          cursor: pointer;
        }

        .messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .botMsg,
        .userMsg {
          max-width: 85%;
          padding: 12px;
          border-radius: 12px;
          word-break: break-word;
          white-space: normal;
        }

        .botMsg {
          background: rgba(255, 255, 255, 0.1);
        }

        .userMsg {
          background: linear-gradient(135deg, #22c55e, #4ade80);
          color: #052e16;
          align-self: flex-end;
          font-weight: 600;
        }

        .time {
          font-size: 11px;
          opacity: 0.6;
          margin-top: 6px;
          text-align: right;
        }

        .inputArea {
          display: flex;
          gap: 8px;
          padding: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .inputArea input {
          flex: 1;
          min-width: 0;
          padding: 12px;
          border-radius: 10px;
          border: none;
          outline: none;
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .inputArea button {
          flex-shrink: 1;
          min-width: 70px;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #22c55e, #4ade80);
          color: #052e16;
          white-space: nowrap;
        }

        /* 📱 AUTO-HIDE WEBSITE ON SMALL SCREENS */
        @media (max-width: 1100px) {
          .website {
            display: none;
          }

          .copilot {
            min-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .layout {
            flex-direction: column;
          }

          .copilot {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}