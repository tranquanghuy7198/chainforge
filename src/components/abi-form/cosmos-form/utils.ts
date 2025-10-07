import { AbiAction } from "@utils/constants";

export type CosmWasmFormat =
  | "int8"
  | "uint8"
  | "int16"
  | "uint16"
  | "int32"
  | "uint32"
  | "int64"
  | "uint64"
  | "int128"
  | "uint128";

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

  format?: CosmWasmFormat;
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
  if (action === AbiAction.Deploy && idl.instantiate)
    return [["instantiate", idl.instantiate]];
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

// Human-readable param type, to use as input placeholders
export const cwParamType = (param: CosmWasmJSONSchema): [string, boolean] => {
  // Complex param type
  if (param.anyOf) {
    const paramTypes: string[] = [];
    let required = true;
    for (const subParam of param.anyOf) {
      const [subParamType, subRequired] = cwParamType(subParam);
      paramTypes.push(subParamType);
      required &&= subRequired;
    }
    return [paramTypes.join("|"), required];
  }

  // Parse main type
  let mainType = "";
  let required = true;
  if (param.format) mainType = param.format;
  else if (typeof param.type === "string") {
    mainType = param.type;
    required &&= param.type !== "null";
  } else if (Array.isArray(param.type)) {
    mainType = param.type.join("|");
    required &&= !param.type.includes("null");
  } else if (param.$ref) mainType = param.$ref.split("/").pop() || param.$ref;

  // Parse sub type
  if (param.items) {
    const items = Array.isArray(param.items) ? param.items : [param.items];
    const itemTypes: string[] = [];
    for (const item of items) {
      const [itemType, itemRequired] = cwParamType(item);
      itemTypes.push(itemType);
      required &&= itemRequired;
    }
    return [`${mainType}<${itemTypes.join("|")}>`, required];
  }

  return [mainType, required];
};

const parseCosmosParam = (
  paramName: string,
  paramType: CosmWasmJSONSchema,
  rawParam: string | undefined
) => {
  // Primitive types
  if (
    rawParam &&
    paramType.format &&
    ["u8", "i8", "u16", "i16", "u32", "i32"].includes(paramType.format)
  )
    return JSON.parse(rawParam);
  if (rawParam && paramType.type === "boolean") return JSON.parse(rawParam);

  // Array
  if (rawParam && paramType.type === "array") {
    const parsedParam = JSON.parse(rawParam);
    if (!Array.isArray(parsedParam))
      throw new Error(`${paramName} is an invalid array`);
    return parsedParam.map((subParam) =>
      parseCosmosParam(paramName, paramType.items, JSON.stringify(subParam))
    );
  }

  // Option

  // Other types, string accepted
  return rawParam;
};

export const parseCosmosArguments = (
  func: CosmWasmJSONSchema,
  rawParams: Record<string, string | undefined>
) => {
  const parsedParams: Record<string, any> = {};
  for (const [paramName, rawValue] of Object.entries(rawParams)) {
    const paramType = func.properties![paramName];
    parsedParams[paramName] = parseCosmosParam(paramName, paramType, rawValue);
  }
  return parsedParams;
};
