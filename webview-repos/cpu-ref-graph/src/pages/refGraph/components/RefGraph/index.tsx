import { useCallback, useMemo, useState } from "react";
import { CpuCodeRefGraph } from "../CpuCodeRefGraph";
import { ConvertConfig, ConvertedTreeData, convertTreeData } from "./converter";
import theme from "antd/lib/theme";
import { GraphItemInfo } from "../../GraphItemInfo";
import HoverToolTip from "../../../../components/base/HoverToolTip";
import { IG6GraphEvent } from "@antv/g6";
import { ItemType, MenuItemType } from "antd/lib/menu/hooks/useItems";
import { GraphItemContextMenu } from "../GraphItemContextMenu";
import { bridge } from "../../../../bridge";

const { useToken } = theme;

interface RelationGraphProps {
  data: any;
  isDark: boolean;
  config?: ConvertConfig;
}

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

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [contextMenuItems, setContextMenuItems] = useState<
    ItemType<MenuItemType>[]
  >([]);
  const handleItemContextMenu = useCallback(
    (e: IG6GraphEvent, item: ConvertedTreeData) => {
      const position = { x: e.clientX, y: e.clientY };
      setContextMenuPos(position);
      setContextMenuVisible(true);
      const items = [];
      const {
        baseInfo: { realFilePath, moduleFileName, moduleType },
      } = item.originalData;
      if (moduleType !== "external") {
        items.push(
          {
            key: "openInEditor",
            label: "在编辑器中打开",
            onClick: () => {
              bridge.post("open", { path: realFilePath });
            },
          },
          {
            key: "openRefGraph",
            label: "打开子图",
            onClick: () => {
              bridge.post("open-ref-graph", {
                path: realFilePath,
              });
            },
          }
        );
      }
      if (moduleFileName !== "index") {
        items.push({
          key: "refactor-index",
          label: "重构为 index",
          onClick: () => {
            bridge.post("refactor-index", { path: realFilePath });
          },
        });
      } else if (moduleFileName) {
        items.push({
          key: "refactor-restore",
          label: "还原目录名称",
          onClick: () => {
            bridge.post("refactor-restore", { path: realFilePath });
          },
        });
      }
      setContextMenuItems(items);

      e.preventDefault();
    },
    []
  );

  return (
    <>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <CpuCodeRefGraph
          data={convertedData}
          domAttributes={{ style: { width: "100%", height: "100%" } }}
          isDark={isDark}
          itemMouseEnter={handleItemMouseEnter}
          itemMouseLeave={handleItemMouseLeave}
          itemContextMenu={handleItemContextMenu}
        />
      </div>
      <HoverToolTip
        visible={hoverTipVisible && !contextMenuVisible}
        offset={{ x: 8, y: 8 }}
      >
        <GraphItemInfo data={nodeOnHover} />
      </HoverToolTip>
      <GraphItemContextMenu
        visible={contextMenuVisible}
        setVisible={setContextMenuVisible}
        position={contextMenuPos}
        items={contextMenuItems}
      />
    </>
  );
};
