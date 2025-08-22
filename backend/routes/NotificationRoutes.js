const express = require("express");
const {
    getNotificationsByUser,
    countUnreadNotifications,
    markAllNotificationsAsRead,
} = require("../controllers/Notification");

const router = express.Router();

router.get("/:userId", getNotificationsByUser);

router.get("/:userId/unread-count", countUnreadNotifications);

router.put("/read/:userId", markAllNotificationsAsRead);

module.exports = router;
