import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"]
});

export const useSocket = () => {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", user.id);
    }
  }, [user]);

  return socket;
};

export default socket;
