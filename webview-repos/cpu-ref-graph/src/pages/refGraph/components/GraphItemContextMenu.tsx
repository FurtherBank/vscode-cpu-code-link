import Menu from "antd/lib/menu";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { MenuItemType } from "antd/lib/menu/hooks/useItems";
import React, { useState, useEffect, useMemo } from "react";

interface GraphItemContextMenuProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  position: { x: number; y: number };
  items?: ItemType<MenuItemType>[];
}

export const GraphItemContextMenu = (props: GraphItemContextMenuProps) => {
  const {
    visible,
    setVisible,
    position = {
      x: 0,
      y: 0,
    },
    items = [],
  } = props;
  const [rect, setRect] = useState<DOMRect | null>(null);

  // 更新组件 rect
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    setRect(rect);
  }, [items]);

  const realPosition = useMemo(() => {
    if (!rect) return position;

    const { innerWidth, innerHeight } = window;
    const { x, y } = position;
    const { width, height } = rect;

    const newX = Math.min(x, innerWidth - width);
    const newY = Math.min(y, innerHeight - height);

    return { x: newX, y: newY };
  }, [position.x, position.y, rect]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setVisible, ref]);

  const handleMenuClick = () => {
    setVisible(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        display: visible && items.length > 0 ? "block" : "none",
        left: realPosition.x,
        top: realPosition.y,
      }}
      ref={ref}
    >
      <Menu items={items} onClick={handleMenuClick} />
    </div>
  );
};
