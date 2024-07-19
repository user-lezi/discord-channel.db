import { Client, GatewayIntentBits } from 'discord.js';

let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let cat = "1263827193776177269";



client.on("ready", async () => {
  
});

client.login(process.env.token!);
