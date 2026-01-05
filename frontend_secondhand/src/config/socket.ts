import { io, Socket } from "socket.io-client";
import { ENV } from "./env";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  const token = localStorage.getItem("token") || "";

  socket = io(ENV.API_BASE_URL.replace("/api", ""), {
    transports: ["websocket"],
    withCredentials: true,
    auth: { token },
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return socket;
}


