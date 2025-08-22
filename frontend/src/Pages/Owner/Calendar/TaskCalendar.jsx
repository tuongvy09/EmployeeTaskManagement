import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import CalendarToolbar from "./CalendarToolbar";
import TaskEvent from "./TaskEvent";

const localizer = momentLocalizer(moment);

const mockTasks = [
    {
        id: 1,
        title: "Thiết kế UI Dashboard",
        deadline: moment().add(1, "day").toDate(),
        priority: "High",
    },
    {
        id: 2,
        title: "Fix bug đăng nhập",
        deadline: moment().add(3, "days").toDate(),
        priority: "Medium",
    },
    {
        id: 3,
        title: "Viết test case cho API",
        deadline: moment().subtract(2, "days").toDate(),
        priority: "Low",
    },
];

const TaskCalendar = ({ tasks = mockTasks }) => {
    const events = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.deadline),
        end: new Date(task.deadline),
        priority: task.priority,
    }));

    return (
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            components={{
                event: TaskEvent,        // custom hiển thị task
                toolbar: CalendarToolbar, // custom toolbar
            }}
        />
    );
};

export default TaskCalendar;
