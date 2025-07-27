import React, { useState } from "react";
import SolanaInstructionForm from "./instruction-form";
import { Button, Flex } from "antd";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "../../../utils/constants";
import { Wallet } from "../../../utils/wallets/wallet";
import { Idl, IdlInstruction } from "../../../utils/types/solana";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { capitalize } from "../../../utils/utils";
import TransactionResult from "../tx-response";
import { ACCOUNT_PARAM, ARG_PARAM, IxRawData, SolanaIdlParser } from "./utils";
import useNotification from "antd/es/notification/useNotification";
import camelcase from "camelcase";
import { PublicKey } from "@solana/web3.js";
import { SolanaExtra } from "../../../utils/wallets/solana/utils";
import Paragraph from "antd/es/typography/Paragraph";

const SolanaBasicInstructionForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction: IdlInstruction;
  saveDeployedContract: (blockchain: Blockchain, address: string) => void;
}> = ({
  action,
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  instruction,
  saveDeployedContract,
}) => {
  const [notification, contextHolder] = useNotification();
  const [ixRawData, setIxRawData] = useState<IxRawData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [txResp, setTxResp] = useState<TxResponse>();

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain
  ): Promise<TxResponse> => {
    const response = await wallet.deploy(
      blockchain,
      contractTemplate.abi,
      contractTemplate.bytecode,
      null,
      { programKeypair: contractTemplate.programKeypair } as SolanaExtra
    );
    saveDeployedContract(blockchain, response.contractAddress!);
    return response;
  };

  const read = async (
    wallet: Wallet,
    blockchain: Blockchain,
    instruction: IdlInstruction,
    args: any[],
    accounts: Record<string, PublicKey>
  ): Promise<TxResponse | undefined> => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }
    return await wallet.readContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      camelcase(instruction.name),
      [args, accounts]
    );
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    instruction: IdlInstruction,
    args: any[],
    accounts: Record<string, PublicKey>
  ): Promise<TxResponse | undefined> => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }
    return await wallet.writeContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      camelcase(instruction.name),
      [args, accounts],
      { instructions: [null] } as SolanaExtra // For basic, no extra instructions
    );
  };

  const execute = async () => {
    // Check for necessary information
    if (!wallet) {
      notification.error({
        message: "No wallet selected",
        description: "You must select a wallet first",
      });
      return;
    }
    if (!blockchain) {
      notification.error({
        message: "No blockchain selected",
        description: "You must select a blockchain first",
      });
      return;
    }

    // Pre-tx UI handling
    setLoading(true);
    setTxResp(undefined);

    // Execute
    try {
      // Prepare args and accounts
      const argParser = new SolanaIdlParser(contractTemplate.abi as Idl);
      const args = instruction.args.map((arg) =>
        argParser.parseValue((ixRawData[ARG_PARAM] || {})[arg.name], arg.type)
      );
      const accounts = Object.fromEntries(
        Object.entries(ixRawData[ACCOUNT_PARAM] || {}).map(([key, value]) => [
          camelcase(key),
          new PublicKey(value),
        ])
      );

      // Execute in wallet
      let response: TxResponse | undefined;
      if (action === AbiAction.Deploy)
        response = await deploy(wallet, blockchain);
      else if (action === AbiAction.Read)
        response = await read(wallet, blockchain, instruction, args, accounts);
      else if (action === AbiAction.Write)
        response = await write(wallet, blockchain, instruction, args, accounts);
      setTxResp(response);
    } catch (e) {
      notification.error({
        message: "Execution Failed",
        description: (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
          >
            {e instanceof Error ? e.message : String(e)}
          </Paragraph>
        ),
      });
    }

    // Post-tx UI handling
    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <SolanaInstructionForm
        contractTemplate={contractTemplate}
        contractAddress={contractAddress}
        wallet={wallet}
        blockchain={blockchain}
        instruction={instruction}
        disabled={loading}
        onIxDataChange={(data) => setIxRawData(data)}
      />
      <Flex vertical align="start" gap="middle">
        <Button
          type="primary"
          loading={loading}
          onClick={() => execute()}
          icon={
            action === AbiAction.Deploy ? (
              <CloudUploadOutlined />
            ) : action === AbiAction.Read ? (
              <EyeOutlined />
            ) : (
              <EditOutlined />
            )
          }
        >
          {capitalize(action.toString())}
        </Button>
        {txResp && <TransactionResult txResponse={txResp} />}
      </Flex>
    </>
  );
};

export default SolanaBasicInstructionForm;
