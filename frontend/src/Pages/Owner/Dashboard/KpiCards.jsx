import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    FileDoneOutlined,
} from "@ant-design/icons";
import { Card, Col, Row } from "antd";

const iconWrapper = {
    width: 42,
    height: 42,
    borderRadius: "12px",
    background: "#f0f2f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
};

const KpiCardItem = ({ title, value, Icon }) => (
    <Card bordered style={{ borderRadius: 10, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
            <div style={iconWrapper}>
                <Icon style={{ fontSize: 20, color: "#595959" }} />
            </div>
            <div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1f2937", textAlign: "left" }}>{value}</div>
            </div>
        </div>
    </Card>
);

const KpiCards = ({ summary }) => (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
            <KpiCardItem title="Total Tasks" value={summary.total} Icon={FileDoneOutlined} />
        </Col>
        <Col xs={12} sm={12} md={6}>
            <KpiCardItem title="In Progress" value={summary.doing} Icon={ClockCircleOutlined} />
        </Col>
        <Col xs={12} sm={12} md={6}>
            <KpiCardItem title="Completed" value={summary.done} Icon={CheckCircleOutlined} />
        </Col>
        <Col xs={12} sm={12} md={6}>
            <KpiCardItem title="Overdue" value={summary.overdue} Icon={ExclamationCircleOutlined} />
        </Col>
    </Row>
);

export default KpiCards;
