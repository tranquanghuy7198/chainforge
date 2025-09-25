import Paragraph from "antd/es/typography/Paragraph";
import React from "react";

const ContractCallError: React.FC<{ error: any }> = ({ error }) => {
  return (
    <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}>
      Your smart contract call did not succeed. Please check that your RPC
      endpoint is not rate-limited and verify your contract logic.
      <br />
      <strong>Detailed error:</strong>
      <br />
      {error instanceof Error ? error.message : String(error)}
    </Paragraph>
  );
};

export default ContractCallError;
