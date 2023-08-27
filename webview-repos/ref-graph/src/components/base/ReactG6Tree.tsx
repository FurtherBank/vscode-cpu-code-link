import React, { useEffect, useRef, useCallback, SyntheticEvent } from 'react';
import { TreeGraph, Graph, GraphData, GraphOptions, TreeGraphData } from '@antv/g6';
import './resize-canvas.css';

export const ReactG6Tree = (props: {
  data: GraphData | TreeGraphData | undefined;
  options: Omit<GraphOptions, 'container'>;
  domAttributes?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}) => {
  const { data, options, domAttributes = {} } = props;
  const { className = '', ...restDomAttributes } = domAttributes;
  const ref = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    if (!graphRef.current) {
      const rect = ref.current!.getBoundingClientRect();
      console.log(rect.width, rect.height);
      
      const graph = new TreeGraph({
        container: ref.current!,
        width: rect.width,
        height: rect.height - 6,
        modes: {
          default: [
            {
              type: 'collapse-expand',
              onChange: function onChange(item, collapsed) {
                const data = item!.getModel();
                data.collapsed = collapsed;
                return true;
              },
            },
            'drag-canvas',
            'zoom-canvas',
            {
              type: 'tooltip',
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
          type: 'cubic-horizontal',
        },
        layout: {
          type: 'compactBox',
          direction: 'LR',
          getId: function getId(d: { id: any; }) {
            return d.id;
          },
          getHeight: function getHeight() {
            return 16;
          },
          getWidth: function getWidth() {
            return 16;
          },
          getVGap: function getVGap() {
            return 10;
          },
          getHGap: function getHGap() {
            return 100;
          },
        },
      });
  
      graph.node(function (node) {
        return {
          labelCfg: {
            offset: 10,
            position: node.children && node.children.length > 0 ? 'left' : 'right',
          },
        };
      });
  
      graph.data(data);
      graph.render();
      graph.fitView();
  
      graphRef.current = graph;
    }
  }, []);

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

  return <div ref={ref} className={'resize-canvas ' + className} {...restDomAttributes}></div>;
};
