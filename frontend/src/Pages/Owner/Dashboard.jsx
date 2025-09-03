import { Layout, Menu } from 'antd';
import { useState } from 'react';
import HeaderBar from '../../Components/HeaderBar/HeaderBar';
import TaskCalendar from './Calendar/TaskCalendar';
import './Dashboard.css';
import DashboardLayout from './Dashboard/DashboardLayout';
import EmployeeTable from './EmployeeTable/EmployeeTable';
import MessagePanel from './MessagePanel/MessagePanel';

const { Sider, Content } = Layout;

export default function Dashboard() {
    const [selectedKey, setSelectedKey] = useState('1');

    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return (
                    <>
                        <h1 className="page-title">Manage Employee</h1>
                        <EmployeeTable />
                    </>
                );
            case '2':
                return (
                    <>
                        <h1 className="page-title">Manage Task</h1>
                        <TaskCalendar role='owner' />
                    </>
                );
            case '3':
                return (
                    <>
                        <h1 className="page-title">Message</h1>
                        <MessagePanel role='owner' />
                    </>
                );
            case '4':
                return (
                    <>
                        <h1 className="page-title">Dashboard</h1>
                        <DashboardLayout />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }} className="dashboard-layout">
            <Sider
                width={200}
                className="site-sider"
                breakpoint="md"
                collapsedWidth="0"
                onBreakpoint={(broken) => {
                    console.log('Breakpoint hit:', broken);
                }}
                onCollapse={(collapsed, type) => {
                    console.log('Collapsed:', collapsed, 'Type:', type);
                }}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={(e) => setSelectedKey(e.key)}
                    className="menu"
                >
                    <Menu.Item key="1">Manage Employee</Menu.Item>
                    <Menu.Item key="2">Manage Task</Menu.Item>
                    <Menu.Item key="3">Message</Menu.Item>
                    <Menu.Item key="4">Dashboard</Menu.Item>

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
