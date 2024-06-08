"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("..");
let client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
let database = new __1.Database(client, {
    guilds: ["1248534099757498419"],
    size: 2,
    cacheEvery: 10000,
});
client.on("ready", async () => {
    await database.connect();
    setTimeout(async () => {
        console.log(database.size);
        console.log(await database.ping(false));
    }, 12 * 1000);
});
client.login(process.env.token);
//# sourceMappingURL=index.js.map