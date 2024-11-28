import { Database } from "./Database";
export declare class DatabaseError extends Error {
    message: string;
    constructor(message: string);
    static NotConnected(): void;
    static ClientNotConnected(): void;
    static InvalidType(_for: string, expected: string, got: unknown): void;
    static InvalidInstance(_for: string, expected: string, got: object): void;
    static InvalidTable(value: string): void;
    static InvalidTableName(value: string): void;
}
export declare function ThrowConnectionError(db: Database<string>): void;
//# sourceMappingURL=Error.d.ts.map