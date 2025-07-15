import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div style={{ paddingTop: "100px" }}>
            <Result
                status="403"
                title="403 - Không có quyền truy cập"
                subTitle="Bạn không có quyền truy cập vào trang này. Vui lòng quay lại trang chính."
                extra={
                    <Button type="primary" onClick={() => navigate("/")}>
                        Quay lại đăng nhập
                    </Button>
                }
            />
        </div>
    );
};

export default AccessDenied;
