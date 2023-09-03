import { RefGraph } from "./components/RefGraph";
import { PageContainer } from "@ant-design/pro-components";
import { CallGraphNode } from "ts-project-toolkit";

export interface RefGraphPageProps {
  data: CallGraphNode;
  isDark: boolean;
}

export const RefGraphPage = (props: RefGraphPageProps) => {
  const { data, isDark } = props;
  return (
    <PageContainer>
      <RefGraph data={data} isDark={isDark} />;
    </PageContainer>
  );
};

export default RefGraphPage;
