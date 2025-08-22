import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu, message } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUnreadNotificationsCount } from '../../Contexts/api';
import useSocket from '../../Hooks/useSocket';
import { logout } from '../../redux/slice/auth';
import NotificationModal from '../NotificationModal/NotificationModal';
import './HeaderBar.css';

const { Header } = Layout;

export default function HeaderBar() {
    const user = useSelector((state) => state.auth.user);
    const userId = user?.id;
    const socket = useSocket(userId);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!socket) return;

        socket.on("receiveNotification", (notif) => {
            console.log("New notification received:", notif);
            setCount((prev) => prev + 1);
        });

        return () => {
            socket.off("receiveNotification");
        };
    }, [socket]);

    const handleLogout = () => {
        dispatch(logout());
        message.success("Đăng xuất thành công");
        navigate('/');
    };

    const fetchCountUnReadNoti = async () => {
        const response = await getUnreadNotificationsCount(userId);
        setCount(response?.data?.unreadCount);
    };

    useEffect(() => {
        fetchCountUnReadNoti();
    }, [userId]);

    const menu = (
        <Menu>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    return (
        <Header className="site-header">
            <div className="header-right">
                <NotificationModal count={count} setCount={setCount} />
                <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                    <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                </Dropdown>
            </div>
        </Header>
    );
}
