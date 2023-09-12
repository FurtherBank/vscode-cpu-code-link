import dayjs from "dayjs";
import Tag from "antd/lib/tag";

const TimeTip = ({ time }) => {
  const now = dayjs();
  const pastTime = dayjs(time);

  const diffYears = now.diff(pastTime, "year");
  const diffMonths = now.diff(pastTime, "month");
  const diffWeeks = now.diff(pastTime, "week");
  const diffDays = now.diff(pastTime, "day");

  let text = "";

  if (diffDays === 0) {
    text = "今天⚡";
  } else if (diffDays < 7) {
    text = `${diffDays}天前🌞`;
  } else if (diffWeeks < 5) {
    text = `${diffWeeks}周前📅`;
  } else if (diffMonths < 12) {
    text = `${diffMonths}月前🌓`;
  } else {
    text = `${diffYears}年前🪐`;
  }

  return <Tag style={{ margin: 0, padding: "0 2px" }}>{text}</Tag>;
};

export default TimeTip;
