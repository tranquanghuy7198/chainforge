import { HexInput, MoveFunctionId } from "@aptos-labs/ts-sdk";

export type AptosCompiledBytecode = {
  function_id: MoveFunctionId;
  type_args: any[];
  args: [{ type: "hex"; value: HexInput }, { type: "hex"; value: HexInput[] }];
};
