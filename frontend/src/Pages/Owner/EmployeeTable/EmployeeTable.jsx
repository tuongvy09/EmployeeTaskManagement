// components/EmployeeTable.jsx
import { Button, Input, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import ConfirmDeleteModal from '../../../Components/ConfirmDeleteModal/ConfirmDeleteModal';
import { deleteEmployee, getEmployees, updateEmployee } from '../../../Contexts/api';
import CreateEmployeeModal from '../CreateEmployeeModal/CreateEmployeeModal';
import EditStatusModal from '../EditStatusModal/EditStatusModal';
import './EmployeeTable.css';

export default function EmployeeTable() {
    const [employeeList, setEmployeeList] = useState([]);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isOpenModalEdit, setIsOpenModalEdit] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [status, setStatus] = useState('');
    const [searchText, setSearchText] = useState('');
    const [debouncedText, setDebouncedText] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedText(searchText);
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchText]);

    const showEditModal = (record) => {
        setSelectedEmployee(record);
        setStatus(record.status);
        setIsOpenModalEdit(true);
    };

    const handleOk = async () => {
        if (!selectedEmployee) return;

        try {
            await updateEmployee(selectedEmployee.id, status);
            setIsOpenModalEdit(false);
            fetchEmployees();
        } catch (error) {
            console.error('Failed to update employee', error);
        }
    };

    const handleCancel = () => {
        setIsOpenModalEdit(false);
    };

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(debouncedText);
            const employees = response.data.employees;
            setEmployeeList(employees);
            setEmployeeCount(employees.length);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [debouncedText]);

    const handleCreate = () => {
        setModalOpen(false);
        fetchEmployees();
    };

    const showDeleteModal = (employee) => {
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return;
        try {
            await deleteEmployee(employeeToDelete.id);
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
            fetchEmployees();
        } catch (error) {
            console.error('Lỗi khi xóa nhân viên:', error.response?.data || error.message || error);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    const columns = [
        {
            title: 'Employee Name',
            dataIndex: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (text) => (
                <Tag color={text === 'Active' ? 'green' : text === 'InActive' ? 'red' : 'orange'}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Action',
            render: (_, record) => (
                <Space align="center" size="middle">
                    <Button type="primary" onClick={() => showEditModal(record)}>Edit</Button>
                    <Button type="primary" danger onClick={() => showDeleteModal(record)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="employee-table-wrapper">
            <div className="table-header">
                <h2>{employeeCount} Employee{employeeCount !== 1 ? 's' : ''}</h2>
                <div className="actions">
                    <Button type="primary" onClick={handleOpenModal}>+ Create Employee</Button>
                    <Input className="filter-input"
                        placeholder="Tìm kiếm theo tên hoặc email"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>
            <Table columns={columns} dataSource={employeeList} rowKey="id" pagination={false} />
            <CreateEmployeeModal
                visible={modalOpen}
                onClose={handleCloseModal}
                onCreate={handleCreate}
            />
            <EditStatusModal
                visible={isOpenModalEdit}
                onOk={handleOk}
                onCancel={handleCancel}
                status={status}
                setStatus={setStatus}
                employee={selectedEmployee}
            />
            <ConfirmDeleteModal
                visible={isDeleteModalOpen}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                content={`Bạn có chắc muốn xóa nhân viên "${employeeToDelete?.name}" không?`}
            />
        </div>
    );
}
