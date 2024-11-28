import {
  CategoryChannel,
  ChannelType,
  Client,
  Collection,
  ForumChannel,
} from "discord.js";
import { DatabaseError, ThrowConnectionError } from "./Error";
import { DatabaseTable } from "./DatabaseTable";

export interface IDatabaseOptions {
  client: Client;
  categoryID: string;
}

export interface IBulkSetOptions<T> {
  name: string;
  value: unknown;
  table?: T;
}
export interface IBulkDeleteOptions<T> {
  name: string;
  table?: T;
}
const TableNameRegex = /^[a-z0-9]+$/;
export class Database<Tables extends string = "main"> {
  public options: IDatabaseOptions & { tables: Tables[] };
  #isConnected = false;
  #category!: CategoryChannel;
  #tables = new Collection<Tables, DatabaseTable>();
  public constructor(options: IDatabaseOptions, tableNames?: Tables[]) {
    const defaultTables = ["main"] as Tables[];
    this.options = {
      client: options.client,
      categoryID: options.categoryID,
      tables: [...new Set<Tables>(tableNames ?? defaultTables)],
    };
  }

  public get client() {
    return this.options.client;
  }
  public get category() {
    ThrowConnectionError(this);
    return this.#category;
  }
  public get tables() {
    ThrowConnectionError(this);
    return this.#tables;
  }
  public get tableNames() {
    return this.options.tables;
  }

  public isConnected() {
    return this.client.isReady() && this.#isConnected;
  }

  public async connect(fetchValues = true) {
    if (this.#isConnected) return true;
    if (!this.client)
      DatabaseError.InvalidType("client", "Client", this.client);
    if (!(this.client instanceof Client))
      DatabaseError.InvalidInstance("client", "Client", this.client);
    if (!this.client.isReady()) DatabaseError.ClientNotConnected();

    let categoryExists = this.client.channels.cache.has(
      this.options.categoryID,
    );
    if (!categoryExists)
      throw new DatabaseError(
        `Couldnt find category channel with ID ${this.options.categoryID}`,
      );

    this.#category = (await this.client.channels.fetch(
      this.options.categoryID,
    )) as CategoryChannel;

    for (let i = 0; i < this.tableNames.length; i++) {
      const tableName = this.tableNames[i];
      if (typeof tableName !== "string")
        DatabaseError.InvalidType(`table[${i}]`, "string", tableName);
      if (!TableNameRegex.test(tableName))
        DatabaseError.InvalidTableName(tableName);

      let tableChnl = this.#category.children.cache.find(
        (x) => x.name == tableName,
      ) as ForumChannel;
      if (!tableChnl) {
        console.log(`Creating channel for table [${tableName}]`);
        tableChnl = await this.#category.children.create({
          name: tableName,
          type: ChannelType.GuildForum,
        });
      }
      let table = new DatabaseTable(tableName, tableChnl);
      this.#tables.set(tableName, table);
    }
    if (fetchValues) await this.fetch();
    return (this.#isConnected = true);
  }

  public fetch() {
    return Promise.all(this.#tables.map((table) => table.fetchAll())).then(
      () => {},
    );
  }

  /* Database Functions */
  public get size() {
    return this.#tables.reduce((total, table) => total + table.size, 0);
  }
  public get sizeMap() {
    return this.#tables.mapValues((table) => table.size);
  }
  public wipe() {
    return Promise.all(
      this.#tables.map((table) => table.channel.delete()),
    ).then(() => ((this.#isConnected = false), this.connect()));
  }
  #set(identifier: string, value: any, table: DatabaseTable) {
    if (typeof identifier !== "string")
      DatabaseError.InvalidType(`identifier`, "string", identifier);
    return table.write(identifier, value);
  }
  public set(identifier: string, value: any, tableName = this.tableNames[0]) {
    ThrowConnectionError(this);
    let table = this.#tables.get(tableName);
    if (!table) DatabaseError.InvalidTable(tableName);
    return this.#set(identifier, value, table!);
  }
  public bulkSet(...args: IBulkSetOptions<Tables>[]) {
    return Promise.all(
      args.map((arg) => this.set(arg.name, arg.value, arg.table)),
    );
  }
  public get<T = unknown>(identifier: string, tableName = this.tableNames[0]) {
    ThrowConnectionError(this);
    let table = this.#tables.get(tableName);
    if (!table) return DatabaseError.InvalidTable(tableName);
    return table.get<T>(identifier);
  }
  public delete(identifier: string, tableName = this.tableNames[0]) {
    ThrowConnectionError(this);
    let table = this.#tables.get(tableName);
    if (!table) DatabaseError.InvalidTable(tableName);
    return table!.delete(identifier);
  }
  public bulkDelete(...args: IBulkDeleteOptions<Tables>[]) {
    return Promise.all(args.map((arg) => this.delete(arg.name, arg.table)));
  }

  public allFromTable<T = unknown>(tableName: Tables) {
    ThrowConnectionError(this);
    let table = this.#tables.get(tableName);
    if (!table) DatabaseError.InvalidTable(tableName);
    return table!.all<T>();
  }
  public all<T = unknown>() {
    return this.#tables.mapValues((table) => table.all<T>());
  }
  public allFromTableMap<T = unknown>(tableName: Tables) {
    ThrowConnectionError(this);
    let table = this.#tables.get(tableName);
    if (!table) DatabaseError.InvalidTable(tableName);
    return table!.allMap<T>();
  }
  public allMap<T = unknown>() {
    return this.#tables.mapValues((table) => table.allMap<T>());
  }

  public toJSON() {
    let json = {} as Record<Tables, ReturnType<DatabaseTable["toJSON"]>>;
    this.#tables.forEach(
      (table, tableName) => (json[tableName] = table.toJSON()),
    );
    return json;
  }
}
