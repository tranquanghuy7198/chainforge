import React from "react";
import "./App.css";
import Dashboard from "./pages/dashboard";
import { Provider } from "react-redux";
import { store } from "./redux/store";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
};

export default App;
