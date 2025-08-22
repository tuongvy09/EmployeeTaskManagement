import { differenceInMinutes, isBefore } from "date-fns";
import cron from "node-cron";
import { getDatabase } from "../config/firebase.js";

const db = getDatabase();

cron.schedule("0 * * * *", async () => {
    const snapshot = await db.ref("tasks").once("value");
    const tasks = snapshot.val();

    if (!tasks) return;

    const now = new Date();

    for (const [taskId, task] of Object.entries(tasks)) {
        if (!task.dueDate || !task.assignee) continue;
        const deadline = new Date(task.dueDate);

        if (isBefore(deadline, now)) {
            const notif = {
                type: "task_expired",
                taskId,
                taskTitle: task.title,
                receiverId: task.assignee,
                message: `Task "${task.title}" đã hết hạn!`,
                timestamp: new Date().toISOString(),
                isRead: false,
            };

            await db.ref("notifications").push(notif);

            const receiverSocket = onlineUsers.get(task.assignee);

            if (receiverSocket) {
                getIO().to(receiverSocket).emit("receiveNotification", notif);
            }
        } else {
            const diffMinutes = differenceInMinutes(deadline, now);

            if (diffMinutes <= 120 && diffMinutes > 60) {
                const notif = {
                    type: "task_reminder",
                    taskId,
                    taskTitle: task.title,
                    receiverId: task.assignee,
                    message: `Task "${task.title}" sẽ hết hạn sau ${Math.floor(diffMinutes / 60)}h${diffMinutes % 60}p`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                };

                await db.ref("notifications").push(notif);

                const receiverSocket = onlineUsers.get(task.assignee);

                if (receiverSocket) {
                    getIO().to(receiverSocket).emit("receiveNotification", notif);
                }
            }
        }
    }
});
