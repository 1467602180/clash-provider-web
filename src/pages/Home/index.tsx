import { useRequest } from "ahooks";
import client from "../../utils/client";
import { Button, Card, Col, Row, Spin } from "antd";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const { loading, data } = useRequest(async () => {
    const configsRes = await client.Records.getFullList("configs");
    const proxysRes = await client.Records.getFullList("proxys");
    if (configsRes && proxysRes) {
      return { configs: configsRes.length, proxys: proxysRes.length };
    }
    return null;
  });

  if (loading) {
    return (
      <div className={"center h-full"}>
        <Spin />
      </div>
    );
  }

  return (
    <Row gutter={20}>
      <Col md={12} lg={6}>
        <Card
          title={"配置"}
          extra={
            <Button
              type={"link"}
              size={"small"}
              onClick={() => {
                navigate("/configs", {
                  replace: true,
                });
              }}
            >
              查看
            </Button>
          }
        >
          <div className={"center text-2xl font-bold text-green-500"}>
            {data?.configs}
          </div>
        </Card>
      </Col>
      <Col md={12} lg={6}>
        <Card
          title={"代理"}
          extra={
            <Button
              type={"link"}
              size={"small"}
              onClick={() => {
                navigate("/proxys", { replace: true });
              }}
            >
              查看
            </Button>
          }
        >
          <div className={"center text-2xl font-bold text-yellow-500"}>
            {data?.proxys}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default Home;
