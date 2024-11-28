import { CategoryChannel, Client, Collection } from "discord.js";
import { DatabaseTable } from "./DatabaseTable";
export interface IDatabaseOptions {
    client: Client;
    categoryID: string;
}
export interface IBulkSetOptions<T> {
    name: string;
    value: unknown;
    table?: T;
}
export interface IBulkDeleteOptions<T> {
    name: string;
    table?: T;
}
export declare class Database<Tables extends string = "main"> {
    #private;
    options: IDatabaseOptions & {
        tables: Tables[];
    };
    constructor(options: IDatabaseOptions, tableNames?: Tables[]);
    get client(): Client<boolean>;
    get category(): CategoryChannel;
    get tables(): Collection<Tables, DatabaseTable>;
    get tableNames(): Tables[];
    isConnected(): boolean;
    connect(fetchValues?: boolean): Promise<boolean>;
    fetch(): Promise<void>;
    get size(): number;
    get sizeMap(): Collection<Tables, number>;
    wipe(): Promise<boolean>;
    set(identifier: string, value: any, tableName?: Tables): Promise<Collection<string, import("./DatabaseTable").IValue<any>>>;
    bulkSet(...args: IBulkSetOptions<Tables>[]): Promise<Collection<string, import("./DatabaseTable").IValue<any>>[]>;
    get<T = unknown>(identifier: string, tableName?: Tables): void | {
        thread: import("discord.js").ThreadChannel<boolean>;
        value: T;
        identifier: string;
        type: string;
    } | null;
    delete(identifier: string, tableName?: Tables): Promise<boolean>;
    bulkDelete(...args: IBulkDeleteOptions<Tables>[]): Promise<boolean[]>;
    allFromTable<T = unknown>(tableName: Tables): {
        thread: import("discord.js").ThreadChannel<boolean>;
        value: T;
        identifier: string;
        type: string;
    }[];
    all<T = unknown>(): Collection<Tables, {
        thread: import("discord.js").ThreadChannel<boolean>;
        value: T;
        identifier: string;
        type: string;
    }[]>;
    allFromTableMap<T = unknown>(tableName: Tables): Collection<string, {
        thread: import("discord.js").ThreadChannel<boolean>;
        value: T;
        identifier: string;
        type: string;
    }>;
    allMap<T = unknown>(): Collection<Tables, Collection<string, {
        thread: import("discord.js").ThreadChannel<boolean>;
        value: T;
        identifier: string;
        type: string;
    }>>;
    toJSON(): {
        tables: Record<Tables, Record<string, {
            value: any;
            type: string;
            threadId: string;
        }>>;
        categoryID: string;
        tableNames: Tables[];
    };
    static fromJSON(client: Client, json: ReturnType<Database["toJSON"]>): Promise<Database<"main">>;
}
//# sourceMappingURL=Database.d.ts.map