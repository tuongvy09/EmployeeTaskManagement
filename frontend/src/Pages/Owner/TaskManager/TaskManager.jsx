import {
    Button,
    Card,
    Col,
    message,
    Row,
    Select,
    Tabs,
    Tag,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { assignTask, completeTask, createTask, getEmployees, getTasks, getTasksAssignedToEmployee } from "../../../Contexts/api";
import CreateTaskModal from "../CreateTaskModal.jsx/CreateTaskModal";

const TaskManager = ({ role }) => {
    const currentUser = useSelector((state) => state.auth.user);
    const userId = currentUser?.id;

    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assignedUsers, setAssignedUsers] = useState({});
    const [employeeList, setEmployeeList] = useState([]);

    const handleCreateTask = async (values) => {
        try {
            const taskData = {
                title: values.title,
                description: values.description,
                dueDate: values.dueDate,
                assignee: values.assignee || null,
            };

            const res = await createTask(taskData);
            const newTask = res.data;

            setTasks((prev) => [...prev, newTask]);
            message.success("Đã tạo task thành công!");
            setIsModalOpen(false);
        } catch (error) {
            message.error("Tạo task thất bại!");
        }
    };

    const fetchTasks = async () => {
        try {
            let res;
            if (role === "owner") {
                res = await getTasks(activeTab === "all" ? undefined : activeTab);
            } else if (role === "employee") {
                res = await getTasksAssignedToEmployee(
                    userId,
                    activeTab === "all" ? undefined : activeTab
                );
            }

            const taskList = Array.isArray(res?.data?.tasks)
                ? res.data.tasks.map((task) => ({
                    ...task,
                    dueDate: dayjs(task.dueDate),
                }))
                : [];

            setTasks(taskList);
        } catch (error) {
            message.error("Không thể tải danh sách task");
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [activeTab]);

    const handleAssignTask = async (taskId) => {
        const employeeId = assignedUsers[taskId];

        if (!employeeId) {
            return message.warning("Vui lòng chọn người để giao task.");
        }

        try {
            await assignTask(taskId, employeeId);
            message.success("Giao task thành công");
            fetchTasks();
        } catch (error) {
            console.error("Lỗi khi giao task:", error);
            message.error("Không thể giao task.");
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            await completeTask(taskId);
            message.success("Task đã được đánh dấu hoàn thành.");
            fetchTasks();
        } catch (error) {
            message.error("Không thể hoàn thành task.");
        }
    };

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

    const renderStatusTag = (status) => {
        switch (status) {
            case "unassigned":
                return <Tag color="orange">Chưa giao</Tag>;
            case "doing":
                return <Tag color="blue">Đang làm</Tag>;
            case "done":
                return <Tag color="green">Hoàn thành</Tag>;
            default:
                return null;
        }
    };

    const filteredTasks = tasks.filter((task) => {
        if (activeTab === "all") return true;
        return task.status === activeTab;
    });

    return (
        <div className="task-manager" style={{ padding: "24px" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <h1>Task Manager</h1>
                </Col>
                {role === "owner" && (
                    <Col>
                        <Button type="primary" onClick={() => setIsModalOpen(true)}>
                            + Tạo Task
                        </Button>
                    </Col>
                )}
            </Row>

            {role === "owner" && (
                <CreateTaskModal
                    visible={isModalOpen}
                    onCreate={handleCreateTask}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}

            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
                type="card"
            >
                <Tabs.TabPane tab="Tất cả" key="all" />
                {role === "owner" && <Tabs.TabPane tab="Chưa giao" key="unassigned" />}
                <Tabs.TabPane tab="Đang làm" key="doing" />
                <Tabs.TabPane tab="Hoàn thành" key="done" />
            </Tabs>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {filteredTasks.length === 0 ? (
                    <Col span={24}>
                        <Card>
                            <p style={{ textAlign: "center" }}>
                                Không có task nào ở mục này.
                            </p>
                        </Card>
                    </Col>
                ) : (
                    filteredTasks.map((task) => (
                        <Col span={8} key={task.id}>
                            <Card
                                title={task.title}
                                extra={renderStatusTag(task.status)}
                                actions={[
                                    role === "employee" && task.status === "doing" && (
                                        <Button
                                            type="link"
                                            onClick={() => handleCompleteTask(task.id)}
                                        >
                                            Hoàn thành
                                        </Button>
                                    ),
                                    role === "owner" && task.status === "unassigned" && (
                                        <div style={{ padding: "0 16px", width: "100%" }}>
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
                                            >
                                                Giao task
                                            </Button>
                                        </div>
                                    ),
                                ].filter(Boolean)}
                            >
                                <p>
                                    <b>Giao cho:</b> {task.assignee || "Chưa giao"}
                                </p>
                                <p>
                                    <b>Hạn:</b> {dayjs(task.dueDate).format("DD/MM/YYYY")}
                                </p>
                                <p>{task.description}</p>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </div>
    );
};

export default TaskManager;
