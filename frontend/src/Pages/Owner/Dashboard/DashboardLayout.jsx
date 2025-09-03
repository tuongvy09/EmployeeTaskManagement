import { Col, Layout, Row, Spin, message } from "antd";
import { useEffect, useState } from "react";
import {
    getCompletionRates,
    getContributions,
    getOverdueTasks,
    getSummaryTask,
    getUpcomingTasks
} from "../../../Contexts/api";
import KpiCards from "./KpiCards";
import MemberDistribution from "./MemberDistribution";
import TaskCompletionRateChart from "./TaskBarChart";
import TaskLists from "./TaskLists";
import TaskPieChart from "./TaskPieChart";

const { Content } = Layout;

const DashboardLayout = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const [
                    summaryRes,
                    upcomingRes,
                    overdueRes,
                    completionRatesRes,
                    contributionsRes
                ] = await Promise.all([
                    getSummaryTask(),
                    getUpcomingTasks(),
                    getOverdueTasks(),
                    getCompletionRates(),
                    getContributions()
                ]);

                setData({
                    summary: summaryRes.data.data,
                    upcoming: upcomingRes.data.data,
                    overdue: overdueRes.data.data,
                    completionRates: completionRatesRes.data.data,
                    contributions: contributionsRes.data.data
                });

            } catch (err) {
                console.error(err);
                message.error("Lấy dữ liệu dashboard thất bại");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!data) {
        return <p style={{ textAlign: "center" }}>Không có dữ liệu</p>;
    }

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Layout>
                <Content style={{ margin: "20px" }}>
                    <KpiCards summary={data.summary} />

                    {/* Row 1: Pie Chart + Completion Rate */}
                    <Row gutter={16} style={{ marginBottom: 20 }}>
                        <Col xs={24} md={12}>
                            <TaskPieChart
                                total={data.summary.total}
                                data={[
                                    { name: "Doing", value: data.summary.doing },
                                    { name: "Done", value: data.summary.done },
                                    { name: "Overdue", value: data.summary.overdue },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <TaskCompletionRateChart data={data.completionRates} />
                        </Col>
                    </Row>

                    {/* Row 2: Task Lists + Member Distribution */}
                    <Row gutter={16}>
                        <Col xs={24} md={10}>
                            <TaskLists upcoming={data.upcoming} overdue={data.overdue} />
                        </Col>
                        <Col xs={24} md={14}>
                            <MemberDistribution data={data.contributions} />
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
