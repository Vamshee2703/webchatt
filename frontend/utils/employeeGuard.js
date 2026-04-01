import { logout } from "./auth";

export const requireEmployee = async (router) => {
  const token = localStorage.getItem("access");

  if (!token) {
    router.push("/login");
    return null;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employee/me/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    // Not an employee or token invalid
    logout();
    router.push("/login");
    return null;
  }

  return await res.json();
};
