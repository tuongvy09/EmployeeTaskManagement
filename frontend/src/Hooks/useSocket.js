import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.REACT_APP_BASE_URL_API || "http://localhost:8000";

const useSocket = (userId) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const newSocket = io(SOCKET_SERVER_URL, {
            transports: ["websocket"],
            reconnectionAttempts: 5,
            auth: { userId },
        });

        newSocket.on("connect", () => {
            newSocket.emit("join", userId);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    return socket;
};

export default useSocket;
