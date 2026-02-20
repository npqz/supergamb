import type { InsertUser, InsertGameHistory } from "../drizzle/schema";
import * as store from "./store-json";

// Kept for compatibility; no-op when using JSON store.
export async function getDb() {
  return null;
}

export async function upsertUser(user: InsertUser & { openId: string | null }): Promise<void> {
  if (!user.openId) return;
  store.upsertUser(user);
}

export async function getUserByOpenId(openId: string) {
  return store.getUserByOpenId(openId);
}

export async function getUserBalance(userId: number) {
  return store.getUserBalance(userId);
}

export async function updateUserBalance(userId: number, newBalance: string) {
  return store.updateUserBalance(userId, newBalance);
}

export async function resetUserBalance(userId: number) {
  return store.resetUserBalance(userId);
}

export async function addGameHistory(history: InsertGameHistory) {
  return store.addGameHistory(history);
}

export async function getUserGameHistory(userId: number, limit: number = 50) {
  return store.getUserGameHistory(userId, limit);
}

// Auth: local username/password
export function insertUser(newUser: InsertUser) {
  return store.insertUser(newUser);
}

export function getUserByUsername(username: string) {
  return store.getUserByUsername(username);
}

export function getUserById(id: number) {
  return store.getUserById(id);
}

export function updateLastSignedIn(userId: number) {
  return store.updateLastSignedIn(userId);
}

export function getWithdrawalAddresses(userId: number) {
  return store.getWithdrawalAddresses(userId);
}

export function setWithdrawalAddress(
  userId: number,
  crypto: keyof store.WithdrawalAddresses,
  address: string
) {
  return store.setWithdrawalAddress(userId, crypto, address);
}
