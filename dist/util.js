"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageExists = exports.warn = exports.fetchAllMessages = void 0;
const discord_js_1 = require("discord.js");
async function fetchAllMessages(channel) {
    let messages = [];
    let message = await channel.messages
        .fetch({ limit: 1 })
        .then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));
    if (message)
        messages.push(message);
    while (message !== null) {
        await channel.messages
            .fetch({ limit: 100, before: message.id })
            .then((messagePage) => {
            messagePage.forEach((msg) => messages.push(msg));
            message =
                0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });
    }
    return messages;
}
exports.fetchAllMessages = fetchAllMessages;
function warn(message) {
    let colorCode = "\x1b[93m";
    let normal = "\x1b[0m";
    console.warn(colorCode + "[WARNING] " + message + normal);
}
exports.warn = warn;
async function messageExists(client, guildId, channelId, messageId) {
    try {
        let guild = client.guilds.cache.get(guildId);
        if (!guild)
            return false;
        let channel = guild.channels.cache.get(channelId);
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
            return false;
        let message = await channel.messages.fetch(messageId);
        if (!message)
            return false;
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.messageExists = messageExists;
//# sourceMappingURL=util.js.map