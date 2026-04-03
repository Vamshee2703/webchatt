import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <section className="relative h-screen flex flex-col items-center justify-center text-center gap-5">

        <div className="absolute inset-0 opacity-5 z-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:70px_70px]" />

        <div className="absolute bottom-[-180px] left-1/2 -translate-x-1/2 w-[900px] opacity-90 animate-pulse z-0">
          <svg viewBox="0 0 600 600" className="w-full blur-sm">
            <defs>
              <radialGradient id="g1" cx="40%" cy="30%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="40%" stopColor="#7c3aed" />
                <stop offset="80%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
            </defs>
            <ellipse cx="300" cy="300" rx="260" ry="220" fill="url(#g1)" />
          </svg>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold max-w-4xl z-10">
          AI-Powered Knowledge Hub <br />
          For Websites, PDFs & Discussions
        </h1>

        <p className="text-gray-400 max-w-xl z-10">
          ContextIQ lets you chat with websites, analyze PDFs, and explore discussions.
        </p>

        <button
          onClick={() => router.push("/signup")}
          className="mt-3 px-6 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition z-10"
        >
          Start Exploring
        </button>

      </section>
    </div>
  );
}