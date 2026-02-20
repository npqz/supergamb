import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Username for login - required for local auth, optional for OAuth */
  username: varchar("username", { length: 50 }).unique(),
  /** Hashed password - required for local auth, optional for OAuth */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /** Manus OAuth identifier (openId) - optional for backward compatibility */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User balances table - stores demo money balance for each user
 */
export const userBalances = mysqlTable("user_balances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserBalance = typeof userBalances.$inferSelect;
export type InsertUserBalance = typeof userBalances.$inferInsert;

/**
 * Game history table - tracks all game plays
 */
export const gameHistory = mysqlTable("game_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameType: varchar("gameType", { length: 50 }).notNull(), // slots, dice, roulette, blackjack, poker
  betAmount: decimal("betAmount", { precision: 10, scale: 2 }).notNull(),
  winAmount: decimal("winAmount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  result: text("result"), // JSON string with game-specific result data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameHistory = typeof gameHistory.$inferSelect;
export type InsertGameHistory = typeof gameHistory.$inferInsert;
