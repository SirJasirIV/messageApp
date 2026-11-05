import {disconnectSocket} from "./socket";

export function logout(navigate) {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
}

export function isTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64));
    return !exp || exp * 1000 > Date.now();
  } catch {
    return false;
  }
}