import { pgTable, serial, text, timestamp, varchar, numeric, pgEnum, boolean, integer, index } from "drizzle-orm/pg-core";

export const serviceTypeEnum = pgEnum("service_type", ["cryptocurrency", "paypal", "skrill"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["buy", "sell"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["completed", "processing", "pending"]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);


export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: varchar("transaction_id", { length: 50 }).notNull().unique(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  cryptoSymbol: varchar("crypto_symbol", { length: 20 }),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  amountIdr: numeric("amount_idr", { precision: 15, scale: 2 }).notNull(),
  amountForeign: numeric("amount_foreign", { precision: 20, scale: 8 }),
  status: transactionStatusEnum("status").notNull().default("completed"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }),
  platform: varchar("platform", { length: 50 }).notNull(),
  photoUrl: text("photo_url"),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  status: varchar("status", { length: 20 }).notNull().default("approved"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    statusCreatedAtIdx: index("testimonials_status_created_at_idx").on(table.status, table.createdAt),
  };
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  photoUrl: text("photo_url"),
  saldo: numeric("saldo", { precision: 15, scale: 2 }).notNull().default("0"),
  role: userRoleEnum("role").notNull().default("user"),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  verificationTokenExpiresAt: timestamp("verification_token_expires_at"),
  googleId: varchar("google_id", { length: 255 }),
  nameChanged: boolean("name_changed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    verificationTokenIdx: index("users_verification_token_idx").on(table.verificationToken),
    googleIdIdx: index("users_google_id_idx").on(table.googleId),
  };
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  };
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    tokenIdx: index("password_reset_tokens_token_idx").on(table.token),
  };
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "completed", "cancelled", "expired"]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 50 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  cryptoSymbol: varchar("crypto_symbol", { length: 20 }),
  cryptoNetwork: varchar("crypto_network", { length: 100 }),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  amountInput: numeric("amount_input", { precision: 20, scale: 8 }).notNull(),
  amountIdr: numeric("amount_idr", { precision: 15, scale: 2 }).notNull(),
  rate: numeric("rate", { precision: 20, scale: 8 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentAccountName: varchar("payment_account_name", { length: 255 }),
  paymentAccountNumber: varchar("payment_account_number", { length: 100 }),
  walletAddress: text("wallet_address"),
  xrpTag: varchar("xrp_tag", { length: 100 }),
  paypalEmail: varchar("paypal_email", { length: 255 }),
  skrillEmail: varchar("skrill_email", { length: 255 }),
  notes: text("notes"),
  status: orderStatusEnum("status").notNull().default("pending"),
  
  nowpaymentsPaymentId: varchar("nowpayments_payment_id", { length: 255 }),
  depositAddress: text("deposit_address"),
  paymentStatus: varchar("payment_status", { length: 50 }),
  actuallyPaid: numeric("actually_paid", { precision: 20, scale: 8 }),
  
  nowpaymentsPayoutId: varchar("nowpayments_payout_id", { length: 255 }),
  payoutStatus: varchar("payout_status", { length: 50 }),
  payoutHash: text("payout_hash"),
  payoutError: text("payout_error"),
  
  paidWithSaldo: boolean("paid_with_saldo").notNull().default(false),
  paymentNote: varchar("payment_note", { length: 50 }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => {
  return {
    statusExpiresIdx: index("orders_status_expires_idx").on(table.status, table.expiresAt),
    userIdIdx: index("orders_user_id_idx").on(table.userId),
    customerEmailIdx: index("orders_customer_email_idx").on(table.customerEmail),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
    userStatusIdx: index("orders_user_status_idx").on(table.userId, table.status),
  };
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const depositStatusEnum = pgEnum("deposit_status", ["pending_proof", "pending", "completed", "rejected", "expired"]);
export const depositMethodEnum = pgEnum("deposit_method", ["bank_transfer", "ewallet"]);

export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  depositId: varchar("deposit_id", { length: 50 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  fee: numeric("fee", { precision: 15, scale: 2 }).notNull().default("0"),
  uniqueCode: integer("unique_code").notNull().default(0),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  method: depositMethodEnum("method").notNull(),
  bankCode: varchar("bank_code", { length: 50 }),
  
  status: depositStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => {
  return {
    userIdIdx: index("deposits_user_id_idx").on(table.userId),
    statusIdx: index("deposits_status_idx").on(table.status),
    createdAtIdx: index("deposits_created_at_idx").on(table.createdAt),
  };
});

export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = typeof deposits.$inferInsert;

// Withdrawal status: pending (waiting admin), processing (admin working), completed (done), rejected
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "processing", "completed", "rejected"]);

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  withdrawalId: varchar("withdrawal_id", { length: 50 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  fee: numeric("fee", { precision: 15, scale: 2 }).notNull().default("0"),
  netAmount: numeric("net_amount", { precision: 15, scale: 2 }).notNull(),
  
  method: depositMethodEnum("method").notNull(),
  bankCode: varchar("bank_code", { length: 50 }),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 100 }).notNull(),
  
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
}, (table) => {
  return {
    userIdIdx: index("withdrawals_user_id_idx").on(table.userId),
    statusIdx: index("withdrawals_status_idx").on(table.status),
    createdAtIdx: index("withdrawals_created_at_idx").on(table.createdAt),
  };
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

// Saldo transfers between users
export const saldoTransfers = pgTable("saldo_transfers", {
  id: serial("id").primaryKey(),
  transferId: varchar("transfer_id", { length: 50 }).notNull().unique(),
  
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    senderIdIdx: index("saldo_transfers_sender_id_idx").on(table.senderId),
    receiverIdIdx: index("saldo_transfers_receiver_id_idx").on(table.receiverId),
    createdAtIdx: index("saldo_transfers_created_at_idx").on(table.createdAt),
  };
});

export type SaldoTransfer = typeof saldoTransfers.$inferSelect;
export type InsertSaldoTransfer = typeof saldoTransfers.$inferInsert;
