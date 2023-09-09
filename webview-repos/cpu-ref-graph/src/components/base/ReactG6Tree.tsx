import React, { useEffect, useRef, useCallback, SyntheticEvent } from "react";
import {
  TreeGraph,
  Graph,
  GraphData,
  GraphOptions,
  TreeGraphData,
} from "@antv/g6";
import "./resize-canvas.css";
import { theme } from "../../helper/theme";

export const ReactG6Tree = (props: {
  data: GraphData | TreeGraphData | undefined;
  options: Omit<GraphOptions, "container">;
  domAttributes?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  isDark?: boolean;
}) => {
  const { data, options, domAttributes = {}, isDark } = props;
  const { className = "", ...restDomAttributes } = domAttributes;
  const ref = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = React.useState<Graph | null>(null);

  useEffect(() => {
    const rect = ref.current!.getBoundingClientRect();
    console.log(rect.width, rect.height);

    const graph = new TreeGraph({
      container: ref.current!,
      width: rect.width,
      height: rect.height - 6,
      animateCfg: {
        duration: 100, // duration in milliseconds, adjust this to your liking
        // easing: 'easeQuadIn', // easing function, you can choose others as well
      },
      modes: {
        default: [
          {
            type: "collapse-expand",
            onChange: function onChange(item, collapsed) {
              const data = item!.getModel();
              // data.collapsed = collapsed;
              console.log("[info] node data", data);
              (data.style.fill = collapsed
                ? theme("#d0d0d0", isDark)
                : "transparent"),
                graph.updateItem(data.id, data);
              return true;
            },
          },
          "drag-canvas",
          "zoom-canvas",
          {
            type: "tooltip",
            formatText(model) {
              return model.label as string;
            },
            offset: 10,
          },
        ],
      },
      defaultNode: {
        size: 13,
        anchorPoints: [
          [0, 0.5],
          [1, 0.5],
        ],
      },
      defaultEdge: {
        type: "cubic-horizontal",
      },
      layout: {
        type: "compactBox",
        direction: "LR",
        getId: function getId(d: { id: any }) {
          return d.id;
        },
        getHeight: function getHeight() {
          return 16;
        },
        getWidth: function getWidth() {
          return 16;
        },
        getVGap: function getVGap() {
          return 2;
        },
        getHGap: function getHGap() {
          return 60;
        },
      },
    });

    graph.node(function (node) {
      const { collapsed, style: { stroke } = {} } = node;
      return {
        labelCfg: {
          offset: 5,
          position: "left", //node.children && node.children.length > 0 ? "left" : "right",
          style: {
            fill: theme("#000", isDark),
            stroke: theme("#e2e2e2", isDark), // border color
            lineWidth: 2, // border width
          },
        },
        style: {
          fill: collapsed ? theme("#d0d0d0", isDark) : "transparent",
        },
      };
    });

    setGraph(graph);

    return () => {
      graph.destroy();
      setGraph(null);
    };
  }, [isDark]);

  useEffect(() => {
    if (!graph) return;
    graph.data(data);
    graph.render();
    graph.fitView([40, 40, 40, 40]);
  }, [data, graph]);

  // 响应式调整 graph 的 size
  // useEffect(() => {
  //   const resizeObserver = new ResizeObserver((entries) => {
  //     for (let entry of entries) {
  //       if (graphRef.current) graphRef.current.changeSize(entry.target.clientWidth, entry.target.clientHeight - 6);
  //       console.log(entry.target.clientWidth, entry.target.clientHeight - 6);
  //     }
  //   });
  //   if (ref.current) resizeObserver.observe(ref.current);
  //   return () => {
  //     resizeObserver.disconnect();
  //   };
  // }, [ref.current, graphRef.current]);

  return (
    <div
      ref={ref}
      className={"resize-canvas " + className}
      {...restDomAttributes}
    ></div>
  );
};
