# discord-channel.db
> ## Important Message Before Use
> - This package doesn't care about ratelimits of the discord api so use at your own risks 😁
> - This package can be **extremely** slow fetching values
> - This package do not have well readme page so sort the things sort your own 😉
> - Any Bugs or Improvement in the package? Message **[@leziuwu](https://www.discord.com/users/910837428862984213)** on discord.
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

const database = new Database(
  {
    client,
    categoryID: "1263827193776177269",
  },
  ["table1", "table2"]
)

client.on('ready', async () => {
  database.connect().then(
    () => console.log("Datebase Ready")
  ); 
})
```

## Database Options.
| Property | Type | Description | Required |
| :---: | :---: | :---: | :---: |
| client | `import("discord.js").Client<boolean>` | The client to use for database | `true` |
| categoryID | `string` | Category ID for the forum channels to be created | `true` |


## Usage
```ts
// expecting you initialize the database as "database"
database.set("key1", "some value")
database.set("key2", "some value", "some table") // to spefic table

database.bulkSet(
  { name: "bulk1", value: "something" },
  { name: "bulk2", value: "something", table: "some table" }
)

database.get("key1")
database.get("key2", "some table")
```