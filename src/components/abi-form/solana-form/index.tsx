import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "../../../utils/constants";
import { Wallet } from "../../../utils/wallets/wallet";
import { Space, Tag, Tooltip } from "antd";
import { useState } from "react";
import { Idl, IdlInstruction } from "../../../utils/types/solana";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import CollapseForm from "../collapse-form";
import "./solana-form.scss";
import { createApproveInstruction } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { ThunderboltTwoTone } from "@ant-design/icons";
import { DEPLOYMENT_INSTRUCTION, getFullInstructions } from "./utils";
import SolanaAdvancedInstructionForm from "./advanced-instruction-form";
import SolanaBasicInstructionForm from "./basic-instruction-form";

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
  const [advancedIx, setAdvancedIx] = useState<IdlInstruction>();
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
                <Tooltip title="Advanced Mode">
                  <ThunderboltTwoTone
                    onClick={(event) => {
                      event.stopPropagation();
                      setAdvancedIx(instruction);
                    }}
                  />
                </Tooltip>
              ) : undefined,
            children: (
              <SolanaBasicInstructionForm
                action={action}
                contractTemplate={contractTemplate}
                contractAddress={contractAddress}
                wallet={wallet}
                blockchain={blockchain}
                instruction={instruction}
                saveDeployedContract={saveDeployedContract}
              />
            ),
          }))}
      />
      <SolanaAdvancedInstructionForm
        contractTemplate={contractTemplate}
        contractAddress={contractAddress}
        wallet={wallet}
        blockchain={blockchain}
        instruction={advancedIx}
        onClose={() => setAdvancedIx(undefined)}
      />
    </>
  );
};

export default SolanaForm;
