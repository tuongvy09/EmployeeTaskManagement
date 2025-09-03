import { Avatar, Card, Col, Progress, Row } from "antd";

const MemberDistribution = ({data}) => {
    return (
        <Card title="Work Distribution">
            {data.map((m, index) => (
                <Row key={index} align="middle" style={{ marginBottom: 12 }}>
                    <Col span={6} style={{ display: "flex", alignItems: "center" }}>
                        <Avatar style={{ marginRight: 8 }}>
                            {m.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <span>{m.name}</span>
                    </Col>
                    <Col span={18}>
                        <Progress
                            percent={m.percent}
                            showInfo
                            strokeColor="#8c8c8c"
                            trailColor="#f0f0f0"
                        />
                    </Col>
                </Row>
            ))}
        </Card>
    );
};

export default MemberDistribution;
