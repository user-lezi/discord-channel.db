import { TextChannel, Message, Guild } from "discord.js";
export interface IKeyValue {
    key: string;
    value: any;
    message: Message;
    type: string;
}
export declare class KeyValue {
    data: IKeyValue;
    constructor(data: Omit<IKeyValue, "type"> & {
        type?: IKeyValue["type"];
    });
    get guild(): Guild;
    get channel(): TextChannel;
    get message(): Message<boolean>;
    get key(): string;
    get value(): any;
    get type(): string;
    get editedTimestamp(): number;
    get createdTimestamp(): number;
    get _id(): string;
    toJSON(): {
        key: string;
        value: any;
        type: string;
        createdTimestamp: number;
        editedTimestamp: number;
        _id: string;
    };
    static decodeId(_id: string): {
        messageId: string;
        channelId: string;
        guildId: string;
    };
}
//# sourceMappingURL=KeyValue.d.ts.map