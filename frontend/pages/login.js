import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError("Invalid email or password");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      router.push("/dashboard");

    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

      <div className="w-[420px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-10">

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-center">

          <h2 className="text-2xl font-semibold">Welcome Back 👋</h2>

          <p className="text-gray-400 text-sm">
            Login to ContextIQ
          </p>

          <input
            placeholder="Email"
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="p-3 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 font-semibold hover:opacity-90 transition"
          >
            Sign In
          </button>

          {error && <p className="text-red-500">{error}</p>}

          <div className="text-gray-400 text-sm">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="text-purple-400 cursor-pointer"
            >
              Sign up
            </span>
          </div>

        </form>

      </div>
    </div>
  );
}