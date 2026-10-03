import "server-only";
import type {
  BetterAuthOptions,
  DBAdapter,
  DBAdapterInstance,
  DBTransactionAdapter,
  Where,
} from "better-auth";
import {
  decryptEmail,
  decryptText,
  emailBlindIndex,
  encryptEmail,
  encryptText,
} from "@/shared/crypto";

/*
 * Wraps a better-auth database adapter so email addresses are never written
 * to the database in plaintext:
 *
 * - user.email           -> HMAC blind index (lookups, unique constraint)
 * - user.emailEncrypted  -> AES-256-GCM ciphertext (to actually send mail)
 * - verification.value   -> AES-256-GCM ciphertext (magic-link tokens embed the email)
 *
 * better-auth itself keeps seeing plaintext: where-clauses on `email` are
 * rewritten to the blind index and rows are decrypted on the way out.
 */

type Row = Record<string, unknown>;

const USER = "user";
const VERIFICATION = "verification";

const encodeUserData = (data: Row): Row => {
  if (typeof data.email !== "string") return data;
  return {
    ...data,
    email: emailBlindIndex(data.email),
    emailEncrypted: encryptEmail(data.email),
  };
};

const encodeVerificationData = (data: Row): Row =>
  typeof data.value === "string"
    ? { ...data, value: encryptText(data.value) }
    : data;

const encodeData = (model: string, data: Row): Row => {
  if (model === USER) return encodeUserData(data);
  if (model === VERIFICATION) return encodeVerificationData(data);
  return data;
};

const blindIndexValue = (value: Where["value"]): Where["value"] => {
  if (typeof value === "string") return emailBlindIndex(value);
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "string" ? emailBlindIndex(item) : item,
    ) as Where["value"];
  }
  return value;
};

const encodeWhere = (model: string, where: Where[] | undefined) => {
  if (model !== USER || !where) return where;
  return where.map((clause) =>
    clause.field === "email"
      ? { ...clause, value: blindIndexValue(clause.value), mode: "sensitive" as const }
      : clause,
  );
};

const encodeSelect = (model: string, select: string[] | undefined) => {
  if (model !== USER || !select?.includes("email")) return select;
  return select.includes("emailEncrypted") ? select : [...select, "emailEncrypted"];
};

const safeDecrypt = (value: string, decrypt: (payload: string) => string) => {
  try {
    return decrypt(value);
  } catch {
    // Rows written before encryption was enabled pass through unchanged.
    return value;
  }
};

const decodeOwnFields = (model: string, record: Row): Row => {
  if (model === USER) {
    const { emailEncrypted, ...rest } = record;
    if (typeof emailEncrypted !== "string") return rest;
    return { ...rest, email: safeDecrypt(emailEncrypted, decryptEmail) };
  }
  if (model === VERIFICATION && typeof record.value === "string") {
    return { ...record, value: safeDecrypt(record.value, decryptText) };
  }
  return record;
};

// Also decodes joined users, e.g. `findOne({ model: "session", join: { user: true } })`.
const decodeRow = <T>(model: string, row: T): T => {
  if (!row || typeof row !== "object") return row;
  const decoded = decodeOwnFields(model, row as Row);
  const joined = decoded[USER];
  if (model !== USER && joined && typeof joined === "object") {
    decoded[USER] = Array.isArray(joined)
      ? joined.map((item: Row) => decodeOwnFields(USER, item))
      : decodeOwnFields(USER, joined as Row);
  }
  return decoded as T;
};

const wrapOperations = (
  adapter: DBTransactionAdapter,
): DBTransactionAdapter => ({
  ...adapter,
  create: async <T extends Record<string, unknown>, R = T>(input: {
    model: string;
    data: Omit<T, "id">;
    select?: string[] | undefined;
    forceAllowId?: boolean | undefined;
  }) => {
    const created = await adapter.create<T, R>({
      ...input,
      data: encodeData(input.model, input.data) as Omit<T, "id">,
      select: encodeSelect(input.model, input.select),
    });
    return decodeRow(input.model, created);
  },
  findOne: async <T>(input: Parameters<DBTransactionAdapter["findOne"]>[0]) => {
    const found = await adapter.findOne<T>({
      ...input,
      where: encodeWhere(input.model, input.where) ?? [],
      select: encodeSelect(input.model, input.select),
    });
    return decodeRow(input.model, found);
  },
  findMany: async <T>(input: Parameters<DBTransactionAdapter["findMany"]>[0]) => {
    const rows = await adapter.findMany<T>({
      ...input,
      where: encodeWhere(input.model, input.where),
      select: encodeSelect(input.model, input.select),
    });
    return rows.map((row) => decodeRow(input.model, row));
  },
  count: (input) =>
    adapter.count({ ...input, where: encodeWhere(input.model, input.where) }),
  update: async <T>(input: Parameters<DBTransactionAdapter["update"]>[0]) => {
    const updated = await adapter.update<T>({
      ...input,
      where: encodeWhere(input.model, input.where) ?? [],
      update: encodeData(input.model, input.update),
    });
    return decodeRow(input.model, updated);
  },
  updateMany: (input) =>
    adapter.updateMany({
      ...input,
      where: encodeWhere(input.model, input.where) ?? [],
      update: encodeData(input.model, input.update),
    }),
  delete: (input) =>
    adapter.delete({ ...input, where: encodeWhere(input.model, input.where) ?? [] }),
  deleteMany: (input) =>
    adapter.deleteMany({
      ...input,
      where: encodeWhere(input.model, input.where) ?? [],
    }),
  consumeOne: async <T>(input: Parameters<DBTransactionAdapter["consumeOne"]>[0]) => {
    const consumed = await adapter.consumeOne<T>({
      ...input,
      where: encodeWhere(input.model, input.where) ?? [],
    });
    return decodeRow(input.model, consumed);
  },
  incrementOne: async <T>(
    input: Parameters<DBTransactionAdapter["incrementOne"]>[0],
  ) => {
    const incremented = await adapter.incrementOne<T>({
      ...input,
      where: encodeWhere(input.model, input.where) ?? [],
      set: input.set ? encodeData(input.model, input.set) : undefined,
    });
    return decodeRow(input.model, incremented);
  },
});

export const withEncryptedEmails =
  (inner: DBAdapterInstance): DBAdapterInstance =>
  (options: BetterAuthOptions): DBAdapter => {
    const adapter = inner(options);
    return {
      ...adapter,
      ...wrapOperations(adapter),
      transaction: (callback) =>
        adapter.transaction((trx) => callback(wrapOperations(trx))),
    };
  };
