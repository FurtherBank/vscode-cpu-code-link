import { Card, Tag, Typography } from "antd/lib";
import { ConvertedTreeData, getModuleTypeStyleToken } from "./RefGraph/converter";
import dayjs from 'dayjs';


interface GraphItemInfoProps {
  data?: ConvertedTreeData;
}

export const GraphItemInfo = (props: GraphItemInfoProps) => {
  const { data } = props;
  const { moduleType, originalData, label } = data ?? {};
  const { stat } = originalData ?? {};
  const { size, birthtime } = stat ?? {};


  if (!data) {
    return null;
  }

  return (
    <Card
      title={label}
      extra={<Tag color={getModuleTypeStyleToken(moduleType)}>{moduleType}</Tag>}
      style={{
        width: 200,
        margin: '10px',
        borderRadius: '10px',
      }}
    >
      {stat && (
        <div>
          <Typography.Text strong>大小:</Typography.Text> <Typography.Text>{size} bytes</Typography.Text>
          <br/>
          <Typography.Text strong>创建于:</Typography.Text> <Typography.Text>{dayjs(birthtime).format('MMMM Do YYYY')}</Typography.Text>
        </div>
      )}
    </Card>
  );
};