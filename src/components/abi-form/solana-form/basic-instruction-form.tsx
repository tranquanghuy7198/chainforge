import React, { useState } from "react";
import SolanaInstructionForm from "@components/abi-form/solana-form/instruction-form";
import { Button, Flex, Space } from "antd";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import { IdlInstruction } from "@utils/types/solana";
import {
  CheckOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { capitalize } from "@utils/utils";
import TransactionResult from "@components/abi-form/tx-response";
import {
  SolanaIxRawData,
  parseSolanaArguments,
} from "@components/abi-form/solana-form/utils";
import useNotification from "antd/es/notification/useNotification";
import camelcase from "camelcase";
import { AccountMeta, PublicKey } from "@solana/web3.js";
import { SolanaExtra } from "@utils/wallets/solana/utils";
import ContractCallError from "@components/abi-form/contract-call-error";
import { useAuth } from "@hooks/auth";
import { addContractAddresses } from "@api/contracts";
import { useFetchMyContracts } from "@hooks/contract";
import "@components/abi-form/abi-form.scss";

const SolanaBasicInstructionForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction: IdlInstruction;
}> = ({
  action,
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  instruction,
}) => {
  const [notification, contextHolder] = useNotification();
  const [ixRawData, setIxRawData] = useState<SolanaIxRawData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [copying, setCopying] = useState<"copy" | "copying" | "copied">("copy");
  const [txResp, setTxResp] = useState<TxResponse>();
  const { callAuthenticatedApi } = useAuth();
  const { fetchContracts } = useFetchMyContracts();

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain
  ): Promise<TxResponse> => {
    // Deploy
    const response = await wallet.deploy(
      blockchain,
      contractTemplate.abi,
      contractTemplate.bytecode,
      null,
      { programKeypair: contractTemplate.programKeypair } as SolanaExtra
    );

    // Save deployed Solana program
    await callAuthenticatedApi(
      addContractAddresses,
      contractTemplate.id,
      response.contractAddresses || []
    );
    await fetchContracts(true);

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
    accounts: Record<string, PublicKey>,
    extraAccounts: AccountMeta[]
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
      { remainingAccounts: extraAccounts, instructions: [null] } as SolanaExtra // For basic, no extra instructions
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
      const [args, accounts, extraAccounts] = parseSolanaArguments(
        contractTemplate.abi,
        instruction,
        ixRawData
      );

      // Execute in wallet
      let response: TxResponse | undefined;
      if (action === AbiAction.Deploy)
        response = await deploy(wallet, blockchain);
      else if (action === AbiAction.Read)
        response = await read(wallet, blockchain, instruction, args, accounts);
      else if (action === AbiAction.Write)
        response = await write(
          wallet,
          blockchain,
          instruction,
          args,
          accounts,
          extraAccounts
        );
      setTxResp(response);
    } catch (e) {
      notification.error({
        message: "Execution Failed",
        description: <ContractCallError error={e} />,
      });
    }

    // Post-tx UI handling
    setLoading(false);
  };

  const copyTxBytecode = async () => {
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
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }
    try {
      setCopying("copying");
      const [args, accounts, extraAccounts] = parseSolanaArguments(
        contractTemplate.abi,
        instruction,
        ixRawData
      );
      const bytecode = await wallet.getTxBytecode(
        blockchain,
        contractAddress.address,
        contractTemplate.abi,
        camelcase(instruction.name),
        [args, accounts],
        {
          remainingAccounts: extraAccounts,
          instructions: [null],
        } as SolanaExtra
      );
      navigator.clipboard.writeText(bytecode);
      setCopying("copied");
    } catch (error) {
      notification.error({
        message: "Copy Failed",
        description: <ContractCallError error={error} />,
      });
    } finally {
      setTimeout(() => setCopying("copy"), 3000);
    }
  };

  return (
    <>
      {contextHolder}
      <SolanaInstructionForm
        action={action}
        contractTemplate={contractTemplate}
        contractAddress={contractAddress}
        wallet={wallet}
        blockchain={blockchain}
        instruction={instruction}
        disabled={loading}
        extraAccounts
        onIxDataChange={(data) => setIxRawData(data)}
      />
      <Flex vertical align="start" gap="middle">
        <Space>
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
          {action === AbiAction.Write && (
            <Button
              icon={<CopyOutlined />}
              iconPosition="end"
              loading={
                (copying === "copying" && { icon: <LoadingOutlined /> }) ||
                (copying === "copied" && {
                  icon: <CheckOutlined className="copy-done" />,
                })
              }
              onClick={copyTxBytecode}
            >
              Copy bytecode
            </Button>
          )}
        </Space>
        {txResp && (
          <TransactionResult
            blockchain={blockchain}
            wallet={wallet}
            txResponse={txResp}
          />
        )}
      </Flex>
    </>
  );
};

export default SolanaBasicInstructionForm;
