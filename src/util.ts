import { TextChannel, Message, Client, ChannelType } from "discord.js";

export async function fetchAllMessages(channel: TextChannel) {
  let messages: Message[] = [];
  let message = await channel.messages
    .fetch({ limit: 1 })
    .then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));
  if (message) messages.push(message);
  while (message !== null) {
    await channel.messages
      .fetch({ limit: 100, before: message!.id })
      .then((messagePage) => {
        messagePage.forEach((msg) => messages.push(msg));
        message =
          0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
      });
  }
  return messages;
}

export function warn(message: string) {
  let colorCode = "\x1b[93m";
  let normal = "\x1b[0m";
  console.warn(colorCode + "[WARNING] " + message + normal);
}

export async function messageExists(
  client: Client,
  guildId: string,
  channelId: string,
  messageId: string,
) {
  try {
    let guild = client.guilds.cache.get(guildId);
    if (!guild) return false;
    let channel = guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return false;
    let message = await (channel as unknown as TextChannel).messages.fetch(
      messageId,
    );
    if (!message) return false;
    return true;
  } catch (e) {
    return false;
  }
}
