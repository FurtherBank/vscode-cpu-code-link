import { useMemo } from "react";
import { ReactG6Tree } from "../../../components/base/ReactG6Tree";
import { convertTreeData } from "../../../helper/converter";

interface RelationGraphProps {
  data: any;
  isDark: boolean;
}

const staticOptions = {
  layout: {
    type: 'force',
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
    default: ['drag-canvas', 'zoom-canvas'],
  },
};

export const RefGraph = (props: RelationGraphProps) => {
  const { data, isDark } = props;

  const convertedData = useMemo(() => {
    return convertTreeData(data, isDark);
  }, [data]);

  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <ReactG6Tree data={convertedData} options={staticOptions} domAttributes={{ style: { width: '100vw', height: '100vh' } }} isDark={isDark} />
    </div>
  );
};
