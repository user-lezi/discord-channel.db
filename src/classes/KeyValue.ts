import { TextChannel, Message, Guild } from "discord.js";

export interface IKeyValue {
  key: string;
  value: any;
  message: Message;
  type: string;
}

export class KeyValue {
  public data: IKeyValue;
  constructor(data: Omit<IKeyValue, "type"> & { type?: IKeyValue["type"] }) {
    this.data = {
      ...data,
      type: data.type ?? typeof data.value,
    };
  }

  get guild() {
    return this.data.message.guild as Guild;
  }

  get channel() {
    return this.data.message.channel as TextChannel;
  }

  get message() {
    return this.data.message;
  }

  get key() {
    return this.data.key;
  }

  get value() {
    if (typeof this.data.value === this.type) return this.data.value;
    let type = this.type;
    if (type === "string") {
      return this.data.value.toString();
    } else if (type === "number") {
      return Number(this.data.value);
    } else if (type === "boolean") {
      return Boolean(this.data.value);
    } else if (type === "object") {
      return JSON.parse(this.data.value);
    } else {
      return this.data.value.toString();
    }
  }

  get type() {
    return this.data.type;
  }

  get editedTimestamp() {
    return (
      this.data.message.editedTimestamp ?? this.data.message.createdTimestamp
    );
  }

  get createdTimestamp() {
    return this.data.message.createdTimestamp;
  }

  get _id() {
    return [this.message.id, this.channel.id, this.guild.id]
      .map((id) => Number(id).toString(36))
      .join("-");
  }

  toJSON() {
    return {
      key: this.key,
      value: this.value,
      type: this.type,
      createdTimestamp: this.createdTimestamp,
      editedTimestamp: this.editedTimestamp,
      _id: this._id,
    };
  }

  static decodeId(_id: string) {
    let id = _id.split("-").map((id) => parseInt(id, 36) + "");
    return {
      messageId: id[0],
      channelId: id[1],
      guildId: id[2],
    };
  }
}
