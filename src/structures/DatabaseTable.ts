import {
  Collection,
  ForumChannel,
  ForumThreadChannel,
  ThreadChannel,
} from "discord.js";
import { decodeValue, encodeValue, stringChunks } from "../util";
import { threadId } from "worker_threads";

export interface IValue<V = any> {
  value: V;
  identifier: string;
  type: string;
}
export class DatabaseTable {
  #channel: ForumChannel;
  #cache = new Collection<string, IValue>();
  #threads = new Collection<string, ThreadChannel>();
  public constructor(
    public name: string,
    channel: ForumChannel,
  ) {
    this.#channel = channel;
  }
  public get channel() {
    return this.#channel;
  }
  public get cache() {
    return this.#cache;
  }
  public get size() {
    return this.#cache.size;
  }

  #deleteThread(identifier: string) {
    return this.#threads
      .get(identifier)
      ?.delete()
      .then(() => this.#threads.delete(identifier));
  }
  #newThread(identifier: string) {
    return this.#channel.threads
      .create({
        name: identifier,
        message: { content: identifier },
      })
      .then((x) => (this.#threads.set(identifier, x), x));
  }

  async #write(identifier: string, value: any) {
    let strValue = encodeValue(value);
    let chunks = stringChunks(strValue);
    if (this.#cache.has(identifier)) await this.#deleteThread(identifier);
    let thread = await this.#newThread(identifier);
    await Promise.all(chunks.map((x) => thread.send(x)));
    return this;
  }

  async #fetchValueFromThread(thread: ForumThreadChannel) {
    let strValueArr: string[] = [];
    let toIgnore = await thread.fetchStarterMessage({ cache: true });
    let messages = thread.messages.fetch();
    (await messages).forEach((message) => {
      if (message.id !== toIgnore?.id) {
        strValueArr.unshift(message.content);
      }
    });
    let strValue = strValueArr.join("");
    return decodeValue(strValue);
  }
  public fetchAll() {
    let threads = this.#channel.threads.cache;
    return Promise.all(
      threads.map(async (thread) => {
        let value = await this.#fetchValueFromThread(thread);
        this.#cache.set(thread.name, {
          value,
          identifier: thread.name,
          type: typeof value,
        });
        this.#threads.set(thread.name, thread);
      }),
    );
  }

  public async write(identifier: string, value: any) {
    await this.#write(identifier, value);
    return this.#cache.set(identifier, {
      value,
      identifier,
      type: typeof value,
    });
  }

  public get<T = unknown>(identifier: string) {
    return this.#cache.has(identifier) && this.#threads.get(identifier)
      ? {
          ...(this.#cache.get(identifier) as IValue<T>),
          thread: this.#threads.get(identifier)!,
        }
      : null;
  }

  public async delete(identifier: string) {
    if (!this.#cache.has(identifier)) return true;
    return (
      this.#cache.delete(identifier) && (await this.#deleteThread(identifier)!)
    );
  }

  public all<T = unknown>() {
    return this.#cache.map((v) => this.get<T>(v.identifier));
  }
  public allMap<T = unknown>() {
    return this.#cache.mapValues((v) => this.get<T>(v.identifier));
  }

  public toJSON() {
    let json = {} as Record<
      string,
      {
        value: any;
        type: string;
        threadId: string;
      }
    >;
    this.#cache.forEach((element) => {
      json[element.identifier] = {
        value:
          typeof element.value == "bigint"
            ? element.value.toString()
            : element.value,
        type: element.type,
        threadId: this.#threads.get(element.identifier)!.id,
      };
    });
    return json;
  }
}
