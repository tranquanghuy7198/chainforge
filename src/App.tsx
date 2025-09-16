import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { ConfigProvider, theme } from "antd";
import { PRIMARY_COLOR } from "@utils/constants";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Blockchains from "@pages/blockchains";
import TrendingContracts from "@pages/trending-contracts";
import ContractTemplates from "@pages/contract-templates";
import Contracts from "@pages/contracts";

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
            <Route path="/" element={<Navigate to="/blockchains" replace />} />
            <Route path="/blockchains" element={<Blockchains />} />
            <Route path="/popular-contracts" element={<TrendingContracts />} />
            <Route path="/contract-templates" element={<ContractTemplates />} />
            <Route path="/contracts" element={<Contracts />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  );
};

export default App;
