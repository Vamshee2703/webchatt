import { useState } from "react";
import { useRouter } from "next/router";

export default function Signup(){

  const router = useRouter();

  const  [email,setEmail] = useState("");
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSignup = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try{

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/signup/`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            email,
            username,
            password
          })
        }
      );

      const data = await res.json();

      if(!res.ok){
        setError(data?.error || "Signup failed");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully");

      setTimeout(()=>{
        router.push("/login");
      },1500);

    }catch(err){
      setError("Server error");
    }

    setLoading(false);

  };

  return(

    <div className="page">

      <div className="card">

        <form className="form" onSubmit={handleSignup}>

          <h2>Create Account</h2>

          <p className="subtitle">
            Start your AI journey
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            placeholder="Username"
            value={username}
            required
            onChange={(e)=>setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (min 8 chars)"
            value={password}
            required
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="link">
            Already have an account?{" "}
            <span onClick={()=>router.push("/login")}>
              Login
            </span>
          </div>

        </form>

      </div>

    </div>

  );
}