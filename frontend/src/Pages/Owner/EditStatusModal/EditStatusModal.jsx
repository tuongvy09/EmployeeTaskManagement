// components/EditStatusModal.jsx
import { Modal, Select } from 'antd';

const { Option } = Select;

const EditStatusModal = ({ visible, onOk, onCancel, status, setStatus, employee }) => {
    return (
        <Modal
            title="Edit Employee Status"
            visible={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText="Update"
        >
            <p><strong>Employee:</strong> {employee?.name}</p>
            <Select
                value={status}
                style={{ width: '100%' }}
                onChange={(value) => setStatus(value)}
            >
                <Option value="Active">Active</Option>
                <Option value="InActive">InActive</Option>
                <Option value="Pending">Pending</Option>
            </Select>
        </Modal>
    );
};

export default EditStatusModal;
