import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, CollapseProps, Empty } from "antd";

const CollapseForm: React.FC<{ items: CollapseProps["items"] }> = ({
  items,
}) => {
  if (!items || items.length === 0) return <Empty />;
  return (
    <Collapse
      accordion
      items={items}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
    />
  );
};

export default CollapseForm;
