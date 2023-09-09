import { useMemo } from "react";
import { ReactG6Tree } from "../../../../components/base/ReactG6Tree";
import { ConvertConfig, convertTreeData } from "./converter";

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

  const convertedData = useMemo(() => {
    return convertTreeData(data, isDark, config);
  }, [data, config, isDark]);

  return (
    <div style={{ flex: 1, overflow: "hidden" }}>
      <ReactG6Tree
        data={convertedData}
        options={staticOptions}
        domAttributes={{ style: { width: "100%", height: "100%" } }}
        isDark={isDark}
      />
    </div>
  );
};
