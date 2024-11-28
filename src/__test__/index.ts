import { Client, GatewayIntentBits } from "discord.js";
import { Database } from "../structures/Database";
import took from "./took";
require("dotenv").config();

let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let db = new Database(
  {
    client,
    categoryID: "1263827193776177269",
  },
  ["main", "test"],
);

client.on("ready", async () => {
  console.log("Bot Online!!");
  await took("Connection", () => db.connect(false));
  await took("Fetching", () => db.fetch());
  // await took("delete()", () => db.delete("fuhuj"));
  // await took("set()", () => db.set("fuhuj", BigInt(763615617612787)));
  // await took("bulkSet()", () =>
  //   db.bulkSet(
  //     { name: "smh", value: Math.random() * 100 },
  //     {
  //       name: "builkncnjcjccnas,x",
  //       value: db.client.emojis.cache.map((x) => x.toJSON()),
  //       table: "test",
  //     },
  //   ),
  // );
  // await took("bulkDelete()", () =>
  //   db.bulkDelete({ name: "smh" }, { name: "f" }),
  // );
  //await took("Wipe", () => db.wipe());
  console.log(db.toJSON());
  //console.log(db.size, db.sizeMap);
});

client.login(process.env.token!);
