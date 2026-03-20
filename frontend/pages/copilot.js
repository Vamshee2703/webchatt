"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Copilot() {
  const router = useRouter();
  const { url } = router.query;

  const API = process.env.NEXT_PUBLIC_API_URL;

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [iframeAllowed, setIframeAllowed] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWebsite, setShowWebsite] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]);

  const messagesEndRef = useRef(null);

  /* Load URL */
  useEffect(() => {
    if (!url) return;
    setWebsiteUrl(decodeURIComponent(url));
  }, [url]);

  /* 🔥 LOAD SESSIONS (FIXED) */
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API}/api/sessions/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      console.log("Sessions API:", data);

      if (Array.isArray(data)) {
        setSessions(data);

        // auto load first session
        if (data.length > 0 && !sessionId) {
          setSessionId(data[0].session_id);
          loadChat(data[0].session_id);
        }
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error(err);
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  /* 🔥 LOAD CHAT */
  const loadChat = async (sid) => {
    try {
      setSessionId(sid);

      const res = await fetch(
        `${API}/api/copilot/history/?session_id=${sid}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* 🔥 NEW CHAT */
  const newChat = () => {
    const newSession = `${Date.now()}`;
    setSessionId(newSession);
    setMessages([]);
  };

  /* 🔥 DELETE CHAT */
  const deleteChat = async (sid) => {
    try {
      await fetch(`${API}/api/sessions/delete/${sid}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      fetchSessions();

      if (sid === sessionId) {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* 🔥 SEND MESSAGE (FIXED) */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", text: input, time },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/copilot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          question: input,
          url: websiteUrl,
          session_id: sessionId,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.answer || "⚠️ No answer found",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      // 🔥 reload sidebar
      fetchSessions();

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Server error", time },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appWrapper">

      {/* SIDEBAR */}
      <div className="sidebar">
        <button className="newChatBtn" onClick={newChat}>
          + New Chat
        </button>

        <div className="history">
          {sessions.length === 0 && (
            <div style={{ color: "#aaa" }}>No chats yet</div>
          )}

          {sessions.map((s) => (
            <div key={s.session_id} className="historyRow">
              
              <div
                className={`historyItem ${
                  s.session_id === sessionId ? "active" : ""
                }`}
                onClick={() => loadChat(s.session_id)}
              >
                {s.title}
              </div>

              <button
                className="deleteBtn"
                onClick={() => deleteChat(s.session_id)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="layout">

          {showWebsite && !fullscreen && (
            <div className="website">
              <iframe src={websiteUrl} className="iframe" />
            </div>
          )}

          <div className="copilot">
            <div className="messages">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "userMsg" : "botMsg"}>
                  {m.text}
                </div>
              ))}
              {loading && <div className="botMsg">🤖 Thinking...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="inputArea">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
  .appWrapper {
    display: flex;
    height: calc(100vh - 80px);
    margin-top: 80px;
    background: #020617;
    color: white;
  }

  /* SIDEBAR */
  .sidebar {
    width: 260px;
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(255,255,255,0.08);
    padding: 14px;
    display: flex;
    flex-direction: column;
  }

  .newChatBtn {
    padding: 12px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg,#22c55e,#4ade80);
    color: #052e16;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 14px;
  }

  .history {
    flex: 1;
    overflow-y: auto;
  }

  .historyRow {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .historyItem {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    cursor: pointer;
    font-size: 14px;
    transition: 0.2s;
  }

  .historyItem:hover {
    background: rgba(255,255,255,0.1);
  }

  .historyItem.active {
    background: #22c55e;
    color: black;
  }

  .deleteBtn {
    background: none;
    border: none;
    color: #aaa;
    cursor: pointer;
    font-size: 14px;
  }

  /* MAIN */
  .main {
    flex: 1;
  }

  .layout {
    display: flex;
    height: 100%;
  }

  /* WEBSITE */
  .website {
    flex: 2.2;
    border-right: 1px solid rgba(255,255,255,0.05);
  }

  .iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  /* CHAT */
  .copilot {
    flex: 1.2;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(10px);
  }

  /* MESSAGES */
  .messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .botMsg {
    background: rgba(255,255,255,0.08);
    padding: 12px;
    border-radius: 12px;
    max-width: 85%;
    font-size: 14px;
    line-height: 1.4;
  }

  .userMsg {
    background: linear-gradient(135deg,#22c55e,#4ade80);
    color: #052e16;
    padding: 12px;
    border-radius: 12px;
    max-width: 85%;
    align-self: flex-end;
    font-size: 14px;
    line-height: 1.4;
  }

  /* INPUT */
  .inputArea {
    display: flex;
    gap: 8px;
    padding: 14px;
    border-top: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.7);
  }

  .inputArea input {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    outline: none;
    background: rgba(255,255,255,0.1);
    color: white;
    font-size: 14px;
  }

  .inputArea input::placeholder {
    color: #aaa;
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

  /* MOBILE */
  @media (max-width:1100px){
    .website {
      display: none;
    }

    .copilot {
      max-width: 100%;
    }

    .sidebar {
      width: 200px;
    }
  }
`}</style>
    </div>
  );
}