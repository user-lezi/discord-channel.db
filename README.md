# discord-channel.db
> ## Important Message Before Use
> - This package doesn't care about ratelimits of the discord api so use at your own risks 😁
> - This package can be **extremely** slow fetching values
> - Also since the values are stored in embeds, there exists "character limits" which would be **4000 * 10 = 40,000** (4000 = max characters per embed & 10 = max number of embeds per message)
> - This package do not have well readme page so sort the things sort your own 😉
> - Any Bugs or Improvement in the package? Message **[leziuwu](https://www.discord.com/users/910837428862984213)** on discord.

## Installation
Download the package from npm,
```shell
$ npm i discord-channel.db
```
After installing your can import the database using,
```ts
import { Database } from "discord-channel.db";
//or
const { Database } = require("discord-channel.db");
```

## Initialising Database
```ts
const client = new Client({
  ... // your client options
});

/* Default Database Options Shown */
const database = new Database(client, {
  guilds: ["1234"],
  deleteNonDBChannels: false,
  size: 10,
  cacheEvery: 30_000
});

client.on('ready', async () => {
  await database.connect(); 
})
```

## Database Options.
| Property | Type | Description | Required |
| :---: | :---: | :---: | :---: |
| guilds | `string[]` | Array of guilds which should be considered as database guilds | `true` |
| deleteNonDBChannels | `boolean?` | Permission for database to delete all the non db channels from the guild *(dangerous)* | `false` (default = `false`) |
| size | `number?` | Number of database channels per guild (range: 1 to 25) | `false` (default = `10`) |
| cacheEvery | `number?` | Interval to create cache every *"x"* milliseconds (range: 10s to 1hr) | `false` (default = `30,000`) |

## Database Properties
- `database.options`: [`Required<IDatabaseOptions>`]
  - Returns the database options.
```ts
console.log(database.options); // {...}
```
- `database.isConnected`: [`boolean`]
  - Returns `true` if database has been connected.
```ts
console.log(database.isConnected); // true or false
```

- `database.client`: [`Client`]
  - The client which initialise the database
```ts
console.log(database.client); // Client {...}
```

- `database.guilds`: [`Guild[]`]
  - Array of database guilds
```ts
console.log(database.guilds); // [Guild, Guild, ...]
```

- `database.cache`: [`Collection<string, KeyValue>`]
  - Collection of keys and its values.
```ts
console.log(database.cache); // Collection {...}
```

- `database.size`: [`number`]
  - Same as `database.cache.size`
```ts
console.log(database.size); // some Integer 
```

## Database Methods
- `database.connect`
```ts
/**
 * Connects the database
 */
database.connect(): Promise<boolean>;
```

- `database.channels`
```ts
/**
 * List of database channels
 */
database.channels(): Promise<TextChannel[]>;
```

## Database Functions

- `database.wipe`
```ts
/**
 * Wipes the database.
 */
database.wipe(): Promise<boolean>;
```

- `database.set`
```ts
/**
 * Sets a value to the database
 * @param key {string} Key to store the value as.
 * @param value {any} Value to store.
 */
database.set(key: string, value: any): Promise<KeyValue | null>;

/* Example */
await database.set("key", "some value");
```

- `database.get`
```ts
/**
 * Gets an value from database
 * @param key {string} Key to get the value of
 */
database.get(key: string): {
  key: string;
  value: any;
  type: string;
  createdTimestamp: number;
  editedTimestamp: number;
  _id: string;
} | null;

/* Example */
database.get("key");
```

- `database.all`
```ts
/**
 * Returns all values from database
 * @param type {string?} Type of value to return
 */
database.all(type?: string): Promise<{
  key: string;
  value: any;
  type: string;
  createdTimestamp: number;
  editedTimestamp: number;
  _id: string;
}[]>;

/* Example */
await database.all(); //or
await database.all("string");
```

- `database.delete`
```ts
/**
 * Deletes a value from database
 * @param key {string} Key to delete
 */
database.delete(key: string): Promise<boolean | null>;

/* Example */
await database.delete("key");
```

- `database.bulkSet`
```ts
/**
 * Sets multiple values at one call.
 * @param ...data {[string, any][]} Key and value
 */
database.bulkSet(...data: [string, any][]): Promise<(KeyValue | null)[] | null>;

/* Example */
await database.bulkSet(
  ["key1", "value1"], 
  ["key2", "value2"]
);
```

- `database.bulkDelete`
```ts
/**
 * Deletes multiple values at one call.
 * @param ...keys {string[]} Keys to delete
 */
database.bulkDelete(...keys: string[]): Promise<this | null>;

/* Example */
await database.bulkDelete("key1", "key2");
```

- `database.find`
```ts
/**
 * Finds the query in the database
 * @param query {string | RegExp | ((key: string, kv: KeyValue) => boolean)} Query to search
 * @param type {string?} Type to search
 */
database.find(query: string | RegExp | ((key: string, kv: KeyValue) => boolean), type?: string): Promise<{
  key: string;
  value: any;
  type: string;
  createdTimestamp: number;
  editedTimestamp: number;
  _id: string;
}[]>;

/* Example */
await database.find("some key") //or
await database.find(/some [Kk]ey/) //or
await database.find((key: string) => 
  key.includes("some key")
);
```

- `database.ping`
```ts
/**
 * Gets ping
 * @param showCachePing {boolean?} Also returns the time took to cache (if true then it forces cache)
 */
database.ping(showCachePing?: boolean): Promise<{
  write: number;
  edit: number;
  delete: number;
  cache: number;
  total: number;
}>;