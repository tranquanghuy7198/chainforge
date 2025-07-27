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
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { capitalize } from "../../../utils/utils";
import TransactionResult from "../tx-response";
import { SolanaInstruction, SUPPORTIVE_IXS } from "./supportive-ixs";
import { v4 } from "uuid";
import SolanaInstructionForm from "./instruction-form";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import InstructionController from "./ix-controller";

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
  const [instructions, setInstructions] = useState<SolanaInstruction[]>([]);
  const [selectedIx, setSelectedIx] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [txResp, setTxResp] = useState<TxResponse>();

  const reorderTxs = (event: DragEndEvent) => {
    if (event.over && event.active.id !== event.over.id)
      setInstructions((ixs) => {
        const oldIndex = ixs.findIndex((ix) => ix.id === event.active.id);
        const newIndex = ixs.findIndex((ix) => ix.id === event.over?.id);
        return arrayMove(ixs, oldIndex, newIndex);
      });
  };

  const resetAndClose = () => {
    setWallet(wallet);
    setInstructions([]);
    setSelectedIx(undefined);
    setLoading(false);
    setTxResp(undefined);
    onClose();
  };

  const addInstruction = (ix: SolanaInstruction) => {
    const newId = ix.id || v4();
    if (instructions.every((ix) => ix.id !== newId)) {
      setInstructions([{ ...ix, id: newId }, ...instructions]);
      setSelectedIx(newId); // auto focus on this new instruction
    }
  };

  const removeInstruction = (id: string) => {
    setInstructions(instructions.filter((ix) => ix.id !== id));
    setSelectedIx(
      id !== selectedIx
        ? selectedIx
        : instructions.length > 0
        ? instructions[0].id
        : instruction?.name
    );
  };

  const setIxRawData = (data: IxRawData) => {
    let exists = false;
    const newInstructions: SolanaInstruction[] = [];

    // Normal case: instruction updated
    for (const ix of instructions)
      if (ix.id === selectedIx) {
        exists = true;
        newInstructions.push({ ...ix, rawData: data });
      } else newInstructions.push(ix);
    setInstructions(newInstructions);

    // Initial case: first initialization of the main instruction
    if (!exists && instruction)
      addInstruction({
        id: instruction.name,
        name: instruction.name,
        rawData: data,
        idlInstruction: instruction,
      });
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
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={reorderTxs}
            >
              <SortableContext
                items={instructions}
                strategy={verticalListSortingStrategy}
              >
                {instructions.map((ix) => (
                  <InstructionController
                    key={ix.id}
                    id={ix.id}
                    name={ix.name}
                    selected={ix.id === selectedIx}
                    deletable={ix.id !== instruction?.name}
                    onSelect={() => setSelectedIx(ix.id)}
                    onDelete={() => removeInstruction(ix.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: SUPPORTIVE_IXS.map((ix) => ({
                  key: ix.id,
                  label: ix.name,
                  onClick: () => addInstruction(ix),
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
          <div className="inner-advanced-ix-form">
            {instruction && (
              <SolanaInstructionForm
                contractTemplate={contractTemplate}
                contractAddress={contractAddress}
                wallet={selectedWallet}
                blockchain={blockchain}
                disabled={loading}
                defaultValue={
                  instructions.find((ix) => ix.id === selectedIx)?.rawData
                }
                onIxDataChange={(data) => setIxRawData(data)}
                instruction={
                  instructions.find((ix) => ix.id === selectedIx)
                    ?.idlInstruction || instruction
                }
              />
            )}
          </div>
        </Flex>
      </Drawer>
    </>
  );
};

export default SolanaAdvancedInstructionForm;
