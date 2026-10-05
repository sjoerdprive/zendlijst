import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// The whole schema lives in `shared` because tables reference each other across
// entities; keeping it here avoids entity-to-entity imports.

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ---------------------------------------------------------------------------
 * better-auth tables
 *
 * `user.email` never holds a plaintext address: the auth adapter wrapper in
 * `shared/auth/encryptedAdapter.ts` stores the HMAC blind index there (for
 * lookups + uniqueness) and the AES-GCM ciphertext in `email_encrypted`.
 * ------------------------------------------------------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailEncrypted: text("email_encrypted"),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    // Encrypted by the adapter wrapper (magic-link values contain the email).
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/* ---------------------------------------------------------------------------
 * Platform tables
 * ------------------------------------------------------------------------- */

export const organisationRequestStatus = pgEnum("organisation_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const organisationRequest = pgTable("organisation_request", {
  id: id(),
  organisationName: text("organisation_name").notNull(),
  slug: text("slug").notNull(),
  adminEmailEncrypted: text("admin_email_encrypted").notNull(),
  message: text("message"),
  status: organisationRequestStatus("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: createdAt(),
});

// open: anyone can subscribe · approval: an admin approves each request ·
// closed: only admins add subscribers.
export const subscriptionMode = pgEnum("subscription_mode", ["open", "approval", "closed"]);

export const organisation = pgTable("organisation", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  subscriptionMode: subscriptionMode("subscription_mode").notNull().default("open"),
  createdAt: createdAt(),
});

export const memberRole = pgEnum("member_role", ["admin", "writer", "subscriber"]);

export const membership = pgTable(
  "membership",
  {
    id: id(),
    organisationId: text("organisation_id")
      .notNull()
      .references(() => organisation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRole("role").notNull().default("subscriber"),
    // Opt-in: receive each newsletter by email when it is published.
    emailNotifications: boolean("email_notifications").notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("membership_org_user_idx").on(table.organisationId, table.userId),
    index("membership_org_role_idx").on(table.organisationId, table.role),
  ],
);

// Pending subscriptions for organisations in "approval" mode. Kept apart from
// memberships so a pending person never gains access to the archive.
export const subscriptionRequest = pgTable(
  "subscription_request",
  {
    id: id(),
    organisationId: text("organisation_id")
      .notNull()
      .references(() => organisation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    emailNotifications: boolean("email_notifications").notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("subscription_request_org_user_idx").on(table.organisationId, table.userId)],
);

export const newsletterStatus = pgEnum("newsletter_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
]);

// editor: written in the team's rich-text editor (`body` is the source, `content`
// the rendered email HTML) · upload: an uploaded HTML or PDF file.
export const newsletterSource = pgEnum("newsletter_source", ["editor", "upload"]);

export const newsletter = pgTable(
  "newsletter",
  {
    id: id(),
    organisationId: text("organisation_id")
      .notNull()
      .references(() => organisation.id, { onDelete: "cascade" }),
    // Drafts may be empty: title, file and content are only required to schedule.
    title: text("title").notNull().default(""),
    summary: text("summary"),
    status: newsletterStatus("status").notNull().default("draft"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    source: newsletterSource("source"),
    body: jsonb("body"),
    fileName: text("file_name"),
    contentType: text("content_type"),
    content: bytea("content"),
    // Bumped on every save; autosave refuses to overwrite a newer version.
    version: integer("version").notNull().default(0),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    failureNotifiedAt: timestamp("failure_notified_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("newsletter_org_status_idx").on(table.organisationId, table.status),
    index("newsletter_due_idx").on(table.status, table.scheduledAt),
  ],
);

// First time a member opened an issue in the archive. One row per member and
// issue; only totals are shown. Removed with the membership (unsubscribe).
export const newsletterRead = pgTable(
  "newsletter_read",
  {
    id: id(),
    newsletterId: text("newsletter_id")
      .notNull()
      .references(() => newsletter.id, { onDelete: "cascade" }),
    membershipId: text("membership_id")
      .notNull()
      .references(() => membership.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("newsletter_read_newsletter_membership_idx").on(table.newsletterId, table.membershipId)],
);

export const deliveryStatus = pgEnum("delivery_status", [
  "pending",
  "sent",
  "failed",
]);

export const delivery = pgTable(
  "delivery",
  {
    id: id(),
    newsletterId: text("newsletter_id")
      .notNull()
      .references(() => newsletter.id, { onDelete: "cascade" }),
    membershipId: text("membership_id").references(() => membership.id, {
      onDelete: "set null",
    }),
    // Snapshot of the recipient so a failed delivery stays actionable even if
    // the subscriber later unsubscribes. Encrypted like every other address.
    recipientEmailEncrypted: text("recipient_email_encrypted").notNull(),
    status: deliveryStatus("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Lease so concurrent dispatcher runs never send the same email twice.
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedById: text("resolved_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("delivery_newsletter_membership_idx").on(
      table.newsletterId,
      table.membershipId,
    ),
    index("delivery_pending_idx").on(table.status, table.nextAttemptAt),
  ],
);

export const note = pgTable(
  "note",
  {
    id: id(),
    organisationId: text("organisation_id")
      .notNull()
      .references(() => organisation.id, { onDelete: "cascade" }),
    newsletterId: text("newsletter_id").references(() => newsletter.id, {
      onDelete: "set null",
    }),
    authorId: text("author_id").references(() => user.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    done: boolean("done").notNull().default(false),
    // Waits for the next draft that gets created (nothing was scheduled).
    forNextDraft: boolean("for_next_draft").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    index("note_org_idx").on(table.organisationId),
    index("note_newsletter_idx").on(table.newsletterId),
  ],
);
