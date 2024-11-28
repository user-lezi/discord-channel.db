"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = void 0;
exports.ThrowConnectionError = ThrowConnectionError;
class DatabaseError extends Error {
    message;
    constructor(message) {
        super();
        this.message = message;
    }
    static NotConnected() {
        throw new this("The database is not connected");
    }
    static ClientNotConnected() {
        throw new this("The client is not connected");
    }
    static InvalidType(_for, expected, got) {
        throw new this(`Invalid Type for ${_for}. Expected (${expected}), got ${typeof got}.`);
    }
    static InvalidInstance(_for, expected, got) {
        throw new this(`Invalid Instance for ${_for}. Expected (${expected}), got ${got?.constructor?.name}.`);
    }
    static InvalidTable(value) {
        throw new this(`Invalid table "${value}"`);
    }
    static InvalidTableName(value) {
        throw new this(`Invalid/Unallowed table name: "${value}"`);
    }
}
exports.DatabaseError = DatabaseError;
function ThrowConnectionError(db) {
    return db.isConnected()
        ? void 0
        : db.client.isReady()
            ? DatabaseError.NotConnected()
            : DatabaseError.ClientNotConnected();
}
//# sourceMappingURL=Error.js.map