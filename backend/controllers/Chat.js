const { collection, query, where, getDocs, getDoc, doc, addDoc, serverTimestamp, orderBy } = require("firebase/firestore");
const { db } = require("../config/firebase");

const getUserInfo = async (id) => {
    let ref = doc(db, "employees", id);
    let snap = await getDoc(ref);
    if (snap.exists()) return { id, role: "employee", ...snap.data() };

    ref = doc(db, "owners", id);
    snap = await getDoc(ref);
    if (snap.exists()) return { id, role: "owner", ...snap.data() };

    return { id, role: "unknown", name: "Không xác định" };
};

const getAllConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        const convRef = collection(db, "conversations");
        const q = query(
            convRef,
            where("participants", "array-contains", userId),
            orderBy("lastMessage.timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        const conversations = [];

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const participantIds = data.participants;

            const participantsInfo = await Promise.all(participantIds.map(getUserInfo));

            conversations.push({
                conversationId: docSnap.id,
                ...data,
                participants: participantsInfo,
            });
        }

        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: error.message });
    }
};

const getConversationDetail = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const msgRef = collection(db, `messages/${conversationId}/items`);
        const q = query(msgRef, orderBy("timestamp"));

        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: error.message });
    }
};

const createConversation = async (req, res) => {
    const { ownerId, employeeId } = req.body;

    try {
        const convRef = collection(db, "conversations");

        const q = query(convRef, where("participants", "array-contains", ownerId));
        const snapshot = await getDocs(q);

        let existingConv = null;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            if (data.participants.includes(employeeId)) {
                existingConv = { id: docSnap.id, ...data };
                break;
            }
        }

        if (existingConv) {
            const msgRef = collection(db, `messages/${existingConv.id}/items`);
            const msgSnap = await getDocs(msgRef);
            const messages = msgSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            return res.status(200).json({
                conversationId: existingConv.id,
                messages,
            });
        }

        const newConv = await addDoc(convRef, {
            participants: [ownerId, employeeId],
            createdAt: serverTimestamp(),
            lastMessage: {
                message: "",
                timestamp: serverTimestamp(),
                senderId: "",
                receiverId: ""
            }
        });

        res.status(201).json({ conversationId: newConv.id, messages: [] });

    } catch (err) {
        console.error("Error creating conversation:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllConversations,
    createConversation,
    getConversationDetail,
};