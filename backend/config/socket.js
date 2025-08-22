const { Server } = require("socket.io");
const { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } = require("firebase/firestore");
const { db } = require("./firebase");

const onlineUsers = new Map();
let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.on("connection", (socket) => {
        console.log(`⚡ New client connected: ${socket.id}`);

        socket.on("join", (userId) => {
            onlineUsers.set(userId, socket.id);
        });

        socket.on("sendMessage", async (data) => {
            const { conversationId, senderId, receiverId, message } = data;
            const messageRef = collection(db, `messages/${conversationId}/items`);
            const newMsg = {
                senderId,
                receiverId,
                message,
                timestamp: serverTimestamp(),
                isRead: false,
            };

            try {
                const msgDoc = await addDoc(messageRef, newMsg);

                const notifRef = collection(db, "notifications");
                const newNotif = {
                    type: "message",
                    senderId,
                    receiverId,
                    conversationId,
                    message,
                    timestamp: serverTimestamp(),
                    isRead: false,
                };
                await addDoc(notifRef, newNotif);

                const receiverSocket = onlineUsers.get(receiverId);

                if (receiverSocket) {
                    io.to(receiverSocket).emit("receiveMessage", {
                        id: msgDoc.id,
                        ...newMsg,
                        conversationId,
                    });
                    io.to(receiverSocket).emit("receiveNotification", newNotif);
                } else {
                    console.log(`⚠️ Receiver ${receiverId} is not online`);
                }
            } catch (err) {
                console.error("Error sending message:", err);
            }
        });

        socket.on("typing", ({ receiverId, conversationId }) => {
            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit("typing", { conversationId });
            }
        });

        socket.on("markAsRead", async ({ conversationId }) => {
            try {
                const msgColRef = collection(db, `messages/${conversationId}/items`);
                const snapshot = await getDocs(msgColRef);

                const updates = snapshot.docs.map((msgDoc) =>
                    updateDoc(doc(db, `messages/${conversationId}/items`, msgDoc.id), {
                        isRead: true,
                    })
                );

                await Promise.all(updates);
            } catch (error) {
                console.error("Error marking messages as read:", error);
            }
        });

        socket.on("disconnect", () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

function getIO() {
    if (!io) {
        throw new Error("Socket.io chưa được khởi tạo!");
    }
    return io;
}

module.exports = { initSocket, onlineUsers, getIO };
