import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import enums from "../../constant/enum";
import { setupEmployeeAccount } from "../../Contexts/api";
import { loginSuccess } from "../../redux/slice/auth";

const { Title } = Typography;

const AccountSetup = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [form] = Form.useForm();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        const { username, password } = values;
        setError(null);
        setLoading(true);

        try {
            const res = await setupEmployeeAccount(token, username, password);
            const { accessToken, refreshToken, user } = res.data;

            dispatch(loginSuccess({
                accessToken,
                refreshToken,
                user,
                role: user.role,
            }));

            localStorage.setItem("auth", JSON.stringify({
                accessToken,
                refreshToken,
                user,
                role: user.role,
            }));

            if (user.role === enums.ROLES.OWNER) {
                navigate("/dashboard");
            } else if (user.role === enums.ROLES.EMPLOYEE) {
                navigate("/home");
            } else {
                navigate("/");
            }

        } catch (err) {
            setError(err.response?.data?.error || "Lỗi hệ thống.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" }}>
            <Card style={{ width: 400 }}>
                <Title level={3} style={{ textAlign: "center" }}>Thiết lập tài khoản</Title>

                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
                {success && <Alert message="Tài khoản đã được kích hoạt. Đang chuyển hướng..." type="success" showIcon style={{ marginBottom: 16 }} />}

                {!success && (
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            name="username"
                            label="Tên đăng nhập"
                            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                            hasFeedback
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            label="Xác nhận mật khẩu"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject("Mật khẩu không khớp!");
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block>
                                Kích hoạt tài khoản
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default AccountSetup;
