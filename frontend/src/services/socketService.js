import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "/api";
const socketUrl = apiUrl.startsWith("http")
  ? new URL(apiUrl).origin
  : "https://pollify-uihx.onrender.com";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: false,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
