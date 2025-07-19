import {
  Drawer,
  FloatButton,
  Image,
  Layout,
  Menu,
  MenuProps,
  Space,
  Tag,
} from "antd";
import {
  AppstoreFilled,
  FileTextFilled,
  SettingFilled,
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
import Contracts from "../contracts";
import ProductContact from "../../components/contact";
import logo from "../../assets/chainforge.png";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "blockchains",
    label: "Blockchains",
    icon: <AppstoreFilled />,
  },
  {
    key: "contract-templates",
    label: "Contract Templates",
    icon: <SettingFilled />,
  },
  {
    key: "contracts",
    label: "Contract Explorer",
    icon: <FileTextFilled />,
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
    <Layout hasSider className="main-screen">
      <Layout.Sider className="left-area" width="auto">
        <div className="profile-logo-container">
          <Image src={logo} preview={false} className="profile-logo" />
          <div className="profile-title">CHAINFORGE</div>
        </div>
        <Menu
          defaultSelectedKeys={["blockchains"]}
          defaultOpenKeys={["blockchains"]}
          onSelect={({ key }) => setSelectedKey(key)}
          theme="dark"
          items={items}
        />
        <ProductContact />
      </Layout.Sider>
      <Layout>
        {selectedKey === "blockchains" && <Blockchains key={"blockchains"} />}
        {selectedKey === "contract-templates" && (
          <ContractTemplates key={"contract-templates"} />
        )}
        {selectedKey === "contracts" && <Contracts key={"contracts"} />}
      </Layout>
      <FloatButton
        className="float-btn"
        type="primary"
        icon={<WalletOutlined className="float-btn-icon" />}
        badge={{
          count: Object.values(wallets).filter(
            (wallet) => wallet.address != null
          ).length,
          color: "green",
        }}
        onClick={() => setConnectWallet(true)}
      />
      <Drawer
        width={500}
        title={
          <Space>
            <div>Select a Wallet</div>
            <Tag color="#0bd300ff">
              {
                Object.values(wallets).filter(
                  (wallet) => wallet.address != null
                ).length
              }{" "}
              connected
            </Tag>
          </Space>
        }
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
