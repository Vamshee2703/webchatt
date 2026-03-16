import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e) => {

    e.preventDefault(); // prevents page reload
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
    <div className="page">

      <div className="blob"></div>

      <div className="auth-card">

        {/* FORM */}
        <form className="auth-form" onSubmit={handleLogin}>

          <h2>Welcome Back 👋</h2>

          <p className="auth-subtitle">
            Login to ContextIQ
          </p>

          <input
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* submit button */}
          <button type="submit">
            Sign In
          </button>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-link">
            Don’t have an account?{" "}
            <span onClick={() => router.push("/signup")}>
              Sign up
            </span>
          </div>

        </form>

      </div>

    </div>
  );
}