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
  points: integer("points").notNull().default(0),
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: integer("referred_by"),
  role: userRoleEnum("role").notNull().default("user"),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  verificationTokenExpiresAt: timestamp("verification_token_expires_at"),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  phoneVerificationCode: varchar("phone_verification_code", { length: 10 }),
  phoneVerificationCodeExpiresAt: timestamp("phone_verification_code_expires_at"),
  pendingPhone: varchar("pending_phone", { length: 50 }),
  googleId: varchar("google_id", { length: 255 }),
  facebookId: varchar("facebook_id", { length: 255 }),
  nameChanged: boolean("name_changed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    verificationTokenIdx: index("users_verification_token_idx").on(table.verificationToken),
    googleIdIdx: index("users_google_id_idx").on(table.googleId),
    facebookIdIdx: index("users_facebook_id_idx").on(table.facebookId),
    referralCodeIdx: index("users_referral_code_idx").on(table.referralCode),
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

export const orderStatusEnum = pgEnum("order_status", ["pending", "pending_proof", "confirmed", "processing", "completed", "failed", "cancelled", "expired"]);

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
  proofUploadedAt: timestamp("proof_uploaded_at"),
  
  paidWithSaldo: boolean("paid_with_saldo").notNull().default(false),
  paymentNote: varchar("payment_note", { length: 50 }),
  networkFee: numeric("network_fee", { precision: 15, scale: 2 }).default("0"),
  
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

// Saved crypto wallet addresses
export const savedWallets = pgTable("saved_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  label: varchar("label", { length: 100 }).notNull(),
  cryptoSymbol: varchar("crypto_symbol", { length: 20 }).notNull(),
  network: varchar("network", { length: 100 }),
  walletAddress: text("wallet_address").notNull(),
  xrpTag: varchar("xrp_tag", { length: 100 }),
  
  usedCount: integer("used_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("saved_wallets_user_id_idx").on(table.userId),
    userCryptoIdx: index("saved_wallets_user_crypto_idx").on(table.userId, table.cryptoSymbol),
  };
});

export type SavedWallet = typeof savedWallets.$inferSelect;
export type InsertSavedWallet = typeof savedWallets.$inferInsert;

// Saved transfer recipients
export const savedRecipients = pgTable("saved_recipients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  label: varchar("label", { length: 100 }),
  
  usedCount: integer("used_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("saved_recipients_user_id_idx").on(table.userId),
    uniqueRecipient: index("saved_recipients_unique_idx").on(table.userId, table.recipientId),
  };
});

export type SavedRecipient = typeof savedRecipients.$inferSelect;
export type InsertSavedRecipient = typeof savedRecipients.$inferInsert;

// Saved PayPal/Skrill email accounts
export const savedEmails = pgTable("saved_emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  label: varchar("label", { length: 100 }).notNull(),
  serviceType: varchar("service_type", { length: 20 }).notNull(), // 'paypal' or 'skrill'
  email: varchar("email", { length: 255 }).notNull(),
  
  usedCount: integer("used_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("saved_emails_user_id_idx").on(table.userId),
    userServiceIdx: index("saved_emails_user_service_idx").on(table.userId, table.serviceType),
  };
});

export type SavedEmail = typeof savedEmails.$inferSelect;
export type InsertSavedEmail = typeof savedEmails.$inferInsert;

export const pointTransactionTypeEnum = pgEnum("point_transaction_type", ["referral_bonus", "referred_bonus", "redeem", "expired", "adjustment"]);

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredId: integer("referred_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referrerPointsAwarded: integer("referrer_points_awarded").notNull().default(0),
  referredPointsAwarded: integer("referred_points_awarded").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    referrerIdIdx: index("referrals_referrer_id_idx").on(table.referrerId),
    referredIdIdx: index("referrals_referred_id_idx").on(table.referredId),
  };
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: pointTransactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  referralId: integer("referral_id").references(() => referrals.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("point_transactions_user_id_idx").on(table.userId),
    typeIdx: index("point_transactions_type_idx").on(table.type),
    createdAtIdx: index("point_transactions_created_at_idx").on(table.createdAt),
  };
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

export const securityLogStatusEnum = pgEnum("security_log_status", ["success", "failed", "blocked"]);

export const transactionSecurityLogs = pgTable("transaction_security_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  transactionId: varchar("transaction_id", { length: 100 }),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }),
  sessionId: varchar("session_id", { length: 255 }),
  canvasFingerprint: varchar("canvas_fingerprint", { length: 32 }),
  webglFingerprint: varchar("webgl_fingerprint", { length: 32 }),
  browserFingerprint: varchar("browser_fingerprint", { length: 128 }),
  timezone: varchar("timezone", { length: 100 }),
  screenResolution: varchar("screen_resolution", { length: 100 }),
  geoCountry: varchar("geo_country", { length: 100 }),
  geoCity: varchar("geo_city", { length: 100 }),
  geoLat: numeric("geo_lat", { precision: 10, scale: 6 }),
  geoLon: numeric("geo_lon", { precision: 10, scale: 6 }),
  isVpnProxy: boolean("is_vpn_proxy").default(false),
  riskLevel: varchar("risk_level", { length: 20 }),
  status: securityLogStatusEnum("status").notNull(),
  failReason: text("fail_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("security_logs_user_id_idx").on(table.userId),
    ipAddressIdx: index("security_logs_ip_address_idx").on(table.ipAddress),
    createdAtIdx: index("security_logs_created_at_idx").on(table.createdAt),
    userIpIdx: index("security_logs_user_ip_idx").on(table.userId, table.ipAddress),
    browserFpIdx: index("security_logs_browser_fp_idx").on(table.browserFingerprint),
  };
});

export type TransactionSecurityLog = typeof transactionSecurityLogs.$inferSelect;
export type InsertTransactionSecurityLog = typeof transactionSecurityLogs.$inferInsert;

// Rate settings for admin configuration
export const rateSettings = pgTable("rate_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
});

export type RateSetting = typeof rateSettings.$inferSelect;
export type InsertRateSetting = typeof rateSettings.$inferInsert;

// Livechat - Chat Sessions
export const chatStatusEnum = pgEnum("chat_status", ["active", "waiting_admin", "closed"]);

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  visitorName: varchar("visitor_name", { length: 255 }),
  visitorEmail: varchar("visitor_email", { length: 255 }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  status: chatStatusEnum("status").notNull().default("active"),
  telegramMessageId: integer("telegram_message_id"),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    sessionIdIdx: index("chat_sessions_session_id_idx").on(table.sessionId),
    statusIdx: index("chat_sessions_status_idx").on(table.status),
  };
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// Livechat - Messages
export const chatSenderEnum = pgEnum("chat_sender", ["user", "ai", "admin"]);

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  sender: chatSenderEnum("sender").notNull(),
  message: text("message").notNull(),
  telegramMessageId: integer("telegram_message_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    sessionIdIdx: index("chat_messages_session_id_idx").on(table.sessionId),
    createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
  };
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Livechat - Learned Knowledge (untuk bot belajar)
export const chatKnowledge = pgTable("chat_knowledge", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  keywords: text("keywords"),
  addedBy: varchar("added_by", { length: 100 }),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    keywordsIdx: index("chat_knowledge_keywords_idx").on(table.keywords),
  };
});

export type ChatKnowledge = typeof chatKnowledge.$inferSelect;
export type InsertChatKnowledge = typeof chatKnowledge.$inferInsert;
