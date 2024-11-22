"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeValue = encodeValue;
exports.decodeValue = decodeValue;
exports.stringChunks = stringChunks;
function encodeValue(value) {
    let valueType = typeof value;
    let strValue;
    if (valueType == "function" || valueType == "symbol") {
        throw new Error("Not Allowed.");
    }
    else if (valueType == "object") {
        strValue = JSON.stringify(value);
    }
    else if (valueType == "undefined") {
        strValue = "";
    }
    else {
        strValue = value.toString();
    }
    return (valueType == "bigint" ? "i" : valueType[0]) + strValue;
}
function decodeValue(encoded) {
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
function stringChunks(str, perChunk = 1990) {
    const result = [];
    let index = 0;
    const strLength = str.length;
    while (index < strLength) {
        result.push(str.slice(index, index + perChunk));
        index += perChunk;
    }
    return result;
}
//# sourceMappingURL=util.js.map