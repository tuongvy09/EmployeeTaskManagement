import { NotificationFilled } from "@ant-design/icons";
import { Badge, Card, Dropdown, List, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getNotificationsByUser } from "../../Contexts/api";
import useSocket from "../../Hooks/useSocket";

const { Text } = Typography;

const NotificationDropdown = ({ count }) => {
    const user = useSelector((state) => state.auth.user);
    const userId = user?.id;
    const socket = useSocket(userId);

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!socket) return;

        socket.on("receiveNotification", (notif) => {
            console.log("New notification received:", notif);
            setNotifications((prev) => [notif, ...prev]);
        });

        return () => {
            socket.off("receiveNotification");
        };
    }, [socket]);

    const fetchNotifications = async () => {
        const response = await getNotificationsByUser(userId);
        setNotifications(response?.data?.data || []);
    };

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    const menuContent = (
        <Card
            style={{
                width: 320,
                maxHeight: 300,
                overflowY: "auto",
                borderRadius: 8,
            }}
            bodyStyle={{ padding: "12px" }}
        >
            <List
                dataSource={Array.isArray(notifications) ? notifications : []}
                renderItem={(item) => {
                    let content = null;

                    switch (item.type) {
                        case "message":
                            content = (
                                <Typography.Paragraph
                                    ellipsis={{ rows: 1, tooltip: item.message }}
                                    style={{ marginBottom: 0 }}
                                >
                                    💬 Tin nhắn mới: <b>{item.message}</b>
                                </Typography.Paragraph>
                            );
                            break;

                        case "task_assigned":
                            content = (
                                <Typography.Paragraph
                                    ellipsis={{ rows: 1, tooltip: item.taskTitle }}
                                    style={{ marginBottom: 0 }}
                                >
                                    📝 Bạn vừa được giao task: <b>{item.taskTitle}</b>
                                </Typography.Paragraph>
                            );
                            break;

                        case "task_reminder":
                            content = (
                                <Typography.Paragraph
                                    ellipsis={{ rows: 1, tooltip: item.taskTitle }}
                                    style={{ marginBottom: 0 }}
                                >
                                    ⏳ Task sắp hết hạn: <b>{item.taskTitle}</b>
                                </Typography.Paragraph>
                            );
                            break;

                        case "task_expired":
                            content = (
                                <Typography.Paragraph
                                    ellipsis={{ rows: 1, tooltip: item.taskTitle }}
                                    style={{ marginBottom: 0 }}
                                >
                                    ⛔ Task đã hết hạn: <b>{item.taskTitle}</b>
                                </Typography.Paragraph>
                            );
                            break;

                        default:
                            content = (
                                <Typography.Paragraph
                                    ellipsis={{ rows: 1, tooltip: item.message }}
                                    style={{ marginBottom: 0 }}
                                >
                                    {item.message || "Thông báo hệ thống"}
                                </Typography.Paragraph>
                            );
                    }

                    return (
                        <List.Item
                            style={{
                                backgroundColor: item.isRead ? "#fff" : "#f0f5ff",
                                borderRadius: 8,
                                padding: "12px 16px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {content}
                                <div style={{ fontSize: 12, color: "#999" }}>
                                    {item.timestamp?.seconds
                                        ? dayjs.unix(item.timestamp.seconds).format("DD/MM/YYYY HH:mm")
                                        : ""}
                                </div>
                            </div>

                            {!item.isRead && (
                                <Tag color="blue" style={{ flexShrink: 0, marginLeft: 8 }}>
                                    Mới
                                </Tag>
                            )}
                        </List.Item>

                    );
                }}
            />
        </Card>
    );

    return (
        <Dropdown
            dropdownRender={() => menuContent}
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            trigger={["click"]}
        >
            <Badge count={count} offset={[-2, 4]}>
                <NotificationFilled
                    style={{
                        fontSize: "24px",
                        color: "#00000099",
                        marginRight: "8px",
                        cursor: "pointer",
                    }}
                />
            </Badge>
        </Dropdown>
    );
};

export default NotificationDropdown;
