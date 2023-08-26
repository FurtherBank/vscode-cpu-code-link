import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App, { IJsonEditorMessage, IJsonEditorState } from './App';
import reportWebVitals from './reportWebVitals';
import { VscodeManager } from './vscode/vscodeManager';
import { metaSchema } from 'json-schemaeditor-antd';

VscodeManager.init(() => {
  VscodeManager.vscode.setState({
    data: JSON.stringify({
      "$schema": "http://json-schema.org/draft-06/schema#",
      "type": "array",
      "items": {
        "type": "string",
        "format": "row"
      },
      "definitions": {}
    }, null, 2),
    schema: metaSchema,
  })
});

export const renderEditor = (state: IJsonEditorState) => {
  const { data, schema, jsonIsSchema } = state

  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

  root.render(
    <React.StrictMode>
      <App data={data} schema={schema} jsonIsSchema={jsonIsSchema}/>
    </React.StrictMode>
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();


}

function listener(event: MessageEvent<IJsonEditorMessage>) {
  // 通过处理机制来处理
  const { data } = event
  console.log(`收到激活信息：`, event);
  if (typeof event === 'object') {
    const { msgType, ...initState } = data

    VscodeManager.vscode.setState(initState)

    renderEditor(data)
  }
  window.removeEventListener('message', listener);
}

const oldState = VscodeManager.vscode.getState() as IJsonEditorState
if (oldState !== undefined) {
  console.log('查询到 oldState', oldState);
  
  renderEditor(oldState)
} else {
  // 等监听到 data 信息再挂载组件，只执行一次
  window.addEventListener('message', listener);
}
