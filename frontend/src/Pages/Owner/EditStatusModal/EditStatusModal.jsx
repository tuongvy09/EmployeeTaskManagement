// components/EditStatusModal.jsx
import { Modal, Select } from 'antd';

const { Option } = Select;

const EditStatusModal = ({ visible, onOk, onCancel, status, setStatus, employee, loading }) => {
    return (
        <Modal
            title="Edit Employee Status"
            visible={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText="Update"
            confirmLoading={loading}
        >
            <p><strong>Employee:</strong> {employee?.name}</p>
            <Select
                value={status}
                style={{ width: '100%' }}
                onChange={(value) => setStatus(value)}
            >
                <Option value="Active">Active</Option>
                <Option value="InActive">InActive</Option>
            </Select>
        </Modal>
    );
};

export default EditStatusModal;
