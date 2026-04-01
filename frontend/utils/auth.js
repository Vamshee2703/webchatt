export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access");
};

export const isLoggedIn = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};
