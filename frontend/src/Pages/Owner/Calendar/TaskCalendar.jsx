import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Button, Col, Row } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { createTask, getEmployees, getTasks, getTasksAssignedToEmployee } from "../../../Contexts/api";
import CreateTaskModal from "../CreateTaskModal.jsx/CreateTaskModal";
import CalendarToolbar from "./CalendarToolbar";
import TaskEvent from "./TaskEvent";
import TaskPanel from "./TaskModal";

const localizer = momentLocalizer(moment);

const convertToDate = (value) => {
    if (!value) return null;

    if (typeof value === "object" && value.seconds) {
        return new Date(value.seconds * 1000);
    }

    if (typeof value === "string") {
        return new Date(value);
    }

    return null;
};

const TaskCalendar = ({ role, status = "all" }) => {
    const currentUser = useSelector((state) => state.auth.user);
    const userId = currentUser?.id;

    const [date, setDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [refreshTasks, setRefreshTasks] = useState(false);

    const fetchTasks = async (currentDate) => {
        const startDate = moment(currentDate).startOf("month").toISOString();
        const endDate = moment(currentDate).endOf("month").toISOString();

        try {
            let res;
            if (role === "owner") {
                res = await getTasks(status, startDate, endDate);
            } else if (role === "employee" && userId) {
                res = await getTasksAssignedToEmployee(userId, status, startDate, endDate);
            }

            if (res?.data?.tasks) {
                setTasks(res.data.tasks);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error("❌ Lỗi fetch tasks:", error);
            setTasks([]);
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
        fetchTasks(date);
    }, [date, role, status, userId, refreshTasks]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleCreateTask = async (values) => {
        setLoading(true);
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
            toast.success("Đã tạo task thành công!");
            setIsModalOpen(false);
            setRefreshTasks((prev) => !prev);
        } catch (error) {
            toast.error("Tạo task thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const events = tasks.map((task) => ({
        id: task.id,
        title: `${task.title} - ${task.assigneeName || ""}`,
        start: convertToDate(task.createdAt),
        end: convertToDate(task.dueDate),
        status: task.status,
        resource: task,
    }));

    const handleNavigate = (newDate) => {
        setDate(newDate);
    };

    const handleSelectEvent = (event) => {
        setSelectedTask(event.resource);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
        setModalOpen(false);
    };

    return (
        <>
            <ToastContainer />
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                </Col>
                {role === "owner" && (
                    <Col>
                        <Button type="primary" onClick={() => setIsModalOpen(true)}>
                            + Tạo Task
                        </Button>
                    </Col>
                )}
                {role === "owner" && (
                    <CreateTaskModal
                        visible={isModalOpen}
                        onCreate={handleCreateTask}
                        onCancel={() => setIsModalOpen(false)}
                        loading={loading}
                        employeeList={employeeList}
                    />
                )}
            </Row>
            <Calendar
                localizer={localizer}
                events={events}
                date={date}
                onNavigate={handleNavigate}
                defaultView="month"
                views={["month", "week", "day"]}
                components={{
                    toolbar: CalendarToolbar,
                    event: TaskEvent,
                }}
                style={{ height: 600 }}
                popup
                onSelectEvent={handleSelectEvent}
            />

            <TaskPanel
                role={role}
                open={modalOpen}
                onClose={handleCloseModal}
                task={selectedTask}
                employeeList={employeeList}
                onRefresh={() => setRefreshTasks(prev => !prev)}
            />
        </>
    );
};

export default TaskCalendar;
