"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseTable = void 0;
const discord_js_1 = require("discord.js");
const util_1 = require("../util");
class DatabaseTable {
    name;
    #channel;
    #cache = new discord_js_1.Collection();
    #threads = new discord_js_1.Collection();
    constructor(name, channel) {
        this.name = name;
        this.#channel = channel;
    }
    get channel() {
        return this.#channel;
    }
    get cache() {
        return this.#cache;
    }
    get size() {
        return this.#cache.size;
    }
    #deleteThread(identifier) {
        return this.#threads
            .get(identifier)
            ?.delete()
            .then(() => this.#threads.delete(identifier));
    }
    #newThread(identifier) {
        return this.#channel.threads
            .create({
            name: identifier,
            message: { content: identifier },
        })
            .then((x) => (this.#threads.set(identifier, x), x));
    }
    async #write(identifier, value) {
        let strValue = (0, util_1.encodeValue)(value);
        let chunks = (0, util_1.stringChunks)(strValue);
        if (this.#cache.has(identifier))
            await this.#deleteThread(identifier);
        let thread = await this.#newThread(identifier);
        await Promise.all(chunks.map((x) => thread.send(x)));
        return this;
    }
    async #fetchValueFromThread(thread) {
        let strValueArr = [];
        let toIgnore = await thread.fetchStarterMessage({ cache: true });
        let messages = thread.messages.fetch();
        (await messages).forEach((message) => {
            if (message.id !== toIgnore?.id) {
                strValueArr.unshift(message.content);
            }
        });
        let strValue = strValueArr.join("");
        return (0, util_1.decodeValue)(strValue);
    }
    fetchAll() {
        let threads = this.#channel.threads.cache;
        return Promise.all(threads.map(async (thread) => {
            let value = await this.#fetchValueFromThread(thread);
            this.#cache.set(thread.name, {
                value,
                identifier: thread.name,
                type: typeof value,
            });
            this.#threads.set(thread.name, thread);
        }));
    }
    async write(identifier, value) {
        await this.#write(identifier, value);
        return this.#cache.set(identifier, {
            value,
            identifier,
            type: typeof value,
        });
    }
    get(identifier) {
        return this.#cache.has(identifier) && this.#threads.get(identifier)
            ? {
                ...this.#cache.get(identifier),
                thread: this.#threads.get(identifier),
            }
            : null;
    }
    async delete(identifier) {
        if (!this.#cache.has(identifier))
            return true;
        return (this.#cache.delete(identifier) && (await this.#deleteThread(identifier)));
    }
    all() {
        return this.#cache.map((v) => this.get(v.identifier));
    }
    allMap() {
        return this.#cache.mapValues((v) => this.get(v.identifier));
    }
}
exports.DatabaseTable = DatabaseTable;
//# sourceMappingURL=DatabaseTable.js.map