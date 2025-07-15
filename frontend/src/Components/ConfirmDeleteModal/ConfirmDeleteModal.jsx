import { Modal } from 'antd';

export default function ConfirmDeleteModal({
    visible,
    onOk,
    onCancel,
    content = 'Bạn có chắc muốn xóa không?',
}) {
    return (
        <Modal
            open={visible}
            title="Xác nhận"
            okText="Ok"
            cancelText="Hủy"
            okType="danger"
            onOk={onOk}
            onCancel={onCancel}
        >
            <p>{content}</p>
        </Modal>
    );
}
