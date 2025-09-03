require("dotenv").config();
const { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, deleteDoc, addDoc, serverTimestamp, Timestamp, getCountFromServer } = require("firebase/firestore");
const { db } = require("../config/firebase.js");
const { onlineUsers, getIO } = require("../config/socket.js");

const createTask = async (req, res) => {
    const { title, description, dueDate, assignee } = req.body;

    try {
        if (!title || !dueDate) {
            return res.status(400).json({ message: "Thiếu tiêu đề hoặc ngày hết hạn." });
        }

        const newTask = {
            title,
            description: description || "",
            dueDate: Timestamp.fromDate(new Date(dueDate)),
            assignee: assignee || null,
            assigneeName: assignee ? (await getDoc(doc(db, "employees", assignee))).data().name : null,
            status: assignee ? "doing" : "unassigned",
            reminderSent: false,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "tasks"), newTask);

        if (assignee) {
            const newNotif = {
                type: "task_assigned",
                senderId: "system",
                receiverId: assignee,
                taskId: docRef.id,
                taskTitle: title,
                timestamp: serverTimestamp(),
                isRead: false,
            };

            await addDoc(collection(db, "notifications"), newNotif);

            const receiverSocket = onlineUsers.get(assignee);

            if (receiverSocket) {
                getIO().to(receiverSocket).emit("receiveNotification", newNotif);
            }
        }

        return res.status(201).json({ id: docRef.id, ...newTask });
    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Lỗi khi tạo task", error: error.message });
    }
};

const assignTask = async (req, res) => {
    const { id } = req.params;
    const { assignee } = req.body;

    try {
        const taskRef = doc(db, "tasks", id);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {
            return res.status(404).json({ message: "Không tìm thấy task" });
        }

        const taskData = taskSnap.data();

        const empRef = doc(db, "employees", assignee);
        const empSnap = await getDoc(empRef);

        if (!empSnap.exists()) {
            return res.status(404).json({ message: "Không tìm thấy nhân viên" });
        }

        const empName = empSnap.data().name;

        await updateDoc(taskRef, {
            assignee: assignee,
            assigneeName: empName,
            status: "doing",
        });

        const newNotif = {
            type: "task_assigned",
            senderId: "system",
            receiverId: assignee,
            taskId: id,
            taskTitle: taskData.title,
            timestamp: serverTimestamp(),
            isRead: false,
        };

        await addDoc(collection(db, "notifications"), newNotif);

        const receiverSocket = onlineUsers.get(assignee);

        if (receiverSocket) {
            getIO().to(receiverSocket).emit("receiveNotification", newNotif);
        }
        return res.status(200).json({ message: "Giao task thành công" });
    } catch (error) {
        console.error("Lỗi khi giao task:", error);
        return res.status(500).json({ message: "Lỗi khi giao task", error: error.message });
    }
};

const getTasks = async (req, res) => {
    const { status, startDate, endDate } = req.query;

    try {
        const taskRef = collection(db, "tasks");
        let conditions = [];

        if (status && status !== "all") {
            conditions.push(where("status", "==", status));
        }

        if (startDate && endDate) {
            conditions.push(where("dueDate", ">=", new Date(startDate)));
            conditions.push(where("dueDate", "<=", new Date(endDate)));
        }

        const q = conditions.length > 0 ? query(taskRef, ...conditions) : taskRef;

        const snapshot = await getDocs(q);

        const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách task:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy task",
            error: error.message,
        });
    }
};


const completeTask = async (req, res) => {
    const { id } = req.params;

    try {
        const taskRef = doc(db, "tasks", id);
        const snapshot = await getDoc(taskRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "Task không tồn tại" });
        }

        await updateDoc(taskRef, {
            status: "done",
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return res.status(200).json({ message: "Task đã hoàn thành" });
    } catch (error) {
        console.error("Lỗi khi hoàn thành task:", error);
        return res.status(500).json({ message: "Lỗi khi cập nhật task", error: error.message });
    }
};

// --- 1. Summary ---
const getSummary = async (req, res) => {
    try {
        const snap = await getDocs(collection(db, "tasks"));
        const tasks = snap.docs.map(doc => doc.data());
        const now = new Date();

        const summary = {
            total: tasks.length,
            doing: tasks.filter(t => t.status === "doing").length,
            done: tasks.filter(t => t.status === "done").length,
            overdue: tasks.filter(t => {
                if (!t.dueDate) return false;
                const due = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
                return due < now && t.status !== "done";
            }).length,
        };

        res.status(200).json({ success: true, data: summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to get summary" });
    }
};

// --- 2. Upcoming Tasks ---
const getUpcoming = async (req, res) => {
    try {
        const now = new Date();
        const snap = await getDocs(collection(db, "tasks"));
        const tasks = snap.docs.map(doc => doc.data());

        const upcoming = tasks
            .filter(t => {
                const due = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
                return due > now && (due - now) / (1000 * 60 * 60 * 24) <= 3 && t.status !== "done";
            })
            .map(t => ({
                title: t.title,
                deadline: t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate),
            }));

        res.status(200).json({ success: true, data: upcoming });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to get upcoming tasks" });
    }
};

// --- 3. Overdue Tasks ---
const getOverdue = async (req, res) => {
    try {
        const now = new Date();
        const snap = await getDocs(collection(db, "tasks"));
        const tasks = snap.docs.map(doc => doc.data());

        const overdue = tasks
            .filter(t => {
                const due = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
                return due < now && t.status !== "done";
            })
            .map(t => ({
                title: t.title,
                deadline: t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate),
            }));

        res.status(200).json({ success: true, data: overdue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to get overdue tasks" });
    }
};

// --- 4. Completion Rates ---
const getCompletionRates = async (req, res) => {
    try {
        const snap = await getDocs(collection(db, "tasks"));
        const tasks = snap.docs.map(doc => doc.data());

        const memberStats = {};
        tasks.forEach(t => {
            if (!t.assigneeName) return;

            if (!memberStats[t.assigneeName]) {
                memberStats[t.assigneeName] = { assigned: 0, completedOnTime: 0 };
            }

            memberStats[t.assigneeName].assigned++;

            if (t.status === "done") {
                const due = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
                const completedAt = t.updatedAt
                    ? (t.updatedAt.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt))
                    : due;
                if (completedAt <= due) memberStats[t.assigneeName].completedOnTime++;
            }
        });

        const completionRates = Object.entries(memberStats).map(([name, stat]) => ({
            name,
            assigned: stat.assigned,
            onTimeRate: stat.assigned > 0
                ? Math.round((stat.completedOnTime / stat.assigned) * 100)
                : 0,
        }));

        res.status(200).json({ success: true, data: completionRates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to get completion rates" });
    }
};


// --- 5. Contributions ---
const getContributions = async (req, res) => {
    try {
        const snap = await getDocs(collection(db, "tasks"));
        const tasks = snap.docs.map(doc => doc.data());

        const doneTasks = tasks.filter(t => t.status === "done");

        const totalCompleted = doneTasks.length;

        const memberStats = {};
        doneTasks.forEach(t => {
            if (!t.assigneeName) return;
            if (!memberStats[t.assigneeName]) {
                memberStats[t.assigneeName] = { completed: 0 };
            }
            memberStats[t.assigneeName].completed++;
        });

        const contributions = Object.entries(memberStats).map(([name, stat]) => ({
            name,
            percent: totalCompleted > 0 ? Math.round((stat.completed / totalCompleted) * 100) : 0,
        }));

        res.status(200).json({ success: true, data: contributions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to get contributions" });
    }
};


module.exports = {
    createTask,
    assignTask,
    getTasks,
    completeTask,
    getSummary,
    getUpcoming,
    getOverdue,
    getCompletionRates,
    getContributions
};