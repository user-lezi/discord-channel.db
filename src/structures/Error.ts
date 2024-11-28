import { Database } from "./Database";

export class DatabaseError extends Error {
  public constructor(public message: string) {
    super();
  }

  public static NotConnected() {
    throw new this("The database is not connected");
  }
  public static ClientNotConnected() {
    throw new this("The client is not connected");
  }

  public static InvalidType(_for: string, expected: string, got: unknown) {
    throw new this(
      `Invalid Type for ${_for}. Expected (${expected}), got ${typeof got}.`,
    );
  }
  public static InvalidInstance(_for: string, expected: string, got: object) {
    throw new this(
      `Invalid Instance for ${_for}. Expected (${expected}), got ${got?.constructor?.name}.`,
    );
  }

  public static InvalidTable(value: string) {
    throw new this(`Invalid table "${value}"`);
  }
  public static InvalidTableName(value: string) {
    throw new this(`Invalid/Unallowed table name: "${value}"`);
  }
}

export function ThrowConnectionError(db: Database<string>) {
  return db.isConnected()
    ? void 0
    : db.client.isReady()
      ? DatabaseError.NotConnected()
      : DatabaseError.ClientNotConnected();
}
