import React from "react";
import "./App.css";
import Dashboard from "@pages/dashboard";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { ConfigProvider, theme } from "antd";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1ABC9C",
          colorLink: "#1ABC9C",
          colorInfo: "#1ABC9C",
        },
        algorithm: theme.darkAlgorithm,
      }}
    >
      <Provider store={store}>
        <Dashboard />
      </Provider>
    </ConfigProvider>
  );
};

export default App;
