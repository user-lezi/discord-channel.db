export function encodeValue(value: any) {
  let valueType = typeof value;
  let strValue: string;
  if (valueType == "function" || valueType == "symbol") {
    throw new Error("Not Allowed.");
  } else if (valueType == "object") {
    strValue = JSON.stringify(value);
  } else if (valueType == "undefined") {
    strValue = "";
  } else {
    strValue = (value as boolean | string | bigint | number).toString();
  }

  return (valueType == "bigint" ? "i" : valueType[0]) + strValue;
}

export function decodeValue<T = unknown>(encoded: string): T {
  let type = encoded[0];
  let strValue = encoded.slice(1);
  return type == "o"
    ? JSON.parse(strValue)
    : type == "u"
      ? undefined
      : type == "b"
        ? Boolean(strValue)
        : type == "i"
          ? BigInt(strValue)
          : type == "n"
            ? Number(strValue)
            : strValue;
}

export function stringChunks(str: string, perChunk: number = 1990): string[] {
  const result: string[] = [];
  let index = 0;
  const strLength = str.length;

  while (index < strLength) {
    result.push(str.slice(index, index + perChunk));
    index += perChunk;
  }

  return result;
}
