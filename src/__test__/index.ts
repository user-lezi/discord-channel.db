import { Client, GatewayIntentBits } from "discord.js";
require("dotenv").config();

let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", async () => {
  console.log("Bot Online!!");
});

client.login(process.env.token!);
