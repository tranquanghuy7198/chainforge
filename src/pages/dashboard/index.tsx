import { Drawer, FloatButton, Layout, Menu, MenuProps } from "antd";
import {
  AppstoreOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import "./dashboard.scss";
import { useEffect, useState } from "react";
import Blockchains from "../blockchains";
import WalletCard from "../../components/wallet";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { fetchBlockchains } from "../../api/blockchains";
import { setBlockchains } from "../../redux/reducers/blockchain";
import { updateWallet } from "../../redux/reducers/wallet";
import ContractTemplates from "../contract-templates";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "blockchains",
    label: "Blockchains",
    icon: <AppstoreOutlined />,
  },
  {
    key: "contract-templates",
    label: "Contract Templates",
    icon: <FileTextOutlined />,
  },
  {
    key: "contracts",
    label: "Contracts",
    icon: <FileProtectOutlined />,
  },
];

export default function Dashboard(props: any) {
  const dispatch = useAppDispatch();
  const wallets = useAppSelector((state) => state.wallet.wallets);
  let [selectedKey, setSelectedKey] = useState<string>("blockchains");
  let [connectWallet, setConnectWallet] = useState<boolean>(false);

  useEffect(() => {
    fetchBlockchains().then((chains) => dispatch(setBlockchains(chains)));
  }, []);

  return (
    <Layout className="main-screen">
      <Layout.Sider className="left-area" width="auto">
        <div className="profile-logo-container">
          <img className="profile-logo" src="logo.svg" alt="logo" />
          <div className="profile-title">TOOLS</div>
        </div>
        <Menu
          defaultSelectedKeys={["blockchains"]}
          defaultOpenKeys={["blockchains"]}
          onSelect={({ key }) => setSelectedKey(key)}
          theme="dark"
          items={items}
        />
      </Layout.Sider>
      <Layout>
        {selectedKey === "blockchains" && <Blockchains key={"blockchains"} />}
        {selectedKey === "contract-templates" && (
          <ContractTemplates key={"contract-templates"} />
        )}
      </Layout>
      <FloatButton
        className="float-btn"
        type="primary"
        icon={<WalletOutlined className="float-btn-icon" />}
        badge={{
          count: Object.values(wallets).map((wallet) => wallet.address != null)
            .length,
          color: "green",
        }}
        onClick={() => setConnectWallet(true)}
      />
      <Drawer
        width={500}
        title="Select a Wallet"
        open={connectWallet}
        closable={true}
        onClose={() => setConnectWallet(false)}
      >
        {Object.entries(wallets).map(([key, wallet]) => (
          <WalletCard
            key={key}
            wallet={wallet}
            onWalletUpdate={(wallet) => dispatch(updateWallet(wallet))}
          />
        ))}
      </Drawer>
    </Layout>
  );
}
