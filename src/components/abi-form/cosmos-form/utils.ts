import { AbiAction } from "@utils/constants";

export type CosmWasmType =
  | "null"
  | "boolean"
  | "object"
  | "array"
  | "number"
  | "string"
  | "integer";

export interface CosmWasmJSONSchema {
  type?: CosmWasmType | CosmWasmType[];
  title?: string;
  description?: string;
  $schema?: string;
  $id?: string;
  $ref?: string;
  $comment?: string;

  enum?: any[];
  const?: any;

  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;

  maxLength?: number;
  minLength?: number;
  pattern?: string;

  items?: CosmWasmJSONSchema | CosmWasmJSONSchema[];
  additionalItems?: CosmWasmJSONSchema;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: CosmWasmJSONSchema;

  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: Record<string, CosmWasmJSONSchema>;
  patternProperties?: Record<string, CosmWasmJSONSchema>;
  additionalProperties?: boolean | CosmWasmJSONSchema;
  dependencies?: Record<string, CosmWasmJSONSchema | string[]>;
  propertyNames?: CosmWasmJSONSchema;

  if?: CosmWasmJSONSchema;
  then?: CosmWasmJSONSchema;
  else?: CosmWasmJSONSchema;

  allOf?: CosmWasmJSONSchema[];
  anyOf?: CosmWasmJSONSchema[];
  oneOf?: CosmWasmJSONSchema[];
  not?: CosmWasmJSONSchema;

  definitions?: Record<string, CosmWasmJSONSchema>;

  default?: any;
  examples?: any[];

  format?: string;
  contentEncoding?: string;
  contentMediaType?: string;

  readOnly?: boolean;
  writeOnly?: boolean;
}

export interface CosmWasmMsgSchema {
  oneOf: CosmWasmJSONSchema[];
  title?: string;
  $schema?: string;
}

export interface CosmWasmIdl {
  contract_name: string;
  contract_version: string;
  idl_version: string;
  instantiate?: CosmWasmJSONSchema;
  execute?: CosmWasmMsgSchema;
  query?: CosmWasmMsgSchema;
  migrate?: CosmWasmJSONSchema;
  sudo?: CosmWasmMsgSchema;
  responses?: Record<string, CosmWasmJSONSchema>;
}

export const getCowmWasmFuncs = (
  idl: CosmWasmIdl,
  action: AbiAction
): [string, CosmWasmJSONSchema][] => {
  const functionSet =
    action === AbiAction.Read
      ? idl.query?.oneOf || []
      : action === AbiAction.Write
      ? idl.execute?.oneOf || []
      : [];
  const functions: [string, CosmWasmJSONSchema][] = [];
  for (const func of functionSet)
    if (func.type === "object")
      for (const funcName of func.required || [])
        if (func.properties && funcName in func.properties)
          functions.push([funcName, func.properties[funcName]]);
  return functions;
};

export const cwParamType = (param: CosmWasmJSONSchema): string => {
  let mainType = "";
  if (typeof param.type === "string") mainType = param.type;
  if (Array.isArray(param.type)) mainType = param.type.join("|");
  if (param.$ref) mainType = param.$ref.split("/").pop() || param.$ref;
  if (param.items) {
    let itemType = "";
    if (Array.isArray(param.items))
      itemType = param.items.map((item) => cwParamType(item)).join("|");
    else itemType = cwParamType(param.items);
    return `${mainType}<${itemType}>`;
  }
  return mainType;
};
