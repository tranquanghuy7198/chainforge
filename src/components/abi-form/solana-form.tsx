import useNotification from "antd/es/notification/useNotification";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "../../utils/constants";
import { Wallet } from "../../utils/wallets/wallet";
import { Button, Collapse, Descriptions, Form, Input } from "antd";
import { useState } from "react";
import { capitalize } from "../../utils/utils";
import {
  ACCOUNT_PARAM,
  ARG_PARAM,
  convertIdlToCamelCase,
  Idl,
  IdlInstruction,
  parseArg,
  stringifyArgType,
} from "../../utils/types/solana";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";
import { PublicKey } from "@solana/web3.js";

const DEPLOYMENT_INSTRUCTION = "deploy";

const deploymentSimilationInstruction: IdlInstruction = {
  name: DEPLOYMENT_INSTRUCTION,
  discriminator: [],
  accounts: [],
  args: [],
};

const SolanaForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({ action, contractTemplate, contractAddress, wallet, blockchain }) => {
  const [notification, contextHolder] = useNotification();
  const [txResponses, setTxResponses] = useState<Record<string, TxResponse>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);

  const deploy = async (wallet: Wallet, blockchain: Blockchain) => {
    // const response = await wallet.deploy(
    //   blockchain,
    //   contractTemplate.abi,
    //   contractTemplate.bytecode,
    //   null,
    //   contractTemplate.programKeypair
    //     ? JSON.stringify(contractTemplate.programKeypair)
    //     : undefined
    // );
    // setTxResponses({ ...txResponses, [DEPLOYMENT_INSTRUCTION]: response });
  };

  const read = async (
    wallet: Wallet,
    blockchain: Blockchain,
    instruction: IdlInstruction,
    args: any[],
    accounts: Record<string, PublicKey>
  ) => {
    // if (!contractAddress) {
    //   notification.error({
    //     message: "No contract selected",
    //     description: "You must select a contract first",
    //   });
    //   return;
    // }
    // const response = await wallet.readContract(
    //   blockchain,
    //   contractAddress.address,
    //   contractTemplate.abi,
    //   instruction.name,
    //   [args, accounts]
    // );
    // setTxResponses({ ...txResponses, [instruction.name]: response });
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    instruction: IdlInstruction,
    args: any[],
    accounts: Record<string, PublicKey>
  ) => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }

    const response = await wallet.writeContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      instruction.name,
      [args, accounts]
    );

    setTxResponses({ ...txResponses, [instruction.name]: response });
  };

  const execute = async (
    instruction: IdlInstruction,
    params: Record<string, Record<string, string>>
  ) => {
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
    const { [instruction.name]: _, ...newTxResponses } = txResponses;
    setTxResponses(newTxResponses);

    // Execute
    try {
      // Prepare args and accounts
      const args = instruction.args.map((arg) =>
        parseArg((params[ARG_PARAM] || {})[arg.name], arg.type)
      );
      const accounts = Object.fromEntries(
        Object.entries(params[ACCOUNT_PARAM] || {}).map(([key, value]) => [
          key,
          new PublicKey(value),
        ])
      );

      // Execute in wallet
      if (action === AbiAction.Deploy) await deploy(wallet, blockchain);
      else if (action === AbiAction.Read)
        await read(wallet, blockchain, instruction, args, accounts);
      else if (action === AbiAction.Write)
        await write(wallet, blockchain, instruction, args, accounts);
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
      <Collapse
        accordion
        items={[
          ...convertIdlToCamelCase(contractTemplate.abi as Idl).instructions,
          deploymentSimilationInstruction,
        ]
          .filter((instruction) => {
            if (action === AbiAction.Deploy)
              return instruction.name === DEPLOYMENT_INSTRUCTION;
            let isWriteInstruction = true;
            // TODO: classify read and write
            // for (const account of instruction.accounts)
            //   console.log(account.name, typeof account);
            return (
              instruction.name !== DEPLOYMENT_INSTRUCTION &&
              isWriteInstruction === (action === AbiAction.Write)
            );
          })
          .map((instruction) => ({
            key: instruction.name,
            label: instruction.name,
            children: (
              <>
                <Form
                  name={instruction.name}
                  layout="horizontal"
                  onFinish={(values) => execute(instruction, values)}
                >
                  {instruction.accounts
                    .filter(
                      (account) =>
                        !("pda" in account) && !("address" in account)
                    )
                    .map((account) => (
                      <Form.Item
                        key={account.name}
                        name={[ACCOUNT_PARAM, account.name]}
                        label={account.name}
                        required
                      >
                        <Input placeholder="Public Key" disabled={loading} />
                      </Form.Item>
                    ))}
                  {instruction.args.map((arg) => (
                    <Form.Item
                      key={arg.name}
                      name={[ARG_PARAM, arg.name]}
                      label={arg.name}
                      required
                    >
                      <Input
                        placeholder={stringifyArgType(arg.type)}
                        disabled={loading}
                      />
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
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
                  </Form.Item>
                </Form>
                {Object.keys(txResponses).includes(instruction.name) && (
                  <Descriptions
                    bordered
                    size="small"
                    items={Object.entries(txResponses[instruction.name]).map(
                      ([key, value]) => ({
                        key,
                        label: capitalize(key),
                        children: value,
                      })
                    )}
                  />
                )}
              </>
            ),
          }))}
      />
    </>
  );
};

export default SolanaForm;
