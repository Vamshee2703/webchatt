import { useEffect } from "react";
import { useRouter } from "next/router";
import { requireEmployee } from "../utils/employeeGuard";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    requireEmployee(router).then((user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });
  }, []);

  return <p style={{ padding: 30 }}>Checking access…</p>;
}