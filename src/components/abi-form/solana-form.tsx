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
  Idl,
  IdlInstruction,
  stringifyArgType,
} from "../../utils/types/solana";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { convertIdlToCamelCase } from "@coral-xyz/anchor/dist/cjs/idl";
import Paragraph from "antd/es/typography/Paragraph";
import { PublicKey } from "@solana/web3.js";

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

  const read = async (
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

    const response = await wallet.readContract(
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
      const args = instruction.args.map((arg) => {
        const rawArg = (params[ARG_PARAM] || {})[arg.name];
        if (arg.type === "pubkey") return new PublicKey(rawArg);
        return rawArg;
      });
      const accounts = Object.fromEntries(
        Object.entries(params[ACCOUNT_PARAM] || {}).map(([key, value]) => [
          key,
          new PublicKey(value),
        ])
      );

      // Execute in wallet
      if (action === AbiAction.Deploy)
        // await deploy(wallet, blockchain, instruction, params);
        console.log("deploy");
      else if (action === AbiAction.Read)
        await read(wallet, blockchain, instruction, args, accounts);
      else if (action === AbiAction.Write)
        // await write(wallet, blockchain, instruction, params);
        console.log("write");
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
        items={convertIdlToCamelCase(contractTemplate.abi as Idl)
          .instructions.filter((instruction) => {
            let isWriteInstruction = false;
            // TODO: classify read and write
            // for (const account of instruction.accounts)
            //   console.log(account.name, typeof account);
            return isWriteInstruction === (action === AbiAction.Write);
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
