import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Select, Space } from "antd";
import moment from "moment";

const months = moment.months();
const years = Array.from({ length: 20 }, (_, i) => moment().year() - 10 + i);

const CalendarToolbar = ({ date, onNavigate }) => {
    const currentMoment = moment(date);

    const handleMonthChange = (monthIndex) => {
        const newDate = moment(date).month(monthIndex).toDate();
        onNavigate("DATE", newDate);
    };

    const handleYearChange = (year) => {
        const newDate = moment(date).year(year).toDate();
        onNavigate("DATE", newDate);
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "10px 16px",
                marginBottom: "16px",
            }}
        >
            <Button
                type="primary"
                shape="circle"
                icon={<LeftOutlined />}
                onClick={() => onNavigate("PREV")}
            />

            <Space>
                <Select
                    value={currentMoment.month()}
                    style={{ width: 120 }}
                    onChange={handleMonthChange}
                >
                    {months.map((m, idx) => (
                        <Select.Option key={m} value={idx}>
                            {m}
                        </Select.Option>
                    ))}
                </Select>

                <Select
                    value={currentMoment.year()}
                    style={{ width: 100 }}
                    onChange={handleYearChange}
                >
                    {years.map((y) => (
                        <Select.Option key={y} value={y}>
                            {y}
                        </Select.Option>
                    ))}
                </Select>
            </Space>

            <Button
                type="primary"
                shape="circle"
                icon={<RightOutlined />}
                onClick={() => onNavigate("NEXT")}
            />
        </div>
    );
};

export default CalendarToolbar;
