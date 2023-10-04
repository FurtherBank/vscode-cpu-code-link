import Card from "antd/lib/card";
import Tag from "antd/lib/tag";
import {
  ConvertedTreeData,
  getModuleTypeStyleToken,
} from "../components/RefGraph/converter";
import dayjs from "dayjs";
import TimeTip from "./TimeTip";
import { ReactNode } from "react";

interface GraphItemInfoProps {
  data?: ConvertedTreeData;
}

interface InfoItemProps {
  title?: ReactNode;
  children: ReactNode;
  extra?: ReactNode;
}

const InfoItem = (props: InfoItemProps) => {
  const { children, title, extra } = props;
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        margin: "2px 0",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontWeight: 600,
          }}
        >
          {title}
        </span>
        <span
          style={{
            textOverflow: "ellipsis",
          }}
        >
          {children}
        </span>
      </div>
      {extra && (
        <div
          style={{
            justifySelf: "flex-end",
            marginLeft: 8,
          }}
        >
          {extra}
        </div>
      )}
    </div>
  );
};

export const GraphItemInfo = (props: GraphItemInfoProps) => {
  const { data } = props;
  const { originalData, label } = data ?? {};
  const {
    baseInfo,
  } = originalData ?? {};
  const { relativePath, moduleType, stat } = baseInfo ?? {};
  const { size, birthtime } = stat ?? {};

  if (!data) {
    return null;
  }

  return (
    <Card
      title={label}
      extra={
        <Tag color={getModuleTypeStyleToken(moduleType)}>{moduleType}</Tag>
      }
      style={{
        width: 320,
        margin: "10px",
        borderRadius: "10px",
      }}
    >
      {stat && (
        <div>
          <InfoItem title="路径">{relativePath}</InfoItem>
          <InfoItem title="大小">{(size / 1024).toFixed(3)} kB</InfoItem>
          <InfoItem title="创建于" extra={<TimeTip time={birthtime} />}>
            {dayjs(birthtime).format("MMMM D YYYY")}
          </InfoItem>
        </div>
      )}
    </Card>
  );
};
