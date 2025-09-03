import { Card, List, Tag } from "antd";
import { formatDate } from "../../../Contexts/untils";

const TaskLists = ({ upcoming, overdue }) => (
    <>
        <Card title="Upcoming Deadlines" style={{ marginBottom: 20 }}>
            <List
                dataSource={upcoming}
                renderItem={(item) => (
                    <List.Item>
                        <span>{item.title}</span>
                        <Tag color="blue">{formatDate(item.deadline)}</Tag>
                    </List.Item>
                )}
            />
        </Card>

        <Card title="Overdue Tasks">
            <List
                dataSource={overdue}
                renderItem={(item) => (
                    <List.Item>
                        <span>{item.title}</span>
                        <Tag color="red">{formatDate(item.deadline)}</Tag>
                    </List.Item>
                )}
            />
        </Card>
    </>
);

export default TaskLists;
