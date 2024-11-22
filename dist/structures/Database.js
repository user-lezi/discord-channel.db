"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const discord_js_1 = require("discord.js");
const Error_1 = require("./Error");
const DatabaseTable_1 = require("./DatabaseTable");
class Database {
    options;
    #isConnected = false;
    #category;
    #tables = new discord_js_1.Collection();
    constructor(options, tableNames) {
        const defaultTables = ["main"];
        this.options = {
            client: options.client,
            categoryID: options.categoryID,
            tables: [...new Set(tableNames ?? defaultTables)],
        };
    }
    get client() {
        return this.options.client;
    }
    get category() {
        (0, Error_1.ThrowConnectionError)(this);
        return this.#category;
    }
    get tables() {
        (0, Error_1.ThrowConnectionError)(this);
        return this.#tables;
    }
    get tableNames() {
        return this.options.tables;
    }
    isConnected() {
        return this.client.isReady() && this.#isConnected;
    }
    async connect(fetchValues = true) {
        if (this.#isConnected)
            return true;
        if (!this.client)
            Error_1.DatabaseError.InvalidType("client", "Client", this.client);
        if (!(this.client instanceof discord_js_1.Client))
            Error_1.DatabaseError.InvalidInstance("client", "Client", this.client);
        if (!this.client.isReady())
            Error_1.DatabaseError.ClientNotConnected();
        let categoryExists = this.client.channels.cache.has(this.options.categoryID);
        if (!categoryExists)
            throw new Error_1.DatabaseError(`Couldnt find category channel with ID ${this.options.categoryID}`);
        this.#category = (await this.client.channels.fetch(this.options.categoryID));
        for (let i = 0; i < this.tableNames.length; i++) {
            const tableName = this.tableNames[i];
            if (typeof tableName !== "string")
                Error_1.DatabaseError.InvalidType(`table[${i}]`, "string", tableName);
            let tableChnl = this.#category.children.cache.find((x) => x.name == tableName);
            if (!tableChnl) {
                console.log(`Creating channel for table [${tableName}]`);
                tableChnl = await this.#category.children.create({
                    name: tableName,
                    type: discord_js_1.ChannelType.GuildForum,
                });
            }
            let table = new DatabaseTable_1.DatabaseTable(tableName, tableChnl);
            this.#tables.set(tableName, table);
        }
        if (fetchValues)
            await this.fetch();
        return (this.#isConnected = true);
    }
    fetch() {
        return Promise.all(this.#tables.map((table) => table.fetchAll()));
    }
    get size() {
        return this.#tables.reduce((total, table) => total + table.size, 0);
    }
    get sizeMap() {
        return this.#tables.mapValues((table) => table.size);
    }
    wipe() {
        return Promise.all(this.#tables.map((table) => table.channel.delete())).then(() => ((this.#isConnected = false), this.connect()));
    }
    #set(identifier, value, table) {
        if (typeof identifier !== "string")
            Error_1.DatabaseError.InvalidType(`identifier`, "string", identifier);
        return table.write(identifier, value);
    }
    set(identifier, value, tableName = this.tableNames[0]) {
        (0, Error_1.ThrowConnectionError)(this);
        let table = this.#tables.get(tableName);
        if (!table)
            Error_1.DatabaseError.InvalidTable(tableName);
        return this.#set(identifier, value, table);
    }
    bulkSet(...args) {
        return Promise.all(args.map((arg) => this.set(arg.name, arg.value, arg.table)));
    }
    get(identifier, tableName = this.tableNames[0]) {
        (0, Error_1.ThrowConnectionError)(this);
        let table = this.#tables.get(tableName);
        if (!table)
            return Error_1.DatabaseError.InvalidTable(tableName);
        return table.get(identifier);
    }
    delete(identifier, tableName = this.tableNames[0]) {
        (0, Error_1.ThrowConnectionError)(this);
        let table = this.#tables.get(tableName);
        if (!table)
            Error_1.DatabaseError.InvalidTable(tableName);
        return table.delete(identifier);
    }
    bulkDelete(...args) {
        return Promise.all(args.map((arg) => this.delete(arg.name, arg.table)));
    }
    allFromTable(tableName) {
        (0, Error_1.ThrowConnectionError)(this);
        let table = this.#tables.get(tableName);
        if (!table)
            Error_1.DatabaseError.InvalidTable(tableName);
        return table.all();
    }
    all() {
        return this.#tables.mapValues((table) => table.all());
    }
    allFromTableMap(tableName) {
        (0, Error_1.ThrowConnectionError)(this);
        let table = this.#tables.get(tableName);
        if (!table)
            Error_1.DatabaseError.InvalidTable(tableName);
        return table.allMap();
    }
    allMap() {
        return this.#tables.mapValues((table) => table.allMap());
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map