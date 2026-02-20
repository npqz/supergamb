import bcrypt from "bcryptjs";
import * as db from "./db";
import { InsertUser } from "../drizzle/schema";

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Create a new user with username and password
 */
export async function createUser(username: string, password: string, name?: string, email?: string) {
  const existing = db.getUserByUsername(username);
  if (existing) {
    throw new Error("Username already exists");
  }

  const passwordHash = await hashPassword(password);

  const newUser: InsertUser = {
    username: username,
    passwordHash: passwordHash,
    name: name || username,
    email: email || null,
    loginMethod: "local",
    role: "user",
    lastSignedIn: new Date(),
    openId: null,
  };

  return db.insertUser(newUser);
}

/**
 * Authenticate a user with username and password
 */
export async function authenticateUser(username: string, password: string) {
  const user = db.getUserByUsername(username);

  if (!user) {
    return null;
  }

  if (!user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  db.updateLastSignedIn(user.id);
  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  return db.getUserById(id);
}
