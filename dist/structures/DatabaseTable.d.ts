import { Collection, ForumChannel, ThreadChannel } from "discord.js";
export interface IValue<V = any> {
    value: V;
    identifier: string;
    type: string;
}
export declare class DatabaseTable {
    #private;
    name: string;
    constructor(name: string, channel: ForumChannel);
    get channel(): ForumChannel;
    get cache(): Collection<string, IValue<any>>;
    get size(): number;
    fetchAll(): Promise<void>;
    write(identifier: string, value: any): Promise<Collection<string, IValue<any>>>;
    get<T = unknown>(identifier: string): {
        thread: ThreadChannel<boolean>;
        value: T;
        identifier: string;
        type: string;
    } | null;
    delete(identifier: string): Promise<boolean>;
    all<T = unknown>(): {
        thread: ThreadChannel<boolean>;
        value: T;
        identifier: string;
        type: string;
    }[];
    allMap<T = unknown>(): Collection<string, {
        thread: ThreadChannel<boolean>;
        value: T;
        identifier: string;
        type: string;
    }>;
    toJSON(): Record<string, {
        value: any;
        type: string;
        threadId: string;
    }>;
}
//# sourceMappingURL=DatabaseTable.d.ts.map