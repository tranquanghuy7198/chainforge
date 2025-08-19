import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import { Space, Tag, Tooltip } from "antd";
import { useState } from "react";
import { Idl, IdlInstruction } from "@utils/types/solana";
import CollapseForm from "@components/abi-form/collapse-form";
import "@components/abi-form/solana-form/solana-form.scss";
import { ThunderboltFilled } from "@ant-design/icons";
import {
  DEPLOYMENT_INSTRUCTION,
  getFullInstructions,
} from "@components/abi-form/solana-form/utils";
import SolanaAdvancedInstructionForm from "@components/abi-form/solana-form/advanced-instruction-form";
import SolanaBasicInstructionForm from "@components/abi-form/solana-form/basic-instruction-form";

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
                {instruction.discriminator.length > 0 && (
                  <Tooltip title="Instruction Discriminator">
                    <Tag color="green" bordered={false}>
                      0x{Buffer.from(instruction.discriminator).toString("hex")}
                    </Tag>
                  </Tooltip>
                )}
              </Space>
            ),
            extra:
              action === AbiAction.Write ? (
                <Tooltip title="Advanced Mode">
                  <ThunderboltFilled
                    className="advanced-mode"
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
