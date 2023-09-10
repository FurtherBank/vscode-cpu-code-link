interface HoverToolTipProps {
  visible?: boolean;
}

import React, { useState, useEffect, useMemo } from "react";

interface HoverToolTipProps {
  visible?: boolean;
  children: React.ReactNode;
}

const HoverToolTip = (props: HoverToolTipProps) => {
  const { visible = false, children } = props;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState<DOMRect | null>(null);

  // 更新鼠标位置
  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setPosition({ x: ev.clientX, y: ev.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  // 更新组件 rect
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    setRect(rect);
  }, [children]);

  const realPosition = useMemo(() => {
    if (!rect) return position;

    const { innerWidth, innerHeight } = window;
    const { x, y } = position;
    const { width, height } = rect;

    const newX = x + width > innerWidth ? x - width : x;
    const newY = y + height > innerHeight ? y - height : y;

    return { x: newX, y: newY };
  }, [position, rect]);

  return (
    <div
      style={{
        position: "fixed",
        visibility: visible ? "visible" : "hidden",
        left: realPosition.x,
        top: realPosition.y,
      }}
      ref={ref}
    >
      {children}
    </div>
  );
};

export default HoverToolTip;
