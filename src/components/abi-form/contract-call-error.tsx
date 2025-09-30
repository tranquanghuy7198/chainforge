import Paragraph from "antd/es/typography/Paragraph";
import React from "react";

const ContractCallError: React.FC<{ error: any }> = ({ error }) => {
  return (
    <>
      <Paragraph>
        Your smart contract call did not succeed. Please check that your RPC
        endpoint is not rate-limited and verify your contract logic.
      </Paragraph>
      <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}>
        <strong>Detailed error:</strong>
        <br />
        {error instanceof Error ? error.message : String(error)}
      </Paragraph>
    </>
  );
};

export default ContractCallError;
