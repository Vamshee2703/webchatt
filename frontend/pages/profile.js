import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Profile() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

      <div className="w-[400px] p-10 relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">

        {/* CLOSE BUTTON */}
        <button
          onClick={() => router.back()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-5">
          User Profile
        </h2>

        {/* USERNAME */}
        <div className="mb-4">
          <p className="text-xs text-gray-400">Username</p>
          <p className="mt-1">{profile.username}</p>
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <p className="text-xs text-gray-400">Email</p>
          <p className="mt-1">{profile.email}</p>
        </div>

        {/* ID */}
        <div className="mb-4">
          <p className="text-xs text-gray-400">User ID</p>
          <p className="mt-1">{profile.id}</p>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            router.push("/login");
          }}
          className="mt-5 w-full p-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 font-semibold hover:opacity-90 transition"
        >
          Logout
        </button>

      </div>

    </div>
  );
}