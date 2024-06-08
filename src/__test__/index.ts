import { Client, GatewayIntentBits } from "discord.js";
import { Database } from "..";

let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let database = new Database(client, {
  guilds: ["1248534099757498419"],
  size: 2,
  cacheEvery: 10000,
});

client.on("ready", async () => {
  await database.connect();

  //console.log(await database.wipe());
  //console.log(await database.set("test", "test value [edited]"));
  //console.log(await database.set("object test", { a: 10 }))
  //console.log(await database.delete("object test"))
  //console.log(await database.bulkSet(["bulk test1", Math.random()], ["bulk test2", ["array", "value", "test"]]))
  //console.log(await database.bulkDelete("bulk test1", "bulk test2"))

  setTimeout(async () => {
    console.log(database.size);
    console.log(await database.ping(false));
  }, 12 * 1000);
});

client.login(process.env.token!);
