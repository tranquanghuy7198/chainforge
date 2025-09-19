import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { ConfigProvider, theme } from "antd";
import { PRIMARY_COLOR } from "@utils/constants";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Blockchains from "@pages/blockchains";
import TrendingContracts from "@pages/trending-contracts";
import ContractTemplates from "@pages/contract-templates";
import Contracts from "@pages/contracts";
import {
  BLOCKCHAINS,
  MY_CONTRACTS,
  MY_TEMPLATES,
  POPULAR_CONTRACTS,
} from "@utils/routes";

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
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to={BLOCKCHAINS} replace />} />
            <Route path={BLOCKCHAINS} element={<Blockchains />} />
            <Route path={POPULAR_CONTRACTS} element={<TrendingContracts />} />
            <Route path={MY_TEMPLATES} element={<ContractTemplates />} />
            <Route path={MY_CONTRACTS} element={<Contracts />} />
          </Routes>
        </HashRouter>
      </Provider>
    </ConfigProvider>
  );
};

export default App;
