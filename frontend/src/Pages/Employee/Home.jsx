import { Layout, Menu } from 'antd';
import { useState } from 'react';
import HeaderBar from '../../Components/HeaderBar/HeaderBar';
import '../Owner/Dashboard.css';
import MessagePanel from '../Owner/MessagePanel/MessagePanel';
import TaskManager from '../Owner/TaskManager/TaskManager';
import UserInfo from './UserInfo/UserInfo';

const { Sider, Content } = Layout;

export default function Home() {
    const [selectedKey, setSelectedKey] = useState('1');

    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return (
                    <>
                        <h1 className="page-title">My Tasks</h1>
                        <TaskManager role="employee" />
                    </>
                );
            case '2':
                return (
                    <>
                        <h1 className="page-title">Messages</h1>
                        <MessagePanel role="employee" />
                    </>
                );
            case '3':
                return (
                    <>
                        <h1 className="page-title">User Info</h1>
                        <UserInfo />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }} className="dashboard-layout">
            <Sider width={200} className="site-sider">
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={(e) => setSelectedKey(e.key)}
                    className="menu"
                >
                    <Menu.Item key="1">My Tasks</Menu.Item>
                    <Menu.Item key="2">Messages</Menu.Item>
                    <Menu.Item key="3">User Info</Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <HeaderBar />
                <Content className="site-content">
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
}
