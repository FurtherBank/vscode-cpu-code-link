import { useCallback, useMemo, useState } from "react";
import { CpuCodeRefGraph } from "../CpuCodeRefGraph";
import { ConvertConfig, ConvertedTreeData, convertTreeData } from "./converter";
import { theme } from "antd/lib";
import { GraphItemInfo } from "../GraphItemInfo";
import HoverToolTip from "../../../../components/base/HoverToolTip";
import { IG6GraphEvent } from "@antv/g6";

const { useToken } = theme;

interface RelationGraphProps {
  data: any;
  isDark: boolean;
  config?: ConvertConfig;
}

const staticOptions = {
  layout: {
    type: "force",
    preventOverlap: true,
    nodeSize: 50,
    linkDistance: 100,
    nodeStrength: -30,
    edgeStrength: 0.1,
  },
  defaultNode: {
    size: 40,
  },
  modes: {
    default: ["drag-canvas", "zoom-canvas"],
  },
};

export const RefGraph = (props: RelationGraphProps) => {
  const { data, isDark, config } = props;

  const { token } = useToken();

  const convertedData = useMemo(() => {
    return convertTreeData(token, data, config);
  }, [data, config, isDark]);

  const [hoverTipVisible, setHoverTipVisible] = useState(false);
  const [nodeOnHover, setNodeOnHover] = useState<ConvertedTreeData>(null);

  const handleItemMouseEnter = useCallback(
    (e: IG6GraphEvent, item: ConvertedTreeData) => {
      setHoverTipVisible(true);
      setNodeOnHover(item);
    },
    []
  );

  const handleItemMouseLeave = useCallback(
    (e: IG6GraphEvent, item: ConvertedTreeData) => {
      setHoverTipVisible(false);
    },
    []
  );

  return (
    <>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <CpuCodeRefGraph
          data={convertedData}
          options={staticOptions}
          domAttributes={{ style: { width: "100%", height: "100%" } }}
          isDark={isDark}
          itemMouseEnter={handleItemMouseEnter}
          itemMouseLeave={handleItemMouseLeave}
        />
      </div>
      <HoverToolTip visible={hoverTipVisible}>
        <GraphItemInfo data={nodeOnHover} />
      </HoverToolTip>
    </>
  );
};
