import { Descriptions, Modal } from "antd";

const TaskModal = ({ visible, onClose, task }) => {
    if (!task) return null;

    return (
        <Modal open={visible} onCancel={onClose} footer={null} title="Chi tiết Task">
            <Descriptions column={1}>
                <Descriptions.Item label="Tiêu đề">{task.title}</Descriptions.Item>
                <Descriptions.Item label="Deadline">
                    {new Date(task.deadline).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Priority">{task.priority}</Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default TaskModal;
