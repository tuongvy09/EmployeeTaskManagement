require("dotenv").config();
const { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, deleteDoc, addDoc, serverTimestamp } = require("firebase/firestore");
const { db } = require("../config/firebase.js");
const { io } = require("../config/socket.js");

const createTask = async (req, res) => {
    const { title, description, dueDate, assignee } = req.body;

    try {
        if (!title || !dueDate) {
            return res.status(400).json({ message: "Thiếu tiêu đề hoặc ngày hết hạn." });
        }

        const newTask = {
            title,
            description: description || "",
            dueDate,
            assignee: assignee || null,
            assigneeName: assignee ? (await getDoc(doc(db, "employees", assignee))).data().name : null,
            status: assignee ? "doing" : "unassigned",
            reminderSent: false,
            createdAt: new Date().toISOString(),
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

            io.to(assignee).emit("receiveNotification", newNotif);
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

        io.to(assignee).emit("receiveNotification", newNotif);

        return res.status(200).json({ message: "Giao task thành công" });
    } catch (error) {
        console.error("Lỗi khi giao task:", error);
        return res.status(500).json({ message: "Lỗi khi giao task", error: error.message });
    }
};

const getTasks = async (req, res) => {
    const { status } = req.query;

    try {
        const taskRef = collection(db, "tasks");
        const q = status ? query(taskRef, where("status", "==", status)) : taskRef;

        const snapshot = await getDocs(q);

        const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách task:", error);
        return res.status(500).json({ success: false, message: "Lỗi khi lấy task", error: error.message });
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

        await updateDoc(taskRef, { status: "done" });

        return res.status(200).json({ message: "Task đã hoàn thành" });
    } catch (error) {
        console.error("Lỗi khi hoàn thành task:", error);
        return res.status(500).json({ message: "Lỗi khi cập nhật task", error: error.message });
    }
};

module.exports = {
    createTask,
    assignTask,
    getTasks,
    completeTask
};