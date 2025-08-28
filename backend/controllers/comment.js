const { db, storage } = require("../config/firebase");
const { collection, addDoc, getDocs, Timestamp, doc, getDoc } = require("firebase/firestore");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { query, where } = require("firebase/firestore");

exports.createComment = async (req, res) => {
    try {
        const { userId, content, taskId } = req.body;

        if (!taskId) {
            return res.status(400).json({ message: "taskId là bắt buộc" });
        }

        let imageUrl = null;
        if (req.file) {
            const storageRef = ref(storage, `comments/${Date.now()}_${req.file.originalname}`);
            await uploadBytes(storageRef, req.file.buffer);
            imageUrl = await getDownloadURL(storageRef);
        }

        const docRef = await addDoc(collection(db, "comments"), {
            taskId,
            userId,
            content,
            imageUrl,
            createdAt: Timestamp.now(),
        });

        res.status(201).json({ message: "Bình luận thành công", id: docRef.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        if (!taskId) {
            return res.status(400).json({ message: "taskId là bắt buộc" });
        }

        const q = query(collection(db, "comments"), where("taskId", "==", taskId));
        const querySnapshot = await getDocs(q);

        const comments = [];
        for (const commentDoc of querySnapshot.docs) {
            const commentData = commentDoc.data();

            let userName = null;
            if (commentData.userId) {
                const userRef = doc(db, "employees", commentData.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    userName = userSnap.data().name;
                }
            }

            comments.push({
                id: commentDoc.id,
                ...commentData,
                userName, 
            });
        }

        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

