
const priorityColor = {
    doing: "#faad14",
    done: "#52c41a",
    unassigned: "#f5222d",
};

const TaskEvent = ({ event }) => {
    return (
        <div
            style={{
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: priorityColor[event.status] || "#1890ff",
                color: "#fff",
                fontSize: "12px",
            }}
        >
            {event.title}
        </div>
    );
};

export default TaskEvent;
