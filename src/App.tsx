import React from "react";
import "./App.css";
import Dashboard from "@pages/dashboard";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { ConfigProvider, theme } from "antd";
import { PRIMARY_COLOR } from "@utils/constants";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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
        <BrowserRouter>
          <Routes>
            <Route path="/xxx" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  );
};

export default App;
