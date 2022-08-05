import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "virtual:windi.css";
import "antd/dist/antd.less";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <HashRouter>
        <App />
      </HashRouter>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
