import React from "react";
import "./App.css";
import Dashboard from "@pages/dashboard";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { ConfigProvider, theme } from "antd";
import { PRIMARY_COLOR } from "@utils/constants";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: PRIMARY_COLOR,
          colorLink: PRIMARY_COLOR,
          colorInfo: PRIMARY_COLOR,
        },
      }}
    >
      <Provider store={store}>
        <Dashboard />
      </Provider>
    </ConfigProvider>
  );
};

export default App;
