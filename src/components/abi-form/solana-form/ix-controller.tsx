import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Flex } from "antd";
import React from "react";
import "./solana-form.scss";
import { CloseOutlined, HolderOutlined } from "@ant-design/icons";

const InstructionController: React.FC<{
  id: string;
  name: string;
  deletable: boolean;
  onDelete: () => void;
}> = ({ id, name, deletable, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      hoverable
      size="small"
      ref={setNodeRef}
      className="ix-controller"
      style={style}
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
