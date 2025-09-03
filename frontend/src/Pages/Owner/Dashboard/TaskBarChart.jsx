import { Card, Space, Tag } from "antd";
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const getColor = (rate) => {
    if (rate > 80) return "#48C9B0"; 
    if (rate >= 50) return "#5DADE2";
    return "#E59866";
};

const TaskCompletionRateChart = ({ data }) => {
    const chartData = data || [];

    return (
        <Card
            title="Task Completion Rate (%)"
            extra={
                <Space>
                    <Tag color="#48C9B0">Tốt (&gt;80%)</Tag>
                    <Tag color="#5DADE2">Trung bình (50-80%)</Tag>
                    <Tag color="#E59866">Thấp (&lt;50%)</Tag>
                </Space>
            }
        >
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                >
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="onTimeRate" barSize={20} radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.onTimeRate)} />
                        ))}
                        <LabelList dataKey="onTimeRate" position="right" formatter={(v) => `${v}%`} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default TaskCompletionRateChart;
