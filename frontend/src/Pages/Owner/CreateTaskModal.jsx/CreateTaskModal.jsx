import { PlusOutlined } from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Form,
    Input,
    Modal,
    Row,
    Select,
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const CreateTaskModal = ({ visible, onCreate, onCancel, loading, employeeList }) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        onCreate(values);
        form.resetFields();
    };

    return (
        <Modal
            open={visible}
            title="Tạo Task mới"
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            footer={null}
        >
            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="title"
                            label="Tiêu đề"
                            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                        >
                            <Input placeholder="Nhập tiêu đề task..." />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="assignee" label="Giao cho">
                            <Select placeholder="Chọn người được giao (có thể bỏ trống)">
                                {employeeList.map((employee) => (
                                    <Option key={employee.id} value={employee.id}>
                                        {employee.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="dueDate"
                            label="Ngày hết hạn"
                            rules={[{ required: true, message: "Chọn ngày!" }]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                disabledDate={(current) => {
                                    return current && current < dayjs().startOf("day");
                                }} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="description" label="Mô tả">
                            <Input.TextArea rows={2} placeholder="Nhập mô tả..." />
                        </Form.Item>
                    </Col>
                </Row>
                <div style={{ textAlign: "right" }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={loading}>
                        Tạo Task
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateTaskModal;
