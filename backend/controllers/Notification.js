const { db } = require("../config/firebase");
const { collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc, writeBatch } = require("firebase/firestore");

const getNotificationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const q = query(
            collection(db, "notifications"),
            where("receiverId", "==", userId),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("Error getNotificationsByUser:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const countUnreadNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const q = query(
            collection(db, "notifications"),
            where("receiverId", "==", userId),
            where("isRead", "==", false)
        );

        const snapshot = await getDocs(q);

        res.status(200).json({
            success: true,
            unreadCount: snapshot.size,
        });
    } catch (error) {
        console.error("Error countUnreadNotifications:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }

        const q = query(
            collection(db, "notifications"),
            where("receiverId", "==", userId),
            where("isRead", "==", false)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                message: "No unread notifications found",
            });
        }

        const batch = writeBatch(db);
        snapshot.forEach((docSnap) => {
            batch.update(docSnap.ref, { isRead: true });
        });
        await batch.commit();

        res.status(200).json({
            success: true,
            message: `Marked ${snapshot.size} notifications as read`,
        });
    } catch (error) {
        console.error("Error markAllNotificationsAsRead:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNotificationsByUser,
    countUnreadNotifications,
    markAllNotificationsAsRead,
};
