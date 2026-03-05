import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { logout } from "../utils/auth";

export default function Navbar() {
  const router = useRouter();

  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkAuth = () => {
      const token = localStorage.getItem("access");
      setIsAuth(!!token);
    };

    checkAuth();
    router.events.on("routeChangeComplete", checkAuth);

    return () => {
      router.events.off("routeChangeComplete", checkAuth);
    };
  }, [router.events]);

  if (!mounted) return null;

  return (
    <nav style={styles.nav}>
      {/* LOGO + TITLE */}
      <div
        style={styles.logoBox}
        onClick={() => router.push(isAuth ? "/dashboard" : "/")}
      >
        <img src="/logo.webp" alt="ChatAI" style={styles.logoImg} />
        <span style={styles.logoText}>ChatAI</span>
      </div>

      {/* LINKS */}
      <div style={styles.links}>
        {isAuth ? (
          <>
            <Link href="/dashboard" style={styles.link}>
              Dashboard
            </Link>

            <button
              style={styles.logout}
              onClick={() => {
                logout();
                setIsAuth(false);
                router.push("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={styles.link}>
              Login
            </Link>

            <Link href="/signup" style={styles.link}>
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
const styles = {
  nav: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "64px",
  padding: "0 28px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",

  borderBottom: "1px solid rgba(255,255,255,0.15)",
  zIndex: 1000,
},

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },

  logoImg: {
    width: "34px",
    height: "34px",
    objectFit: "contain",
    animation: "logoFloat 4s ease-in-out infinite",
  },

  logoText: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#ffffff",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  link: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontWeight: 500,
  },

  logout: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};