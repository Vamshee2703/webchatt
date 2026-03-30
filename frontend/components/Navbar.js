import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {

    const checkAuth = () => {
      const token = localStorage.getItem("access");
      setIsLoggedIn(!!token);
      console.log("this is token",token)
    };

    checkAuth();

    router.events.on("routeChangeComplete", checkAuth);

    return () => {
      router.events.off("routeChangeComplete", checkAuth);
    };

  }, [router.events]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="logo" onClick={() => router.push("/")}>
        ContextIQ
      </div>

      {/* NAV LINKS */}
      <div className="nav-links">

        <Link href="/">About</Link>

        <Link href="/dashboard">Chat</Link>

        <Link href="/contact">Contact</Link>

        <Link href="/faq">FAQ</Link>

      </div>

      {/* AUTH SECTION */}
      <div className="auth-buttons">

        {!isLoggedIn ? (
          <>
            <button
              className="login"
              onClick={() => router.push("/login")}
            >
              Login
            </button>

            <button
              className="signup"
              onClick={() => router.push("/signup")}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            <button
              className="profile"
              onClick={() => router.push("/profile")}
            >
              Profile
            </button>

            <button
              className="logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </div>

      <style jsx>{`

        .navbar{
          position:fixed;
          top:20px;
          left:50%;
          transform:translateX(-50%);
          width:85%;
          max-width:1100px;
          height:60px;

          display:flex;
          align-items:center;
          justify-content:space-between;

          padding:0 25px;

          background:rgba(20,20,30,0.6);
          backdrop-filter:blur(12px);

          border-radius:12px;
          z-index:1000;
        }

        .logo{
          color:white;
          font-size:18px;
          font-weight:600;
          cursor:pointer;
        }

        .nav-links{
          display:flex;
          gap:25px;
        }

        .nav-links a{
          color:white;
          text-decoration:none;
          font-size:14px;
          font-weight:500;
        }

        .nav-links a:hover{
          color:#a78bfa;
        }

        .auth-buttons{
          display:flex;
          gap:10px;
        }

        .login{
          background:transparent;
          border:1px solid #444;
          color:white;
          padding:8px 14px;
          border-radius:20px;
          cursor:pointer;
        }

        .signup{
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          border:none;
          color:white;
          padding:8px 16px;
          border-radius:20px;
          cursor:pointer;
        }

        .profile{
          background:rgba(255,255,255,0.1);
          border:none;
          color:white;
          padding:8px 14px;
          border-radius:20px;
          cursor:pointer;
        }

        .logout{
          background:#ef4444;
          border:none;
          color:white;
          padding:8px 16px;
          border-radius:20px;
          cursor:pointer;
        }

      `}</style>

    </nav>
  );
}