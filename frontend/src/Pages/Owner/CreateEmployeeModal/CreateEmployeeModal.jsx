import { Button, Col, Form, Input, Modal, Row, Select, message } from 'antd';
import { createEmployee } from '../../../Contexts/api';
import './CreateEmployeeModal.css';

const { Option } = Select;

const CreateEmployeeModal = ({ visible, onClose, onCreate }) => {
    const [form] = Form.useForm();

    const handleSubmit = async (formValues) => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                address: values.address ?? null,
            };

            await createEmployee(payload);
            message.success('Employee created successfully!');
            form.resetFields();
            onClose();

            if (onCreate) onCreate();
        } catch (error) {
            console.error(error);
            message.error('Failed to create employee.');
        }
    };

    return (
        <Modal
            title={<div className="custom-title">Create Employee</div>}
            open={visible}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            footer={null}
            centered
            width={700}
            className="create-employee-modal"
        >
            <Form layout="vertical" form={form}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Employee Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter employee name' }]}
                        >
                            <Input placeholder="Enter employee name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Phone Number"
                            name="phoneNumber"
                            rules={[{ required: true, message: 'Please enter phone number' }]}
                        >
                            <Input placeholder="Enter phone number" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Email Address"
                            name="email"
                            rules={[
                                { required: true, message: 'Please enter email' },
                                { type: 'email', message: 'Invalid email format' }
                            ]}
                        >
                            <Input placeholder="Enter email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Role"
                            name="role"
                            rules={[{ required: true, message: 'Please select a role' }]}
                        >
                            <Select placeholder="Select role">
                                <Option value="owner">Owner</Option>
                                <Option value="employee">Employee</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <Form.Item label="Address" name="address">
                            <Input placeholder="Enter address" />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="btn-wrapper">
                    <Button type="primary" onClick={handleSubmit}>Create</Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateEmployeeModal;
