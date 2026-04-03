import { useState } from "react";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/signup/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Signup failed");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully");

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

      <div className="w-[420px] bg-white/5 backdrop-blur-lg border border-white/15 rounded-xl p-10">

        <form onSubmit={handleSignup} className="flex flex-col gap-4 text-center">

          <h2 className="text-2xl font-semibold">Create Account</h2>

          <p className="text-gray-400">Start your AI journey</p>

          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Username"
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (min 8 chars)"
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="p-3 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 font-semibold hover:opacity-90 transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <div className="text-gray-400 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-purple-400 cursor-pointer"
            >
              Login
            </span>
          </div>

        </form>

      </div>
    </div>
  );
}