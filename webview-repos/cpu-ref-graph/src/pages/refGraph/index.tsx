import { PageHeader } from "@ant-design/pro-components";
import { Button, Checkbox, Dropdown, Menu } from "antd";
import { RefGraph } from "./components/RefGraph";
import { CallGraphNode } from "ts-project-toolkit";
import { useMemo, useState } from "react";
import { Select } from "antd/lib";

export interface RefGraphPageProps {
  data: CallGraphNode;
  isDark: boolean;
}

export type ModuleType = "external" | "hook" | "class" | "jsx" | "js";
const options = ["external", "hook", "class", "jsx", "js"].map((item) => ({
  label: item,
  value: item,
}));

export const RefGraphPage = (props: RefGraphPageProps) => {
  const { data, isDark } = props;
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([
    "external",
  ]);

  const config = useMemo(() => {
    const ignoreConfig = selectedModules.reduce((acc, cur) => {
      acc[cur] = true;
      return acc;
    }, {} as Record<ModuleType, boolean>);

    return {
      ignore: {
        ...ignoreConfig,
      },
    };
  }, [selectedModules]);

  return (
    <div style={{ height: "100vh", display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Ref Graph"
        extra={
          <>
            <span style={{ marginRight: 10 }}>不显示:</span>
            <Select
              mode="multiple"
              value={selectedModules}
              onChange={(value) => setSelectedModules(value as ModuleType[])}
              options={options}
              style={{ minWidth: 150 }}
            />
          </>
        }
      />
      <RefGraph data={data} isDark={isDark} config={config}/>
    </div>
  );
};

export default RefGraphPage;
