
const priorityColor = {
    Low: "#52c41a",
    Medium: "#faad14",
    High: "#f5222d",
};

const TaskEvent = ({ event }) => {
    return (
        <div
            style={{
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: priorityColor[event.priority] || "#1890ff",
                color: "#fff",
                fontSize: "12px",
            }}
        >
            {event.title}
        </div>
    );
};

export default TaskEvent;
