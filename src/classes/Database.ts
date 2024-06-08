import {
  Collection,
  Client,
  ChannelType,
  Guild,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { IKeyValue, KeyValue } from "./KeyValue";
import { warn, fetchAllMessages, messageExists } from "../util";

export interface IDatabaseOptions {
  guilds: string[];
  deleteNonDBChannels?: boolean;
  size?: number;
  cacheEvery?: number;
}

export class Database {
  public static readonly ChannelNameRegex = /^db$/;
  #guilds: Guild[] = [];
  #client: Client;
  #cache = new Collection<string, KeyValue>();
  public options: Required<IDatabaseOptions> = {} as Required<IDatabaseOptions>;
  public isConnected: boolean = false;
  constructor(client: Client, options: IDatabaseOptions) {
    if (!client || !(client instanceof Client)) {
      throw new Error("client is not an instance of Client.");
    }
    if (!options || typeof options !== "object") {
      throw new Error("options is not an object.");
    }
    Reflect.set(client, "database", this);
    this.#client = client;
    this.#handleOptions(options);
  }

  #handleOptions(options: IDatabaseOptions) {
    if (!options || typeof options !== "object") {
      throw new Error("options is not an object.");
    }

    /* Handling [options#guilds] */
    if (!options.guilds || !Array.isArray(options.guilds)) {
      throw new Error("options.guilds is not an array.");
    }
    for (let guildId of options.guilds) {
      if (typeof guildId !== "string") {
        throw new Error("options.guilds is not an array of strings.");
      }
    }
    this.options.guilds = options.guilds;

    /* Handling [options#size] */
    if (typeof options.size !== "number") {
      this.options.size = 10;
    } else {
      let MIN_SIZE = 1;
      let MAX_SIZE = 25;
      if (options.size < MIN_SIZE || options.size > MAX_SIZE) {
        throw new Error(
          `options.size is not in range [${MIN_SIZE}, ${MAX_SIZE}].`,
        );
      }
      this.options.size = Math.trunc(options.size);
    }

    /* Handling [options#deleteNonDBChannels] */
    if (typeof options.deleteNonDBChannels !== "boolean") {
      this.options.deleteNonDBChannels = false;
    } else {
      this.options.deleteNonDBChannels = options.deleteNonDBChannels;
    }

    /* Handling [options#cacheEvery] */
    if (typeof options.cacheEvery !== "number") {
      this.options.cacheEvery = 30 * 1000;
    } else {
      let MIN_CACHE_EVERY = 10 * 1000;
      let MAX_CACHE_EVERY = 60 * 60 * 1000;
      if (
        options.cacheEvery < MIN_CACHE_EVERY ||
        options.cacheEvery > MAX_CACHE_EVERY
      ) {
        throw new Error(
          `options.cacheEvery is not in range [${MIN_CACHE_EVERY}, ${MAX_CACHE_EVERY}].`,
        );
      }
      this.options.cacheEvery = Math.trunc(options.cacheEvery);
    }
  }
  async #createChannels() {
    let guilds = this.guilds;
    for (let guild of guilds) {
      let dbChannels = guild.channels.cache.filter(
        (channel) =>
          channel.type == ChannelType.GuildText &&
          Database.ChannelNameRegex.test(channel.name),
      );
      if (dbChannels.size === this.options.size) {
        continue;
      }
      if (dbChannels.size < this.options.size) {
        let count = this.options.size - dbChannels.size;
        for (let i = 0; i < count; i++) {
          try {
            await guild.channels.create({
              name: `db`,
              type: ChannelType.GuildText,
              topic: "This channel is used for database.",
              reason: "This channel is used for database.",
            });
            console.log(`Created channel in guild "${guild.name}".`);
          } catch (error: any) {
            throw new Error(
              `Failed to create channel in guild "${guild.name}" with reason: ${error.message}`,
            );
          }
        }
      } else {
        throw new Error(
          `Guild "${guild.name}" has more than ${this.options.size} database channels.`,
        );
      }
    }
  }
  async #createCache() {
    this.#cache.clear();
    let channels = await this.channels();
    for (let channel of channels) {
      let messages = await fetchAllMessages(channel);
      for (let message of messages) {
        let key = message.content;
        let value = message.embeds.map((embed) => embed.description).join("");
        let type = message.embeds[message.embeds.length - 1]!.footer!.text;

        let keyValue = new KeyValue({
          key,
          value,
          message,
          type,
        });
        this.#cache.set(keyValue._id, keyValue);
      }
    }
    return true;
  }
  async #writeValue(data: Omit<IKeyValue, "message">) {
    let valueChunks = (
      "object" == data.type ? JSON.stringify(data.value) : data.value
    )
      .toString()
      .match(/[\s\S]{1,4000}/g);
    let maxChunks = 10;
    if (valueChunks.length > maxChunks) {
      warn(`Value of key "${data.key}" is too long.`);
      return;
    }

    let embeds: EmbedBuilder[] = [];
    for (let chunk of valueChunks) {
      embeds.push(new EmbedBuilder().setDescription(chunk));
    }
    embeds[embeds.length - 1].setFooter({ text: data.type });
    let messageData = {
      content: data.key,
      embeds,
    };
    let channel = await this.#getChannel();
    if (!channel) return;

    let message = await channel.send(messageData);
    return new KeyValue({
      key: data.key,
      value: data.value,
      message,
      type: data.type,
    });
  }
  async #editValue(kv: KeyValue, value: any) {
    let message = kv.message;
    let type = typeof value;

    let embeds: EmbedBuilder[] = [];
    let valueChunks = ("object" == type ? JSON.stringify(value) : value)
      .toString()
      .match(/[\s\S]{1,4000}/g);
    let maxChunks = 10;
    if (valueChunks.length > maxChunks) {
      warn(`Value of key "${kv.key}" is too long.`);
      return;
    }

    for (let chunk of valueChunks) {
      embeds.push(new EmbedBuilder().setDescription(chunk));
    }
    embeds[embeds.length - 1].setFooter({ text: type });

    message = await message.edit({
      content: kv.key,
      embeds,
    });
    return new KeyValue({
      key: kv.key,
      value,
      message,
      type,
    });
  }
  async #deleteValue(kv: KeyValue) {
    let message = kv.message;
    try {
      await message.delete();
      this.#cache.delete(kv._id);
      return true;
    } catch (error: any) {
      warn(
        `Failed to delete message with id "${message.id}" with reason: ${error.message}`,
      );
      return false;
    }
  }
  async #getChannel() {
    let channels = await this.channels();
    return channels[Math.floor(Math.random() * channels.length)];
  }

  get client() {
    return this.#client;
  }
  get guilds() {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }
    return this.#guilds as Guild[];
  }
  get cache() {
    return this.#cache;
  }
  get size() {
    return this.#cache.size;
  }

  async connect() {
    if (this.isConnected) {
      warn("Database is already connected.");
      return true;
    }
    if (!this.client.isReady()) {
      warn("Client is not ready.");
      return false;
    }
    for (let guildId of this.options.guilds) {
      try {
        let guild = await this.client.guilds.fetch(guildId);

        let channels = guild.channels.cache.filter(
          (channel) => channel.type === ChannelType.GuildText,
        );
        let nonDBChannels = channels.filter(
          (channel) => !Database.ChannelNameRegex.test(channel.name),
        );

        if (nonDBChannels.size > 0) {
          warn(
            `Guild "${guild.name}" has ${nonDBChannels.size} non-database channels.`,
          );
          if (this.options.deleteNonDBChannels) {
            for (let channel of nonDBChannels.values()) {
              try {
                await channel.delete();
                console.log(
                  `Deleted channel ${channel.name} from guild "${guild.name}".`,
                );
              } catch (error: any) {
                console.error(
                  `Failed to delete channel ${channel.name} from guild "${guild.name}" with reason: ${error.message}`,
                );
              }
            }
          }
        }

        this.#guilds.push(guild);
      } catch (err: any) {
        throw new Error(`Guild with id ${guildId} not found. [${err.message}]`);
      }
    }

    this.isConnected = true;
    await this.#createChannels();
    await this.#createCache();
    setInterval(async () => {
      await this.#createCache();
    }, this.options.cacheEvery);
    return true;
  }
  async channels(): Promise<TextChannel[]> {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }
    let channels: TextChannel[] = [];
    let guilds = this.guilds;
    for (let guild of guilds) {
      let guildChannels = guild.channels.cache.filter(
        (channel) =>
          channel.type === ChannelType.GuildText &&
          Database.ChannelNameRegex.test(channel.name),
      );
      channels.push(...(guildChannels.values() as unknown as TextChannel[]));
    }

    if (this.options.size * guilds.length == channels.length) {
      return channels;
    } else {
      await this.#createChannels();
      return await this.channels();
    }
  }

  /* DB functions */
  async wipe() {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }

    let channels = await this.channels();
    for (let channel of channels) {
      try {
        await channel.delete();
        console.log(
          `Deleted channel ${channel.name} from guild "${channel.guild.name}".`,
        );
      } catch (error: any) {
        console.error(
          `Failed to delete channel ${channel.name} from guild "${channel.guild.name}" with reason: ${error.message}`,
        );
      }
    }
    this.#cache.clear();
    this.#createChannels();
    return true;
  }
  async set(key: string, value: any) {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }
    if (typeof key !== "string") {
      throw new Error("key is not a string.");
    }

    let newdata: KeyValue | undefined;
    if (this.#cache.find((kv) => kv.key == key)) {
      let existing = this.#cache.find((kv) => kv.key == key)!._id;
      newdata = await this.#editValue(this.#cache.get(existing)!, value);
      if (newdata) this.#cache.set(existing, newdata);
    } else {
      newdata = await this.#writeValue({
        key,
        value,
        type: typeof value,
      });
      if (newdata) this.#cache.set(newdata._id, newdata);
    }

    return newdata ? newdata : null;
  }
  get(key: string) {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }
    if (typeof key !== "string") {
      throw new Error("key is not a string.");
    }

    let value = this.#cache.find((kv) => kv.key == key);
    if (value) return value.toJSON();
    else return null;
  }
  async all(type?: string) {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }
    if (type && typeof type !== "string") {
      throw new Error("type is not a string.");
    }

    let values = this.#cache.filter((kv) => !type || kv.type == type);
    if (values.size == 0) return [];
    else return values.map((kv) => kv.toJSON());
  }
  async delete(key: string) {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }
    if (typeof key !== "string") {
      throw new Error("key is not a string.");
    }

    let value = this.#cache.find((kv) => kv.key == key);
    if (value) {
      return await this.#deleteValue(value);
    } else return null;
  }

  async bulkSet(...data: [string, any][]) {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }

    if (data.length == 0) return null;
    if (!data.every((d) => Array.isArray(d) && d.length == 2)) {
      throw new Error("unwanted input.\n> " + JSON.stringify(data));
    }

    let newdata: (KeyValue | null)[] = [];
    for (let [key, value] of data) {
      let newKV = await this.set(key, value);
      newdata.push(newKV);
    }
    return newdata;
  }
  async bulkDelete(...keys: string[]) {
    if (!this.isConnected) {
      throw new Error(
        "Database is not connected. Use <Database>.connect() first.",
      );
    }

    if (keys.length == 0) return null;
    if (!keys.every((k) => typeof k == "string")) {
      throw new Error("unwanted input.\n> " + JSON.stringify(keys));
    }

    for (let key of keys) {
      await this.delete(key);
    }
    return this;
  }
  async find(
    query: string | RegExp | ((key: string, kv: KeyValue) => boolean),
    type?: string,
  ) {
    let values = await this.all(type);

    if (
      !(
        typeof query == "string" ||
        query instanceof RegExp ||
        typeof query == "function"
      )
    )
      throw new Error("invalid query type.\n> " + typeof query);

    if (values.length == 0) return [];
    else
      return values.filter((kv) =>
        typeof query == "string"
          ? kv.key == query
          : query instanceof RegExp
            ? query.test(kv.key)
            : query(kv.key, this.#cache.get(kv._id)!),
      );
  }
  async ping(showCachePing = false) {
    let channel = await this.#getChannel();
    let messageObj = "Ping Check!!";
    let total = performance.now();
    let start = performance.now();
    let message = await channel.send(messageObj);
    let writePing = performance.now() - start;
    start = performance.now();
    await message.edit(messageObj + `!`);
    let editPing = performance.now() - start;
    start = performance.now();
    await message.delete();
    let deletePing = performance.now() - start;
    let cachePing = -1;
    if (!!showCachePing) {
      start = performance.now();
      await this.#createCache();
      cachePing = performance.now() - start;
    }
    return {
      write: writePing,
      edit: editPing,
      delete: deletePing,
      cache: cachePing,
      total: performance.now() - total,
    };
  }
}
