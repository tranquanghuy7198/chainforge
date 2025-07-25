import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "../../../utils/constants";
import { Wallet } from "../../../utils/wallets/wallet";
import { Button, Space, Tag, Tooltip } from "antd";
import { useState } from "react";
import { Idl, IdlInstruction } from "../../../utils/types/solana";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import CollapseForm from "../collapse-form";
import "./solana-form.scss";
import { createApproveInstruction } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import SolanaInstructionForm from "./instruction-form";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
  ThunderboltTwoTone,
} from "@ant-design/icons";
import { DEPLOYMENT_INSTRUCTION, getFullInstructions } from "./utils";
import SolanaFullInstructionForm from "./full-instruction-form";
import { capitalize } from "../../../utils/utils";

type TokenApprovalInstruction = {
  account: string;
  delegate: string;
  owner: string;
  amount: string;
};

const SolanaForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  saveDeployedContract: (blockchain: Blockchain, address: string) => void;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({
  action,
  contractTemplate,
  saveDeployedContract,
  contractAddress,
  wallet,
  blockchain,
}) => {
  const [writeFull, setWriteFull] = useState<IdlInstruction>();
  const [supportiveInstructions, setSupportiveInstructions] = useState<
    Record<string, Partial<TokenApprovalInstruction>[]>
  >({});

  const parseSupportiveInstruction = (
    rawInstruction: Partial<TokenApprovalInstruction>
  ): TransactionInstruction => {
    return createApproveInstruction(
      new PublicKey(rawInstruction.account!),
      new PublicKey(rawInstruction.delegate!),
      new PublicKey(rawInstruction.owner!),
      new BN(parseInt(rawInstruction.amount!, 10))
    );
  };

  const addTokenApprovalForm = (instructionName: string) => {
    setSupportiveInstructions({
      ...supportiveInstructions,
      [instructionName]: [
        ...(supportiveInstructions[instructionName] || []),
        {},
      ],
    });
  };

  const setTokenApproval = (
    instructionName: string,
    index: number,
    values: TokenApprovalInstruction
  ) => {
    setSupportiveInstructions({
      ...supportiveInstructions,
      [instructionName]: [
        ...(supportiveInstructions[instructionName] || []).slice(0, index),
        values,
        ...(supportiveInstructions[instructionName] || []).slice(index + 1),
      ],
    });
  };

  // const deploy = async (
  //   wallet: Wallet,
  //   blockchain: Blockchain
  // ): Promise<TxResponse> => {
  //   const response = await wallet.deploy(
  //     blockchain,
  //     contractTemplate.abi,
  //     contractTemplate.bytecode,
  //     null,
  //     { programKeypair: contractTemplate.programKeypair } as SolanaExtra
  //   );
  //   saveDeployedContract(blockchain, response.contractAddress!);
  //   return response;
  // };

  // const read = async (
  //   wallet: Wallet,
  //   blockchain: Blockchain,
  //   instruction: IdlInstruction,
  //   args: any[],
  //   accounts: Record<string, PublicKey>
  // ): Promise<TxResponse | undefined> => {
  //   if (!contractAddress) {
  //     notification.error({
  //       message: "No contract selected",
  //       description: "You must select a contract first",
  //     });
  //     return;
  //   }
  //   return await wallet.readContract(
  //     blockchain,
  //     contractAddress.address,
  //     contractTemplate.abi,
  //     camelcase(instruction.name),
  //     [args, accounts]
  //   );
  // };

  // const write = async (
  //   wallet: Wallet,
  //   blockchain: Blockchain,
  //   instruction: IdlInstruction,
  //   args: any[],
  //   accounts: Record<string, PublicKey>
  // ): Promise<TxResponse | undefined> => {
  //   if (!contractAddress) {
  //     notification.error({
  //       message: "No contract selected",
  //       description: "You must select a contract first",
  //     });
  //     return;
  //   }
  //   return await wallet.writeContract(
  //     blockchain,
  //     contractAddress.address,
  //     contractTemplate.abi,
  //     camelcase(instruction.name),
  //     [args, accounts],
  //     {} as SolanaExtra
  //   );
  // };

  // const execute = async (
  //   instruction: IdlInstruction,
  //   params: Record<string, Record<string, string>>
  // ) => {
  //   // Check for necessary information
  //   if (!wallet) {
  //     notification.error({
  //       message: "No wallet selected",
  //       description: "You must select a wallet first",
  //     });
  //     return;
  //   }
  //   if (!blockchain) {
  //     notification.error({
  //       message: "No blockchain selected",
  //       description: "You must select a blockchain first",
  //     });
  //     return;
  //   }

  //   // Pre-tx UI handling
  //   setLoading(true);
  //   setTxResponse(undefined);

  //   // Execute
  //   try {
  //     // Prepare args and accounts
  //     const argParser = new SolanaIdlParser(contractTemplate.abi as Idl);
  //     const args = instruction.args.map((arg) =>
  //       argParser.parseValue((params[ARG_PARAM] || {})[arg.name], arg.type)
  //     );
  //     const accounts = Object.fromEntries(
  //       Object.entries(params[ACCOUNT_PARAM] || {}).map(([key, value]) => [
  //         camelcase(key),
  //         new PublicKey(value),
  //       ])
  //     );

  //     // Execute in wallet
  //     let response: TxResponse | undefined;
  //     if (action === AbiAction.Deploy)
  //       response = await deploy(wallet, blockchain);
  //     else if (action === AbiAction.Read)
  //       response = await read(wallet, blockchain, instruction, args, accounts);
  //     else if (action === AbiAction.Write)
  //       response = await write(wallet, blockchain, instruction, args, accounts);
  //     setTxResponse(response);
  //   } catch (e) {
  //     notification.error({
  //       message: "Execution Failed",
  //       description: (
  //         <Paragraph
  //           ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
  //         >
  //           {e instanceof Error ? e.message : String(e)}
  //         </Paragraph>
  //       ),
  //     });
  //   }

  //   // Post-tx UI handling
  //   setLoading(false);
  // };

  return (
    <>
      <CollapseForm
        items={getFullInstructions(contractTemplate.abi as Idl)
          .filter((instruction) => {
            if (action === AbiAction.Deploy)
              return instruction.name === DEPLOYMENT_INSTRUCTION;
            let isWriteInstruction = false;
            for (const account of instruction.accounts)
              for (const singleAccount of "accounts" in account
                ? account.accounts
                : [account])
                if (singleAccount.signer || singleAccount.writable) {
                  isWriteInstruction = true;
                  break;
                }
            return (
              instruction.name !== DEPLOYMENT_INSTRUCTION &&
              isWriteInstruction === (action === AbiAction.Write)
            );
          })
          .map((instruction) => ({
            key: instruction.name,
            label: (
              <Space>
                <div className="function-name">{instruction.name}</div>
                <Tooltip title="Instruction Discriminator">
                  <Tag color="#108ee9">
                    0x{Buffer.from(instruction.discriminator).toString("hex")}
                  </Tag>
                </Tooltip>
              </Space>
            ),
            extra:
              action === AbiAction.Write ? (
                <Tooltip title="Supportive Instructions" placement="left">
                  <ThunderboltTwoTone
                    onClick={(event) => {
                      event.stopPropagation();
                      setWriteFull(instruction);
                    }}
                  />
                </Tooltip>
              ) : undefined,
            children: (
              <>
                <SolanaInstructionForm
                  contractTemplate={contractTemplate}
                  contractAddress={contractAddress}
                  wallet={wallet}
                  blockchain={blockchain}
                  instruction={instruction}
                  disabled
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  // loading={loading}
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
                {/* {txResponse && (
                  <Descriptions
                    bordered
                    size="small"
                    items={Object.entries(txResponse).map(([key, value]) => ({
                      key,
                      label: capitalize(key),
                      children: value,
                    }))}
                  />
                )} */}
              </>
            ),
          }))}
      />
      <SolanaFullInstructionForm
        contractTemplate={contractTemplate}
        contractAddress={contractAddress}
        wallet={wallet}
        blockchain={blockchain}
        instruction={writeFull}
        onClose={() => setWriteFull(undefined)}
      />
    </>
  );
};

export default SolanaForm;
