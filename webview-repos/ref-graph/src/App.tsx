import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { useDebounce, useInterval, useThrottleEffect, useThrottleFn } from 'ahooks';
import { VscodeManager } from './vscode/vscodeManager';
import { FileSyncOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
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
