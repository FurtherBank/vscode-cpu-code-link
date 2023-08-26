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

export interface IJsonEditorState {
  schema?: any;
  data?: string;
  jsonIsSchema?: boolean;
}

export interface IJsonEditorMessage extends IJsonEditorState {
  msgType: 'init' | 'update' | 'sync-schema' | 'reset-schema';
}

function App(props: IJsonEditorState) {
  const { data: initialData, schema: initialSchema, jsonIsSchema } = props;

  const initialJson = useMemo(() => {
    try {
      const json = JSON.parse(initialData ?? 'null');

      return json;
    } catch (error) {
      console.log('initial data 解析错误', initialData);
      return undefined;
    }
  }, []);

  const dataStringRef = useRef(initialData);
  const [dataJson, setDataJson] = useState<any>(initialJson ?? null);
  const [schema, setSchema] = useState(initialSchema);
  const [jsonChanged, setJsonChanged] = useState(false);
  const [isError, setIsError] = useState(initialJson === undefined);

  // 如果用 ref 包住 datastring，可以避免来回挂载
  useEffect(() => {
    const handler = (e: MessageEvent<IJsonEditorMessage>) => {
      const { data, msgType, schema } = e.data;

      if (!msgType) return; // dev 时会受到一个错误的 message 事件，将其过滤

      const state = VscodeManager.vscode.getState() ?? {};
      // 1. 处理收到的 data
      if (data !== undefined) {
        if (data !== dataStringRef.current) {
          console.log(
            '检测到外部 json 变化，重新解析……',
            data === dataStringRef.current,
            data.localeCompare(dataStringRef.current!) === 0,
            data.trim() === dataStringRef.current
          );
          console.log(data);
          console.log(dataStringRef.current);
          dataStringRef.current = data;
          setJsonChanged(false);

          try {
            const json = JSON.parse(data);
            setDataJson(json);
            setIsError(false);
            VscodeManager.vscode.setState({
              ...state,
              data: data,
            });
          } catch (error) {
            console.log(`json 解析错误`, error, data);
            setDataJson(null);
            setIsError(true);
            VscodeManager.vscode.setState({
              ...state,
              data: undefined,
            });
          }
        }
      }

      // 2. 处理收到的 schema
      if (schema !== undefined) {
        // vscode schema 同步消息是防抖的，所以不需要做额外处理
        setSchema(schema);
        VscodeManager.vscode.setState({
          ...state,
          schema: schema,
        });
      }

      // 3. 对于信息的类型放对应对话框消息
      switch (msgType) {
        default:
          break;
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, [dataStringRef]);

  // 0.6s 一次向 vscode 发送新的 jsonString
  const syncJson = useCallback(
    debounce((newJson: any) => {
      // 1. 获得新的 json 字符串，并发送到 vscode 端
      const newString = JSON.stringify(newJson, null, 2);

      dataStringRef.current = newString;
      setJsonChanged(false);

      VscodeManager.vscode.postMessage(newString);

      // 2. 将新的 json 同步到 webview state
      const state = VscodeManager.vscode.getState() ?? {};
      VscodeManager.vscode.setState({
        ...state,
        data: newString,
      });
    }, 600),
    []
  );

  const handleChange = useCallback(
    (value: any) => {
      console.log('来自于 editor 的变化');

      setDataJson(value);
      setJsonChanged(true);
      syncJson(value);
    },
    [setDataJson]
  );

  const syncSchemaHandler = useCallback(() => {
    VscodeManager.vscode.postMessage({
      msgType: 'sync-schema',
    });
  }, []);

  const resetSchemaHandler = useCallback(() => {
    VscodeManager.vscode.postMessage({
      msgType: 'reset-schema',
    });
  }, []);

  const extraButtons = jsonIsSchema
    ? []
    : schema !== undefined
    ? [
        <Button key="1" type="primary" icon={<FileSyncOutlined />} onClick={syncSchemaHandler}>
          同步 schema
        </Button>,
        <Button key="2" danger icon={<FileSyncOutlined />} onClick={resetSchemaHandler}>
          重置 schema
        </Button>,
      ]
    : [
        <Button key="1" type="primary" icon={<FileSyncOutlined />} onClick={resetSchemaHandler}>
          生成 schema
        </Button>,
      ];

  return (
    <div>
      <PageHeader
        title="JSON Editor"
        className="site-page-header"
        subTitle="By FurtherBank"
        extra={extraButtons}
      ></PageHeader>
      {isError ? <Alert message={'文件无法解析为 json，请通过默认编辑器修改后再试。'} /> : null}
      <JsonSchemaEditor data={dataJson} schema={jsonIsSchema ? metaSchema : schema} onChange={handleChange} />
    </div>
  );
}

export default App;
