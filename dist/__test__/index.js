"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Database_1 = require("../structures/Database");
const took_1 = __importDefault(require("./took"));
require("dotenv").config();
let client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
let db = new Database_1.Database({
    client,
    categoryID: "1263827193776177269",
}, ["main", "test"]);
client.on("ready", async () => {
    console.log("Bot Online!!");
    await (0, took_1.default)("Connection", () => db.connect(false));
    await (0, took_1.default)("Fetching", () => db.fetch());
    console.log(db.allMap());
});
client.login(process.env.token);
//# sourceMappingURL=index.js.map