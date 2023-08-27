import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { VscodeManager } from './vscode/vscodeManager';
import callGraph from "./mockData/callGraph.json";


VscodeManager.init(() => {
  VscodeManager.vscode.setState({
    data: {
      importPath: 'root',
      realFilePath: 'root.tsx',
      children: callGraph
    }
  })
});

export const renderEditor = (state: any) => {
  const { data } = state

  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

  root.render(
    <React.StrictMode>
      <App data={data} />
    </React.StrictMode>
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();


}

function listener(event: MessageEvent<any>) {
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

const oldState = VscodeManager.vscode.getState() 
if (oldState !== undefined) {
  console.log('查询到 oldState', oldState);
  
  renderEditor(oldState)
} else {
  // 等监听到 data 信息再挂载组件，只执行一次
  window.addEventListener('message', listener);
}
