import { io } from "socket.io-client";
import { API_URL } from "./api";

let socket = null;

export function getSocket() {
    if (socket) return socket;

    const token = localStorage.getItem("token");
    if (!token) return null;

    socket = io(`${API_URL}/`, { auth: { token } });
    return socket;
}

export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
}