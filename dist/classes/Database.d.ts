import { Collection, Client, Guild, TextChannel } from "discord.js";
import { KeyValue } from "./KeyValue";
export interface IDatabaseOptions {
    guilds: string[];
    deleteNonDBChannels?: boolean;
    size?: number;
    cacheEvery?: number;
}
export declare class Database {
    #private;
    static readonly ChannelNameRegex: RegExp;
    options: Required<IDatabaseOptions>;
    isConnected: boolean;
    constructor(client: Client, options: IDatabaseOptions);
    get client(): Client<boolean>;
    get guilds(): Guild[];
    get cache(): Collection<string, KeyValue>;
    get size(): number;
    connect(): Promise<boolean>;
    channels(): Promise<TextChannel[]>;
    wipe(): Promise<boolean>;
    set(key: string, value: any): Promise<KeyValue | null>;
    get(key: string): {
        key: string;
        value: any;
        type: string;
        createdTimestamp: number;
        editedTimestamp: number;
        _id: string;
    } | null;
    all(type?: string): Promise<{
        key: string;
        value: any;
        type: string;
        createdTimestamp: number;
        editedTimestamp: number;
        _id: string;
    }[]>;
    delete(key: string): Promise<boolean | null>;
    bulkSet(...data: [string, any][]): Promise<(KeyValue | null)[] | null>;
    bulkDelete(...keys: string[]): Promise<this | null>;
    find(query: string | RegExp | ((key: string, kv: KeyValue) => boolean), type?: string): Promise<{
        key: string;
        value: any;
        type: string;
        createdTimestamp: number;
        editedTimestamp: number;
        _id: string;
    }[]>;
    ping(showCachePing?: boolean): Promise<{
        write: number;
        edit: number;
        delete: number;
        cache: number;
        total: number;
    }>;
}
//# sourceMappingURL=Database.d.ts.map