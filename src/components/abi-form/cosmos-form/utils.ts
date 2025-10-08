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

const cwIdlDefinitions = (
  idl: CosmWasmIdl
): Record<string, CosmWasmJSONSchema> => {
  let result: Record<string, CosmWasmJSONSchema> = {};
  if (idl.instantiate)
    result = { ...result, ...cwSchemaDefinitions(idl.instantiate) };
  if (idl.execute)
    for (const func of idl.execute.oneOf)
      result = { ...result, ...cwSchemaDefinitions(func) };
  if (idl.query)
    for (const func of idl.query.oneOf)
      result = { ...result, ...cwSchemaDefinitions(func) };
  if (idl.migrate) result = { ...result, ...cwSchemaDefinitions(idl.migrate) };
  if (idl.sudo)
    for (const func of idl.sudo.oneOf)
      result = { ...result, ...cwSchemaDefinitions(func) };
  if (idl.responses)
    for (const response of Object.values(idl.responses))
      result = { ...result, ...cwSchemaDefinitions(response) };
  return result;
};

const cwSchemaDefinitions = (
  schema: CosmWasmJSONSchema
): Record<string, CosmWasmJSONSchema> => {
  let defs: Record<string, CosmWasmJSONSchema> = {};
  if (Array.isArray(schema.items))
    for (const item of schema.items)
      defs = { ...defs, ...cwSchemaDefinitions(item) };
  else if (schema.items)
    defs = { ...defs, ...cwSchemaDefinitions(schema.items) };
  if (schema.additionalItems)
    defs = { ...defs, ...cwSchemaDefinitions(schema.additionalItems) };
  if (schema.contains)
    defs = { ...defs, ...cwSchemaDefinitions(schema.contains) };
  if (schema.properties)
    for (const prop of Object.values(schema.properties))
      defs = { ...defs, ...cwSchemaDefinitions(prop) };
  if (schema.patternProperties)
    for (const prop of Object.values(schema.patternProperties))
      defs = { ...defs, ...cwSchemaDefinitions(prop) };
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties !== "boolean"
  )
    defs = { ...defs, ...cwSchemaDefinitions(schema.additionalProperties) };
  if (schema.dependencies)
    for (const dep of Object.values(schema.dependencies))
      if (!Array.isArray(dep)) defs = { ...defs, ...cwSchemaDefinitions(dep) };
  if (schema.propertyNames)
    defs = { ...defs, ...cwSchemaDefinitions(schema.propertyNames) };
  if (schema.if) defs = { ...defs, ...cwSchemaDefinitions(schema.if) };
  if (schema.then) defs = { ...defs, ...cwSchemaDefinitions(schema.then) };
  if (schema.else) defs = { ...defs, ...cwSchemaDefinitions(schema.else) };
  if (schema.allOf)
    for (const allOf of schema.allOf)
      defs = { ...defs, ...cwSchemaDefinitions(allOf) };
  if (schema.anyOf)
    for (const anyOf of schema.anyOf)
      defs = { ...defs, ...cwSchemaDefinitions(anyOf) };
  if (schema.oneOf)
    for (const oneOf of schema.oneOf)
      defs = { ...defs, ...cwSchemaDefinitions(oneOf) };
  if (schema.not) defs = { ...defs, ...cwSchemaDefinitions(schema.not) };
  if (schema.definitions) defs = { ...defs, ...schema.definitions };
  return defs;
};

const isOptionalCosmosType = (
  paramType: CosmWasmJSONSchema
): [boolean, CosmWasmJSONSchema | null] => {
  if (paramType.type === "null") return [true, null];
  if (
    Array.isArray(paramType.type) &&
    paramType.type.some((subType) => subType === "null")
  )
    return [
      true,
      {
        ...paramType,
        type: paramType.type.filter((subType) => subType !== "null"),
      },
    ];
  if (paramType.anyOf?.some((subType) => isOptionalCosmosType(subType)))
    return [
      true,
      {
        ...paramType,
        anyOf: paramType.anyOf.filter(
          (subType) => !isOptionalCosmosType(subType)
        ),
      },
    ];
  return [false, paramType];
};

const parseCosmosParam = (
  paramName: string,
  paramType: CosmWasmJSONSchema,
  rawParam: string | undefined,
  definitions: Record<string, CosmWasmJSONSchema>
): any => {
  // Complex type - recursive down to single type
  if (paramType.anyOf)
    for (const subType of paramType.anyOf)
      try {
        return parseCosmosParam(paramName, subType, rawParam, definitions);
      } catch {
        continue;
      }
  if (paramType.allOf)
    for (const subType of paramType.allOf)
      try {
        return parseCosmosParam(paramName, subType, rawParam, definitions);
      } catch {
        continue;
      }
  if (Array.isArray(paramType.type))
    for (const subType of paramType.type)
      try {
        return parseCosmosParam(
          paramName,
          { ...paramType, type: subType },
          rawParam,
          definitions
        );
      } catch {
        continue;
      }

  // Primitive types
  if (
    rawParam &&
    paramType.format &&
    ["uint8", "int8", "uint16", "int16", "uint32", "int32"].includes(
      paramType.format
    )
  )
    return JSON.parse(rawParam);
  if (
    rawParam &&
    paramType.format &&
    ["uint64", "int64", "uint128", "int128"].includes(paramType.format)
  )
    return rawParam;
  if (rawParam && paramType.type === "boolean") return JSON.parse(rawParam);

  // Array
  if (rawParam && paramType.type === "array" && paramType.items) {
    const parsedParam = JSON.parse(rawParam);
    if (!Array.isArray(parsedParam))
      throw new Error(`${paramName} is an invalid array`);
    const parsedArray: any[] = [];
    const itemTypes = Array.isArray(paramType.items)
      ? paramType.items
      : [paramType.items];
    for (const [index, subParam] of parsedParam.entries())
      for (const itemType of itemTypes)
        try {
          const parsedItem = parseCosmosParam(
            `${paramName}[${index}]`,
            itemType,
            subParam ? JSON.stringify(subParam) : undefined,
            definitions
          );
          parsedArray.push(parsedItem);
          break;
        } catch {
          continue;
        }
    return parsedArray;
  }

  // Option
  const [isOptional, nonOptionalType] = isOptionalCosmosType(paramType);
  if (isOptional) {
    if (rawParam === undefined) return null;
    if (nonOptionalType)
      return parseCosmosParam(
        paramName,
        nonOptionalType,
        rawParam,
        definitions
      );
    throw new Error(`${paramName} is an invalid optional type`);
  }

  // Object
  if (rawParam && paramType.type === "object") {
    const parsedParam = JSON.parse(rawParam);
    const result: Record<string, any> = {};
    for (const [propName, propType] of Object.entries(
      paramType.properties || {}
    ))
      result[propName] = parseCosmosParam(
        `${paramName}.${propName}`,
        propType,
        parsedParam[propName]
          ? JSON.stringify(parsedParam[propName])
          : undefined,
        definitions
      );
    return result;
  }

  // Remaining types
  if (paramType.type) return rawParam;

  // Parse $ref
  if (paramType.$ref) {
    const definedParamTypeName = paramType.$ref.split("/").pop();
    if (!definedParamTypeName)
      throw new Error(`${paramName} is an invalid defined type`);
    const definedParamType = definitions[definedParamTypeName];
    if (!definedParamType)
      throw new Error(`${paramName} is an invalid defined type`);
    return parseCosmosParam(paramName, definedParamType, rawParam, definitions);
  }

  throw new Error(`${paramName} is an invalid type`);
};

export const parseCosmosArguments = (
  idl: CosmWasmIdl,
  func: CosmWasmJSONSchema,
  rawParams: Record<string, string | undefined>
) => {
  const defintions = cwIdlDefinitions(idl);
  const parsedParams: Record<string, any> = {};
  for (const [paramName, rawValue] of Object.entries(rawParams))
    parsedParams[paramName] = parseCosmosParam(
      paramName,
      func.properties![paramName],
      rawValue,
      defintions
    );
  return parsedParams;
};
