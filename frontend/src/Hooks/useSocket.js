import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.REACT_APP_BASE_URL_API || "http://localhost:8000";

let socketInstance = null;

const useSocket = (userId) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!userId) return;

        if (!socketInstance) {
            socketInstance = io(SOCKET_SERVER_URL, {
                transports: ["websocket"],
                reconnectionAttempts: 5,
                auth: { userId },
            });

            socketInstance.on("connect", () => {
                socketInstance.emit("join", userId);
                console.log("Socket connected:", socketInstance.id);
            });

            socketInstance.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason);
            });
        }

        setSocket(socketInstance);
        return () => { };
    }, [userId]);

    return socket;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};

export default useSocket;
