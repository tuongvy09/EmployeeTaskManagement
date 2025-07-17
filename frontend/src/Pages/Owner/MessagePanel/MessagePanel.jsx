import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { createConversation, getConversationMessages, getConversations, getEmployees } from "../../../Contexts/api";
import useSocket from "../../../Hooks/useSocket";
import "./MessagePanel.css";

const MessagePanel = ({ role }) => {
    const currentUser = useSelector((state) => state.auth.user);
    const currentUserId = currentUser?._id || currentUser?.id || "owner_123";

    const socket = useSocket(currentUserId);

    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeout = useRef(null);
    const [employeeList, setEmployeeList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");


    const fetchEmployees = async () => {
        try {
            const response = await getEmployees();
            const employees = response.data.employees;
            setEmployeeList(employees);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchConversations = async () => {
        if (!currentUserId) return;
        const res = await getConversations(currentUserId);
        const processedConversations = res.data.map((conv) => {
            const otherUser = conv.participants.find((p) => p.id !== currentUserId);
            return {
                ...conv,
                otherUser,
            };
        });

        setConversations(processedConversations);

        if (processedConversations.length > 0) {
            setSelectedConvId(processedConversations[0].conversationId);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [currentUserId]);

    useEffect(() => {
        if (!selectedConvId || !socket) return;

        const fetchMessages = async () => {
            const res = await getConversationMessages(selectedConvId);
            setMessages(res.data);
            socket.emit("markAsRead", { conversationId: selectedConvId });
        };

        fetchMessages();
    }, [selectedConvId, socket]);

    useEffect(() => {
        if (!socket) return;
        const handleReceiveMessage = (msg) => {
            if (msg.conversationId === selectedConvId) {
                setMessages((prev) => [...prev, msg]);
                socket.emit("markAsRead", { conversationId: msg.conversationId });
            } else {
                console.log("Message does not belong to current conversation, ignored");
            }
        };

        const handleTyping = ({ conversationId }) => {
            if (conversationId === selectedConvId) {
                setTypingUser("Typing...");
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => {
                    setTypingUser(null);
                }, 2000);
            } else {
                console.log("Typing does not belong to current conversation, ignored");
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("typing", handleTyping);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("typing", handleTyping);
        };
    }, [socket, selectedConvId]);


    const handleSend = () => {
        if (!input.trim() || !socket) return;

        const selectedConversation = conversations.find(c => c.conversationId === selectedConvId);
        const receiverId = selectedConversation.otherUser.id;

        const messageData = {
            conversationId: selectedConvId,
            senderId: currentUserId,
            receiverId,
            message: input,
        };

        socket.emit("sendMessage", messageData);

        setMessages((prev) => [...prev, { from: "me", content: input }]);
        setInput("");
    };

    const handleTyping = () => {
        if (!socket || !selectedConvId) return;

        const selectedConversation = conversations.find(c => c.conversationId === selectedConvId);
        const receiverId = selectedConversation?.otherUser?.id;

        if (!receiverId) return;

        socket.emit("typing", {
            receiverId,
            conversationId: selectedConvId,
        });
    };


    const fetchConversationMessages = async (conversationId) => {
        try {
            const res = await getConversationMessages(conversationId);
            setMessages(res.data);

            if (socket) {
                socket.emit("markAsRead", { conversationId });
            }
        } catch (err) {
            console.error("Lỗi khi lấy nội dung hội thoại:", err);
        }
    };
    useEffect(() => {
        if (!selectedConvId) return;
        fetchConversationMessages(selectedConvId);
    }, [selectedConvId]);

    const handleSelectEmployee = async (employee) => {
        const existingConversation = conversations.find((conv) =>
            conv.participants?.includes(employee.id)
        );

        if (existingConversation) {
            setSelectedConvId(existingConversation.conversationId);
            fetchConversationMessages(existingConversation.conversationId);
        } else {
            try {
                const res = await createConversation({
                    ownerId: currentUserId,
                    employeeId: employee.id,
                });

                const { conversationId, messages } = res.data;
                setSelectedConvId(conversationId);
                setMessages(messages);

                fetchConversations();
            } catch (err) {
                console.error("Không thể tạo đoạn chat mới", err);
            }
        }
    };


    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                {role !== "employee" && (
                    <div className="chat-header">
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhân viên..."
                            className="employee-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <div className="employee-list-container">
                            {employeeList
                                .filter((emp) =>
                                    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((emp) => (
                                    <div className="employee-card" onClick={() => handleSelectEmployee(emp)}>
                                        <div className="employee-avatar">{emp.name.charAt(0).toUpperCase()}</div>
                                        <div className="employee-info">
                                            <div className="employee-name">{emp.name}</div>
                                            <div className="employee-email">{emp.email}</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                <h4>Danh sách hội thoại</h4>
                {conversations.map((conv) => {
                    const otherId = conv.participants?.find(id => id !== currentUserId);
                    const otherUser = employeeList.find(e => e.id === otherId);
                    return (
                        <div
                            key={conv.conversationId}
                            className={`chat-user ${conv.conversationId === selectedConvId ? "active" : ""}`}
                            onClick={() => {
                                setSelectedConvId(conv.conversationId);
                                fetchConversationMessages(conv.conversationId);
                            }}
                        >
                            <div className="chat-avatar">{otherUser?.name?.charAt(0).toUpperCase() || "👤"}</div>
                            <div className="chat-user-info">
                                <div className="chat-username">{conv.otherUser?.name || "Unknown User"}</div>
                                <div className="chat-last-message"></div>

                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Main Chat */}
            <div className="chat-main">
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`chat-message ${msg.senderId === currentUserId || msg.from === "me"
                                ? "from-me"
                                : "from-other"
                                }`}
                        >
                            {msg.message || msg.content}
                        </div>
                    ))}

                    {typingUser && (
                        <div className="chat-message typing-indicator">
                            <span>Typing</span>
                            <span className="dot">.</span>
                            <span className="dot">.</span>
                            <span className="dot">.</span>
                        </div>
                    )}
                </div>

                <div className="chat-input-container">
                    <input
                        type="text"
                        value={input}
                        placeholder="Reply message"
                        className="chat-input"
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSend();
                            else handleTyping();
                        }}
                    />
                    <button className="chat-send-button" onClick={handleSend}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessagePanel;
