import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.compact.css';
import JsonSchemaEditor, { metaSchema } from 'json-schemaeditor-antd';
import { useDebounce, useInterval, useThrottleEffect, useThrottleFn } from 'ahooks';
import { Alert, Button, PageHeader } from 'antd';
import { VscodeManager } from './vscode/vscodeManager';
import { FileSyncOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';

export const App = () => {

}

export default App;
