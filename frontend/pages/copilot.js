"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
export default function Copilot() {
  const router = useRouter();
  const { url } = router.query;
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [iframeAllowed, setIframeAllowed] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWebsite, setShowWebsite] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const messagesEndRef = useRef(null);
  /* Load URL */
  useEffect(() => {
    if (!url) return;
    const decoded = decodeURIComponent(url);
    setWebsiteUrl(decoded);
  }, [url]);
/* Check if iframe loads */
useEffect(() => {
  if (!websiteUrl) return;
  let loaded = false;
  const iframe = document.createElement("iframe");
  iframe.src = websiteUrl;
  iframe.style.display = "none";

  iframe.onload = () => {
    loaded = true;
    setIframeAllowed(true);
    document.body.removeChild(iframe);
  };

  iframe.onerror = () => {
    loaded = true;
    setIframeAllowed(false);
    document.body.removeChild(iframe);
  };

  document.body.appendChild(iframe);

  /* timeout fallback */
  setTimeout(() => {
    if (!loaded) {
      setIframeAllowed(true);
      document.body.removeChild(iframe);
    }
  }, 3000);

}, [websiteUrl]);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Load history */
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

        if (data.length === 0) {
          setMessages([
            {
              role: "bot",
              text: "👋 Hi! Ask me anything about this website.",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        } else {
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
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
            url: websiteUrl,
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

        {/* WEBSITE */}
        {showWebsite && !fullscreen && (
          <div className="website">
            {iframeAllowed ? (
              <iframe
                src={websiteUrl}
                title="Website"
                className="iframe"
              />
            ) : (
              <div className="blocked">
                ❌ This website blocks iframe embedding.
                <br />
                You cannot chat with this site.
              </div>
            )}
          </div>
        )}

        {/* COPILOT */}
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

      <style jsx>{`
        .page {
          height: calc(100vh - 64px);
          margin-top: 64px;
          background: #020617;
        }

        .layout {
          display: flex;
          height: 100%;
        }

        .website {
          flex: 2;
        }

        .iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .blocked {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #ef4444;
          text-align: center;
          padding: 20px;
          font-weight: bold;
        }

        .copilot {
          flex: 1;
          min-width: 380px;
          display: flex;
          flex-direction: column;
          background: rgba(0,0,0,0.85);
          color: #fff;
        }

        .fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        .header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .online {
          font-size: 12px;
          color: #22c55e;
        }

        .messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .botMsg {
          background: rgba(255,255,255,0.1);
          padding: 12px;
          border-radius: 12px;
          max-width: 85%;
        }

        .userMsg {
          background: linear-gradient(135deg,#22c55e,#4ade80);
          color: #052e16;
          align-self: flex-end;
          padding: 12px;
          border-radius: 12px;
          max-width: 85%;
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
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .inputArea input {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        .inputArea button {
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg,#22c55e,#4ade80);
          color: #052e16;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width:1100px){
          .website{
            display:none;
          }

          .copilot{
            min-width:100%;
          }
        }
      `}</style>
    </div>
  );
}