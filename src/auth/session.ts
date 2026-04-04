import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "tlalokflix_access_token";
const USER_KEY = "tlalokflix_auth_user";

export type AuthUser = { id: number; email: string; name: string | null };

function webGet(key: string) {
  try {
    return globalThis?.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function webSet(key: string, value: string) {
  try {
    globalThis?.localStorage?.setItem(key, value);
  } catch {}
}

function webClear(key: string) {
  try {
    globalThis?.localStorage?.removeItem(key);
  } catch {}
}

function cleanName(value: unknown) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

function cleanEmail(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function getUserDisplayName(user: AuthUser | null | undefined) {
  const fromName = cleanName(user?.name);
  if (fromName) return fromName;

  const email = cleanEmail(user?.email);
  if (email.includes("@")) {
    return email.split("@")[0];
  }

  return "Usuario";
}

export async function getToken() {
  if (Platform.OS === "web") return webGet(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  if (Platform.OS === "web") return webSet(TOKEN_KEY, token);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  if (Platform.OS === "web") return webClear(TOKEN_KEY);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getUser(): Promise<AuthUser | null> {
  const raw =
    Platform.OS === "web"
      ? webGet(USER_KEY)
      : await SecureStore.getItemAsync(USER_KEY);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const id = Number(parsed.id);
    const email = cleanEmail(parsed.email);
    const name = cleanName(parsed.name);

    if (!Number.isFinite(id) || !email) return null;

    return { id, email, name };
  } catch {
    return null;
  }
}

export async function setUser(user: AuthUser) {
  const raw = JSON.stringify({
    id: Number(user.id),
    email: cleanEmail(user.email),
    name: cleanName(user.name),
  });

  if (Platform.OS === "web") return webSet(USER_KEY, raw);
  await SecureStore.setItemAsync(USER_KEY, raw);
}

export async function clearUser() {
  if (Platform.OS === "web") return webClear(USER_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function clearSession() {
  await Promise.all([clearToken(), clearUser()]);
}
