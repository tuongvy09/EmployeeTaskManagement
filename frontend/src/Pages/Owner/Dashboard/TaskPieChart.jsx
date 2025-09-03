import { Card } from "antd";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#91d5ff", "#ffd666", "#ff85c0"];

const TaskPieChart = ({ data, total }) => {
    return (
        <Card title="Task by Status">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend />
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 18, fontWeight: "bold" }}
                    >
                        {total}
                    </text>
                    <text
                        x="50%"
                        y="58%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 12, fill: "#888" }}
                    >
                        Total work items
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default TaskPieChart;
