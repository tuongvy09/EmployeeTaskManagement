import { Button, Card, Descriptions, Divider, Input, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getEmployeeInfo, updateEmployeeInfo } from "../../../Contexts/api";
import "./UserInfo.css";

const UserInfo = () => {
    const user = useSelector((state) => state.auth.user);
    const [info, setInfo] = useState(null);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            setLoading(true);
            try {
                const res = await getEmployeeInfo(user.id);
                const userData = res.data?.user;
                setInfo(userData);
                setAddress(userData.address || "");
            } catch (err) {
                message.error("Không thể tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchUserInfo();
        }
    }, [user?.id]);

    const handleUpdate = async () => {
        if (!address.trim()) {
            return message.warning("Vui lòng nhập địa chỉ");
        }

        setUpdating(true);
        try {
            await updateEmployeeInfo(user.id, address);
            message.success("Cập nhật địa chỉ thành công!");
            setInfo((prev) => ({ ...prev, address }));
        } catch (err) {
            console.error("Cập nhật thất bại:", err);
            message.error("Không thể cập nhật địa chỉ.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !info) {
        return <Spin tip="Đang tải thông tin người dùng..." />;
    }

    return (
        <Card
            title="Thông tin cá nhân"
            bordered={false}
            style={{ maxWidth: 600, margin: "0 auto", marginTop: 32 }}
        >
            <Descriptions column={1} size="middle">
                <Descriptions.Item label="Tên">{info.name}</Descriptions.Item>
                <Descriptions.Item label="Username">{info.username}</Descriptions.Item>
                <Descriptions.Item label="Email">{info.email}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{info.phoneNumber}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">{info.role}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{info.status}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {new Date(info.createdAt).toLocaleString("vi-VN")}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="address-section">
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Địa chỉ:</div>
                <Input.TextArea
                    placeholder="Nhập địa chỉ của bạn"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                />
                <Button
                    type="primary"
                    onClick={handleUpdate}
                    loading={updating}
                    style={{ marginTop: 12 }}
                >
                    Cập nhật địa chỉ
                </Button>
            </div>
        </Card>
    );
};

export default UserInfo;
