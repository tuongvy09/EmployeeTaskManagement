const { db } = require("../config/firebase");
const { collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc } = require("firebase/firestore");

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

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notifRef = doc(db, "notifications", notificationId);
        const notifSnap = await getDoc(notifRef);

        if (!notifSnap.exists()) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        await updateDoc(notifRef, { isRead: true });

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    } catch (error) {
        console.error("Error markNotificationAsRead:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNotificationsByUser,
    countUnreadNotifications,
    markNotificationAsRead,
};
