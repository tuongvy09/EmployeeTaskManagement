const { db } = require("../config/firebase");
const { collection, query, where, getDocs, doc, getDoc, updateDoc } = require("firebase/firestore");


exports.getTasksAssignedToEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { status, startDate, endDate } = req.query;

        if (!employeeId) {
            return res.status(400).json({ error: "Missing employeeId" });
        }

        const tasksRef = collection(db, "tasks");
        let conditions = [where("assignee", "==", employeeId)];

        if (status && status !== "all") {
            conditions.push(where("status", "==", status));
        }

        if (startDate && endDate) {
            conditions.push(where("dueDate", ">=", new Date(startDate)));
            conditions.push(where("dueDate", "<=", new Date(endDate)));
        }

        let q;
        if (conditions.length > 0) {
            q = query(tasksRef, ...conditions);
        } else {
            q = tasksRef;
        }

        const snapshot = await getDocs(q);

        const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.json({ success: true, tasks });
    } catch (error) {
        console.error("❌ Error fetching tasks for employee:", error);
        return res.status(500).json({ error: "Server error", message: error.message });
    }
};


exports.getEmployeeInfo = async (req, res) => {
    const { userId } = req.params;

    try {
        const userRef = doc(db, "employees", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
        }

        return res.json({ success: true, user: { id: userSnap.id, ...userSnap.data() } });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

exports.updateEmployeeInfo = async (req, res) => {
    const { userId } = req.params;
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ success: false, message: "Địa chỉ không được để trống" });
    }

    try {
        const userRef = doc(db, "employees", userId);
        await updateDoc(userRef, { address });

        return res.json({ success: true, message: "Cập nhật địa chỉ thành công" });
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin:", error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
};