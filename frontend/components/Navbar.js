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
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[1100px] h-[60px] flex items-center justify-between px-6 bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg z-[9999] text-white">

      <div
        onClick={() => router.push("/")}
        className="font-semibold text-lg cursor-pointer"
      >
        ContextIQ
      </div>

      <div className="hidden md:flex gap-6 text-sm">
        <Link href="/">About</Link>
        <Link href="/dashboard">Chat</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/faq">FAQ</Link>
      </div>

      <div className="flex gap-2">
        {!isLoggedIn ? (
          <>
            <button onClick={() => router.push("/login")} className="px-4 py-2 border rounded-full">
              Login
            </button>
            <button onClick={() => router.push("/signup")} className="px-4 py-2 bg-purple-600 rounded-full">
              Sign up
            </button>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/profile")} className="px-4 py-2 bg-white/10 rounded-full">
              Profile
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 rounded-full">
              Logout
            </button>
          </>
        )}
      </div>

    </nav>
  );
}