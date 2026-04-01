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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

      <div className="w-full max-w-md text-center">

        <div className="bg-black text-white p-8 rounded-2xl shadow-xl flex flex-col gap-4">

          <h2 className="text-xl font-semibold">
            Ask Anything From Websites or PDFs
          </h2>

          <div className="flex gap-3 justify-center">

            <button
              onClick={() => router.push("/webchat")}
              className="flex-1 p-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 font-semibold hover:opacity-90 transition"
            >
              Web Chat
            </button>

            <button
              onClick={() => window.open("http://localhost:8501", "_blank")}
              className="flex-1 p-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 font-semibold hover:opacity-90 transition"
            >
              PDF Chat
            </button>

            <button
              onClick={() => router.push("/forum")}
              className="flex-1 p-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 font-semibold hover:opacity-90 transition"
            >
              Forum
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}