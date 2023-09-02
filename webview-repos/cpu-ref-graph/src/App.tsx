import './App.css';
import { RefGraph } from './pages/refGraph/components/RefGraph';
import { CallGraphNode } from 'ts-project-toolkit';

export interface AppProps {
  data: CallGraphNode;
  isDark: boolean;
}

export const App = (props: AppProps) => {
  const { data, isDark } = props;
  return <RefGraph data={data} isDark={isDark} />;
};

export default App;
