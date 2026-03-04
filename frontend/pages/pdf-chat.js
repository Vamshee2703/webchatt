"use client";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function PDFChat() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
    }
  }, [router]);  
  return (
    <div style={styles.page}>
      <h1>📄 PDF Chat</h1>
      <p>Upload your PDF and start chatting.</p>

      {/* You will integrate backend API here later */}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    paddingTop: "80px", // navbar spacing
    textAlign: "center",
  },
};