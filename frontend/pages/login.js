import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");

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
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{margin:'10px'}}>
        <div className="auth-form">
          <h2>Welcome Back 👋</h2>
          <p className="auth-subtitle">Login to Web Copilot</p>

          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

          <button onClick={handleLogin}>Sign In</button>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-link">
            Don’t have an account?{" "}
            <span onClick={() => router.push("/signup")}>Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
}