import { Button, Drawer, Dropdown, Flex, Space } from "antd";
import React, { useState } from "react";
import AbiTitle from "../abi-title";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "../../../utils/constants";
import { Wallet } from "../../../utils/wallets/wallet";
import { IdlInstruction } from "../../../utils/types/solana";
import useNotification from "antd/es/notification/useNotification";
import { IxRawData } from "./utils";
import "./solana-form.scss";
import AbiWalletForm from "../abi-wallet-form";
import { DownOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { capitalize } from "../../../utils/utils";
import TransactionResult from "../tx-response";
import { SupportiveInstruction, SUPPORTIVE_IXS } from "./supportive-ixs";
import { v4 } from "uuid";
import SolanaInstructionForm from "./instruction-form";

const SolanaAdvancedInstructionForm: React.FC<{
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction?: IdlInstruction;
  onClose: () => void;
}> = ({
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  instruction,
  onClose,
}) => {
  const [notification, contextHolder] = useNotification();
  const [selectedWallet, setWallet] = useState<Wallet | undefined>(wallet);
  const [mainIxRawData, setMainIxRawData] = useState<IxRawData>({});
  const [supportIxs, setSupportIxs] = useState<
    Record<string, SupportiveInstruction>
  >({});
  const [displayedIx, setDisplayedIx] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [txResp, setTxResp] = useState<TxResponse>();

  const resetAndClose = () => {
    setWallet(wallet);
    setMainIxRawData({});
    setSupportIxs({});
    setLoading(false);
    setTxResp(undefined);
    onClose();
  };

  const addSupportiveIx = (ix: SupportiveInstruction) => {
    const newId = v4();
    setSupportIxs({ ...supportIxs, [newId]: { ...ix, id: newId } });
    setDisplayedIx(newId); // auto focus on this new inxtruction
  };

  const setIxRawData = (data: IxRawData) => {
    if (displayedIx && displayedIx in supportIxs)
      setSupportIxs({
        ...supportIxs,
        [displayedIx]: { ...supportIxs[displayedIx], rawData: data },
      });
    else if (displayedIx === instruction?.name) setMainIxRawData(data);
  };

  return (
    <>
      {contextHolder}
      <Drawer
        width={1000}
        closable={true}
        title={
          <AbiTitle
            name={`${instruction?.name} @ ${contractTemplate.name}`}
            address={contractAddress?.address ?? ""}
            blockchain={blockchain}
          />
        }
        footer={
          <Flex align="center" gap="middle" className="advanced-ix-footer">
            <Button type="primary" loading={loading} icon={<EditOutlined />}>
              {capitalize(AbiAction.Write)}
            </Button>
            {txResp && <TransactionResult txResponse={txResp} />}
          </Flex>
        }
        open={instruction !== undefined}
        onClose={() => resetAndClose()}
      >
        <Flex className="advanced-ix" gap="large" justify="space-between">
          <Flex vertical className="instruction-menu">
            <AbiWalletForm
              contractAddress={contractAddress}
              networkClusters={contractTemplate.networkClusters}
              onWalletSelected={setWallet}
              onBlockchainSelected={() => {}} // no need to choose blockchain anymore
            />
            {Object.values(supportIxs).map((supportIx) => (
              <div
                key={supportIx.id}
                onClick={() => setDisplayedIx(supportIx.id)}
              >
                {supportIx.name}
              </div>
            ))}
            <div onClick={() => setDisplayedIx(instruction?.name)}>
              {instruction?.name}
            </div>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: SUPPORTIVE_IXS.map((ix) => ({
                  key: ix.id,
                  label: ix.name,
                  onClick: () => addSupportiveIx(ix),
                })),
              }}
            >
              <Button type="dashed" onClick={(e) => e.preventDefault()}>
                <Space>
                  <PlusOutlined />
                  Add Instruction
                </Space>
              </Button>
            </Dropdown>
          </Flex>
          {instruction && (
            <SolanaInstructionForm
              contractTemplate={contractTemplate}
              contractAddress={contractAddress}
              wallet={selectedWallet}
              blockchain={blockchain}
              instruction={
                displayedIx && displayedIx in supportIxs
                  ? supportIxs[displayedIx].idlInstruction
                  : instruction
              }
              disabled={loading}
              onIxDataChange={(data) => setIxRawData(data)}
            />
          )}
        </Flex>
      </Drawer>
    </>
  );
};

export default SolanaAdvancedInstructionForm;
