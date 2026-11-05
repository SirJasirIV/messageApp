export const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  const isAuthRoute = path.startsWith("/auth"); 
  const token = isAuthRoute ? null : localStorage.getItem("token");
  const isForm = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  
  if (response.status === 401 && token) {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login"; 
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}