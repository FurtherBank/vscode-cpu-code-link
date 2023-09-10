import { Card, Tag } from "antd/lib";
import { ConvertedTreeData } from "./RefGraph/converter";

interface GraphItemInfoProps {
  data?: ConvertedTreeData;
}

export const GraphItemInfo = (props: GraphItemInfoProps) => {
  const { data } = props;
  const { moduleType, originalData, label } = data ?? {};
  const { stat } = originalData ?? {};

  const { size } = stat ?? {};

  if (!data) {
    return null;
  }

  return (
    <Card title={label} extra={<Tag>{moduleType}</Tag>}>
      {stat && (
        <div>
          <div>size: {size}</div>
        </div>
      )}
    </Card>
  );
};
