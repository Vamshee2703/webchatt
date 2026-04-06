import { useState } from "react";
import { useRouter } from "next/router";

export default function WebChat() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    setError("");

    if (!url) {
      setError("Please enter a website URL");
      return;
    }

    let formattedUrl = url;

    if (!url.startsWith("http")) {
      formattedUrl = "https://" + url;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError("Invalid URL format");
      return;
    }

    const token = localStorage.getItem("access");

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crawl/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!res.ok) {
        setError("Website not reachable or crawl failed");
        setLoading(false);
        return;
      }

      router.push(`/copilot?url=${encodeURIComponent(formattedUrl)}`);

    } catch (err) {
      setError("Unable to connect to the website");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOADER UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">

        <div className="w-14 h-14 border-4 border-gray-600 border-t-purple-600 rounded-full animate-spin"></div>

        <p className="mt-5 text-gray-300">
          Crawling website and preparing AI assistant...
        </p>

      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

      <div className="w-[400px] bg-black p-8 rounded-2xl flex flex-col gap-4">

        <h2 className="text-xl font-semibold text-center">
          Chat With Any Website
        </h2>

        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          className="p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <button
          onClick={startChat}
          className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 font-semibold hover:opacity-90 transition"
        >
          Start Chat
        </button>

      </div>

    </div>
  );
}