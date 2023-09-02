import { RefGraph } from './components/RefGraph';
import { CallGraphNode } from 'ts-project-toolkit';

export interface RefGraphPageProps {
  data: CallGraphNode;
  isDark: boolean;
}

export const RefGraphPage = (props: RefGraphPageProps) => {
  const { data, isDark } = props;
  return <RefGraph data={data} isDark={isDark} />;
};

export default RefGraphPage;
