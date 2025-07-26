import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Flex } from "antd";
import React from "react";
import "./solana-form.scss";
import { CloseOutlined, HolderOutlined } from "@ant-design/icons";

const InstructionController: React.FC<{
  id: string;
  name: string;
  selected: boolean;
  deletable: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ id, name, selected, deletable, onSelect, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: selected ? "#e6f4ff" : "#fff",
  };

  return (
    <Card
      hoverable
      size="small"
      ref={setNodeRef}
      className="ix-controller"
      style={style}
      onClick={onSelect}
      {...attributes}
    >
      <Flex align="center">
        <HolderOutlined {...listeners} className="ix-drag" />
        <div className="ix-title">{name}</div>
        {deletable && (
          <CloseOutlined
            className="ix-close"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          />
        )}
      </Flex>
    </Card>
  );
};

export default InstructionController;
