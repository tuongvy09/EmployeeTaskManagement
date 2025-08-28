import { ClockCircleOutlined, InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Drawer, Select, Space, Tag, Typography } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { assignTask, completeTask } from "../../../Contexts/api";
import TaskComments from "./TaskComments";

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
            title={<Title level={4} style={{ margin: 0 }}>{task.title}</Title>}
            placement="right"
            onClose={onClose}
            open={open}
            width={900}
            bodyStyle={{ padding: 20, overflowY: "auto" }}
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>

                {/* Metadata */}
                <Space size="large" wrap style={{ fontSize: 13 }}>
                    <Space>
                        <ClockCircleOutlined />
                        <Text type="secondary">Deadline:</Text>
                        <Text>{formatDate(task.dueDate)}</Text>
                    </Space>

                    <Space>
                        <UserOutlined />
                        <Text type="secondary">Phụ trách:</Text>
                        <Text>{task.assigneeName || "Chưa có"}</Text>
                    </Space>

                    <Space>
                        <InfoCircleOutlined />
                        <Text type="secondary">Trạng thái:</Text>
                        <Tag color={statusColor[task.status] || "blue"}>{task.status}</Tag>
                    </Space>
                </Space>

                {/* Mô tả */}
                <div>
                    <Text strong>Mô tả</Text>
                    <Divider style={{ margin: "6px 0" }} />
                    <Text>{task.description || "Chưa có mô tả"}</Text>
                </div>

                {/* Action */}
                {(role === "owner" && task.status === "unassigned") && (
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Select
                            placeholder="Chọn người giao task"
                            style={{ width: "100%" }}
                            value={assignedUsers[task.id]}
                            onChange={(val) => setAssignedUsers({ ...assignedUsers, [task.id]: val })}
                        >
                            {employeeList.map((emp) => (
                                <Select.Option key={emp.id} value={emp.id}>
                                    {emp.name}
                                </Select.Option>
                            ))}
                        </Select>
                        <Button
                            type="primary"
                            block
                            disabled={!assignedUsers[task.id]}
                            onClick={() => handleAssignTask(task.id)}
                            loading={loading}
                        >
                            Giao task
                        </Button>
                    </Space>
                )}

                {(role === "employee" && task.status === "doing") && (
                    <Button
                        type="primary"
                        block
                        onClick={() => handleCompleteTask(task.id)}
                        loading={loading}
                    >
                        Hoàn thành task
                    </Button>
                )}

                {/* Comment */}
                <Card size="small" title="Bình luận" bordered={false} style={{ background: "#fafafa" }}>
                    <TaskComments taskId={task.id} />
                </Card>
            </Space>
        </Drawer>
    );
};

export default TaskPanel;
