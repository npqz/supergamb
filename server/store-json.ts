import crypto from "crypto";
import fs from "fs";
import path from "path";
import type {
  User,
  InsertUser,
  UserBalance,
  GameHistory,
  InsertGameHistory,
} from "../drizzle/schema";

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "store.json");

type StoredUser = Omit<User, "createdAt" | "updatedAt" | "lastSignedIn"> & {
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
};
type StoredUserBalance = Omit<UserBalance, "createdAt" | "updatedAt"> & {
  balance: string;
  createdAt: string;
  updatedAt: string;
};
type StoredGameHistory = Omit<GameHistory, "createdAt" | "betAmount" | "winAmount"> & {
  betAmount: string;
  winAmount: string;
  createdAt: string;
};

type StoredSession =
  | { token: string; userId: number; openId?: never; expiresAt: string }
  | { token: string; openId: string; userId?: never; expiresAt: string };

export type WithdrawalAddresses = {
  USDT?: string;
  BTC?: string;
  ETH?: string;
  LTC?: string;
};

type Store = {
  users: StoredUser[];
  userBalances: StoredUserBalance[];
  gameHistory: StoredGameHistory[];
  sessions: StoredSession[];
  withdrawalAddresses: Record<string, WithdrawalAddresses>;
  nextIds: { users: number; userBalances: number; gameHistory: number };
};

const defaultStore: Store = {
  users: [],
  userBalances: [],
  gameHistory: [],
  sessions: [],
  withdrawalAddresses: {},
  nextIds: { users: 1, userBalances: 1, gameHistory: 1 },
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Create a session for local login (userId); token stored in store.json.
 */
export function createSession(
  userId: number,
  options: { expiresInMs?: number } = {}
): string {
  const store = readStore();
  const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
  const expiresAt = new Date(Date.now() + expiresInMs).toISOString();
  const token = crypto.randomBytes(32).toString("hex");
  store.sessions = store.sessions ?? [];
  store.sessions.push({ token, userId, expiresAt });
  writeStore(store);
  return token;
}

/**
 * Create a session for OAuth login (openId); token stored in store.json.
 */
export function createOAuthSession(
  openId: string,
  options: { expiresInMs?: number } = {}
): string {
  const store = readStore();
  const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
  const expiresAt = new Date(Date.now() + expiresInMs).toISOString();
  const token = crypto.randomBytes(32).toString("hex");
  store.sessions = store.sessions ?? [];
  store.sessions.push({ token, openId, expiresAt });
  writeStore(store);
  return token;
}

/**
 * Get session by token; returns userId (local) or openId (OAuth) if valid and not expired.
 */
export function getSession(
  token: string
): { userId: number } | { openId: string } | null {
  const store = readStore();
  const list = store.sessions ?? [];
  const now = new Date().toISOString();
  const session = list.find((s) => s.token === token);
  if (!session || session.expiresAt < now) return null;
  if ("userId" in session && session.userId != null) return { userId: session.userId };
  if ("openId" in session && session.openId) return { openId: session.openId };
  return null;
}

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function readStore(): Store {
  ensureDir();
  if (!fs.existsSync(STORE_FILE)) {
    return JSON.parse(JSON.stringify(defaultStore));
  }
  const raw = fs.readFileSync(STORE_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw) as Store;
    return { ...defaultStore, ...parsed };
  } catch {
    return JSON.parse(JSON.stringify(defaultStore));
  }
}

function writeStore(store: Store) {
  ensureDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function toUser(row: StoredUser): User {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    lastSignedIn: new Date(row.lastSignedIn),
  };
}

function toUserBalance(row: StoredUserBalance): UserBalance {
  return {
    ...row,
    balance: row.balance,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function toGameHistory(row: StoredGameHistory): GameHistory {
  return {
    ...row,
    betAmount: row.betAmount,
    winAmount: row.winAmount,
    createdAt: new Date(row.createdAt),
  };
}

export function getUserByOpenId(openId: string): User | undefined {
  const store = readStore();
  const row = store.users.find((u) => u.openId === openId);
  return row ? toUser(row) : undefined;
}

export function upsertUser(data: Partial<InsertUser> & { openId: string | null }): void {
  if (!data.openId) return;
  const store = readStore();
  const idx = store.users.findIndex((u) => u.openId === data.openId);
  const now = new Date().toISOString();
  if (idx >= 0) {
    store.users[idx] = {
      ...store.users[idx],
      ...data,
      openId: data.openId,
      updatedAt: now,
      lastSignedIn: (data.lastSignedIn as Date)?.toISOString?.() ?? store.users[idx].lastSignedIn,
    } as StoredUser;
  } else {
    const id = store.nextIds.users++;
    store.users.push({
      id,
      username: null,
      passwordHash: null,
      openId: data.openId,
      name: data.name ?? null,
      email: data.email ?? null,
      loginMethod: data.loginMethod ?? "oauth",
      role: "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: (data.lastSignedIn as Date)?.toISOString?.() ?? now,
    } as StoredUser);
  }
  writeStore(store);
}

export function insertUser(newUser: InsertUser): User {
  const store = readStore();
  const id = store.nextIds.users++;
  const now = new Date().toISOString();
  const row: StoredUser = {
    id,
    username: newUser.username ?? null,
    passwordHash: newUser.passwordHash ?? null,
    openId: newUser.openId ?? null,
    name: newUser.name ?? null,
    email: newUser.email ?? null,
    loginMethod: newUser.loginMethod ?? "local",
    role: newUser.role ?? "user",
    createdAt: (newUser.createdAt as Date)?.toISOString?.() ?? now,
    updatedAt: (newUser.updatedAt as Date)?.toISOString?.() ?? now,
    lastSignedIn: (newUser.lastSignedIn as Date)?.toISOString?.() ?? now,
  };
  store.users.push(row);
  writeStore(store);
  return toUser(row);
}

export function getUserByUsername(username: string): User | null {
  const store = readStore();
  const row = store.users.find((u) => u.username === username);
  return row ? toUser(row) : null;
}

export function getUserById(id: number): User | null {
  const store = readStore();
  const row = store.users.find((u) => u.id === id);
  return row ? toUser(row) : null;
}

export function updateLastSignedIn(userId: number): void {
  const store = readStore();
  const idx = store.users.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    store.users[idx].lastSignedIn = new Date().toISOString();
    writeStore(store);
  }
}

// User balances
export function getUserBalance(userId: number): UserBalance | null {
  const store = readStore();
  let row = store.userBalances.find((b) => b.userId === userId);
  if (!row) {
    const id = store.nextIds.userBalances++;
    const now = new Date().toISOString();
    row = {
      id,
      userId,
      balance: "0.00",
      createdAt: now,
      updatedAt: now,
    };
    store.userBalances.push(row);
    writeStore(store);
  }
  return toUserBalance(row);
}

export function updateUserBalance(userId: number, newBalance: string): UserBalance | null {
  const store = readStore();
  const idx = store.userBalances.findIndex((b) => b.userId === userId);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  store.userBalances[idx].balance = newBalance;
  store.userBalances[idx].updatedAt = now;
  writeStore(store);
  return toUserBalance(store.userBalances[idx]);
}

export function resetUserBalance(userId: number): UserBalance | null {
  return updateUserBalance(userId, "0.00");
}

// Game history
export function addGameHistory(history: InsertGameHistory): InsertGameHistory | null {
  const store = readStore();
  const id = store.nextIds.gameHistory++;
  const now = new Date().toISOString();
  const row: StoredGameHistory = {
    id,
    userId: history.userId,
    gameType: history.gameType,
    betAmount: String(history.betAmount),
    winAmount: String(history.winAmount ?? "0.00"),
    result: history.result ?? null,
    createdAt: (history.createdAt as Date)?.toISOString?.() ?? now,
  };
  store.gameHistory.push(row);
  writeStore(store);
  return toGameHistory(row) as InsertGameHistory;
}

export function getUserGameHistory(userId: number, limit: number = 50): GameHistory[] {
  const store = readStore();
  return store.gameHistory
    .filter((h) => h.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(toGameHistory);
}

// Withdrawal addresses (per user, per crypto)
export function getWithdrawalAddresses(userId: number): WithdrawalAddresses {
  const store = readStore();
  const key = String(userId);
  const addrs = store.withdrawalAddresses?.[key] ?? {};
  return {
    USDT: addrs.USDT ?? "",
    BTC: addrs.BTC ?? "",
    ETH: addrs.ETH ?? "",
    LTC: addrs.LTC ?? "",
  };
}

export function setWithdrawalAddress(
  userId: number,
  crypto: keyof WithdrawalAddresses,
  address: string
): void {
  const store = readStore();
  const key = String(userId);
  if (!store.withdrawalAddresses) store.withdrawalAddresses = {};
  if (!store.withdrawalAddresses[key]) store.withdrawalAddresses[key] = {};
  store.withdrawalAddresses[key][crypto] = address.trim();
  writeStore(store);
}
