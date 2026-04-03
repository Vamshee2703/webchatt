"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Copilot() {
  const router = useRouter();
  const { url } = router.query;

  const API = process.env.NEXT_PUBLIC_API_URL;

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!url) return;
    setWebsiteUrl(decodeURIComponent(url));
  }, [url]);

  /* LOAD SESSIONS */
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

      if (Array.isArray(data)) {
        setSessions(data);

        if (data.length > 0 && !sessionId) {
          setSessionId(data[0].session_id);
          loadChat(data[0].session_id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  /* LOAD CHAT */
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
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* NEW CHAT */
  const newChat = () => {
    setSessionId(`${Date.now()}`);
    setMessages([]);
  };

  /* DELETE CHAT */
  const deleteChat = async (sid) => {
    await fetch(`${API}/api/sessions/delete/${sid}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });

    fetchSessions();
    if (sid === sessionId) setMessages([]);
  };

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* SEND MESSAGE */
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
          time,
        },
      ]);

      fetchSessions();

    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Server error", time },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] mt-20 bg-slate-950 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-white/5 backdrop-blur-md border-r border-white/10 p-4 flex flex-col">

        <button
          onClick={newChat}
          className="mb-4 p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 text-black font-semibold"
        >
          + New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">

          {sessions.length === 0 && (
            <p className="text-gray-400">No chats yet</p>
          )}

          {sessions.map((s) => (
            <div key={s.session_id} className="flex gap-2 items-center">

              <div
                onClick={() => loadChat(s.session_id)}
                className={`flex-1 p-2 rounded cursor-pointer text-sm ${
                  s.session_id === sessionId
                    ? "bg-green-500 text-black"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {s.title}
              </div>

              <button
                onClick={() => deleteChat(s.session_id)}
                className="text-gray-400 hover:text-red-400"
              >
                🗑
              </button>

            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1">

        {/* WEBSITE */}
        <div className="hidden lg:block flex-[2] border-r border-white/10">
          <iframe src={websiteUrl} className="w-full h-full border-none" />
        </div>

        {/* CHAT */}
        <div className="flex flex-col flex-[1.2] max-w-md bg-black/80 backdrop-blur-md">

          {/* MESSAGES */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">

            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[85%] text-sm ${
                  m.role === "user"
                    ? "self-end bg-gradient-to-br from-green-500 to-emerald-400 text-black"
                    : "bg-white/10"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="bg-white/10 p-3 rounded-xl text-sm">
                🤖 Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="flex gap-2 p-3 border-t border-white/10 bg-black/70">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
              className="flex-1 p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none"
            />

            <button
              onClick={sendMessage}
              className="px-4 py-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 text-black font-semibold"
            >
              Send
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}