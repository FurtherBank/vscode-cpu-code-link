import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.compact.css';
import { useDebounce, useInterval, useThrottleEffect, useThrottleFn } from 'ahooks';
import { Alert, Button, PageHeader } from 'antd';
import { VscodeManager } from './vscode/vscodeManager';
import { FileSyncOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { RefGraph } from './pages/refGraph/components/RefGraph';

export interface AppProps {
  data: any;
}

export const App = (props: AppProps) => {
  const { data } = props;
  return <RefGraph data={data}/>;
};

export default App;
