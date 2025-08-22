const express = require("express");
const {
    getNotificationsByUser,
    countUnreadNotifications,
    markNotificationAsRead,
} = require("../controllers/Notification");

const router = express.Router();

router.get("/:userId", getNotificationsByUser);

router.get("/:userId/unread-count", countUnreadNotifications);

router.put("/read/:notificationId", markNotificationAsRead);

module.exports = router;
