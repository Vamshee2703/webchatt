"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function PDFChat() {

  const router = useRouter();

  useEffect(() => {

    const token = localStorage.getItem("access");

    console.log("JWT TOKEN:", token);  // 👈 ADD THIS

    if (!token) {
      router.push("/login");
      return;
    }

    window.location.href = `http://localhost:8501/?token=${token}`;

  }, [router]);

  return (
    <div style={styles.page}>
      <h1>📄 PDF Chat</h1>
      <p>Redirecting to PDF chat...</p>
    </div>
  );
}