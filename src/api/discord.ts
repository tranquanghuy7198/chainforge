import { WEBHOOK } from "@api/constants";

export type BlockchainForm = {
  name: string;
  referenceLink: string;
  isTestnet: boolean;
};

export const requestNewBlockchain = async (blockchain: BlockchainForm) => {
  await fetch(WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "Blockchain Request",
          color: 0x00ff00,
          fields: [
            {
              name: "Name",
              value: blockchain.name,
              inline: false,
            },
            {
              name: "Reference Link",
              value: blockchain.referenceLink,
              inline: false,
            },
            {
              name: "Mainnet",
              value: blockchain.isTestnet ? "No" : "Yes",
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
};
