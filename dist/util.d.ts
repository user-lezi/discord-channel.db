import { TextChannel, Message, Client } from "discord.js";
export declare function fetchAllMessages(channel: TextChannel): Promise<Message<boolean>[]>;
export declare function warn(message: string): void;
export declare function messageExists(client: Client, guildId: string, channelId: string, messageId: string): Promise<boolean>;
//# sourceMappingURL=util.d.ts.map