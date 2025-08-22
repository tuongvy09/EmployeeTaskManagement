import { Button, Space } from "antd";

const CalendarToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate("PREV");
    };
    const goToNext = () => {
        toolbar.onNavigate("NEXT");
    };
    const goToToday = () => {
        toolbar.onNavigate("TODAY");
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <Space>
                <Button onClick={goToBack}>Trước</Button>
                <Button onClick={goToToday}>Hôm nay</Button>
                <Button onClick={goToNext}>Sau</Button>
            </Space>
            <h3 style={{ display: "inline-block", marginLeft: 16 }}>
                {toolbar.label}
            </h3>
        </div>
    );
};

export default CalendarToolbar;
