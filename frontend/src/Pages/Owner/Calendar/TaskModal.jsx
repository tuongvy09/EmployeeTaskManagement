import { ClockCircleOutlined, InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Divider, Drawer, Select, Space, Tag, Typography } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { assignTask, completeTask } from "../../../Contexts/api";

const { Title, Text } = Typography;

const statusColor = {
    doing: "#faad14",
    done: "#52c41a",
    unassigned: "#f5222d",
};

const TaskPanel = ({ open, onClose, task, role, employeeList, onRefresh }) => {
    const [assignedUsers, setAssignedUsers] = useState({});
    const [loading, setLoading] = useState(false);

    if (!task) return null;

    const formatDate = (date) => {
        if (!date) return "Chưa có";
        if (date.seconds) return new Date(date.seconds * 1000).toLocaleString();
        return new Date(date).toLocaleString();
    };

    const handleAssignTask = async (taskId) => {
        const employeeId = assignedUsers[taskId];
        if (!employeeId) return toast.warning("Vui lòng chọn người để giao task.");

        setLoading(true);
        try {
            await assignTask(taskId, employeeId);
            toast.success("Giao task thành công");
            onClose();
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Không thể giao task.");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTask = async (taskId) => {
        setLoading(true);
        try {
            await completeTask(taskId);
            toast.success("Task đã được đánh dấu hoàn thành.");
            onRefresh();
            onClose();
        } catch (error) {
            toast.error("Không thể hoàn thành task.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            title={<Title level={4}>Chi tiết</Title>}
            placement="right"
            onClose={onClose}
            open={open}
            width={500}
            bodyStyle={{ padding: 24 }}
        >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Space direction="vertical" size={2}>
                    <Text strong>Tiêu đề:</Text>
                    <Text>{task.title}</Text>
                </Space>
                <Divider />

                <Space direction="vertical" size={2}>
                    <Text strong>Mô tả:</Text>
                    <Text>{task.description || "Chưa có mô tả"}</Text>
                </Space>
                <Divider />

                <Space direction="horizontal" size="small" align="center">
                    <ClockCircleOutlined />
                    <Text strong>Deadline:</Text>
                    <Text>{formatDate(task.dueDate)}</Text>
                </Space>
                <Divider />

                <Space direction="horizontal" size="small" align="center">
                    <UserOutlined />
                    <Text strong>Người phụ trách:</Text>
                    <Text>{task.assigneeName || "Chưa có"}</Text>
                </Space>
                <Divider />

                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Space direction="horizontal" size="small" align="center">
                        <InfoCircleOutlined />
                        <Text strong>Trạng thái:</Text>
                        <Tag color={statusColor[task.status] || "blue"}>{task.status}</Tag>
                    </Space>

                    {role === "owner" && task.status === "unassigned" && (
                        <div style={{ width: "100%" }}>
                            <Select
                                placeholder="Chọn người giao task"
                                style={{ width: "100%", marginBottom: 8 }}
                                value={assignedUsers[task.id]}
                                onChange={(val) =>
                                    setAssignedUsers({ ...assignedUsers, [task.id]: val })
                                }
                            >
                                {employeeList.map((emp) => (
                                    <Select.Option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </Select.Option>
                                ))}
                            </Select>

                            <Button
                                block
                                type="primary"
                                disabled={!assignedUsers[task.id]}
                                onClick={() => handleAssignTask(task.id)}
                                loading={loading}
                            >
                                Giao task
                            </Button>
                        </div>
                    )}

                    {role === "employee" && task.status === "doing" && (
                        <Button
                            block
                            type="primary"
                            onClick={() => handleCompleteTask(task.id)}
                            loading={loading}
                        >
                            Hoàn thành task
                        </Button>
                    )}
                </Space>
            </Space>
        </Drawer>
    );
};

export default TaskPanel;
