import { Platform } from "react-native";

const PORT = 4000;
const FALLBACK_LAN_IP = "192.168.1.70";
const DEFAULT_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 15000,
);

function cleanBase(url: string) {
  return url.replace(/\/+$/, "");
}

export function getApiBase() {
  const envUrl = cleanBase(
    String(process.env.EXPO_PUBLIC_API_BASE_URL || "").trim(),
  );

  if (envUrl) {
    return envUrl;
  }

  if (Platform.OS === "web") {
    return `http://localhost:${PORT}`;
  }

  return `http://${FALLBACK_LAN_IP}:${PORT}`;
}

const API_BASE = getApiBase();

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;

  try {
    res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
    });
  } catch (error: any) {
    clearTimeout(timeout);

    if (error?.name === "AbortError") {
      throw new Error(`Tiempo de espera agotado en ${url}`);
    }

    throw new Error(
      `No se pudo conectar con ${url}: ${error?.message || "sin respuesta"}`,
    );
  }

  clearTimeout(timeout);

  const raw = await res.text();
  let data: any = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!res.ok) {
    const detail =
      typeof data === "string"
        ? data
        : data?.detail || data?.message || res.statusText;

    throw new Error(`API ${res.status}: ${detail}`);
  }

  return data as T;
}

export function getJson<T>(path: string) {
  return request<T>(path, { method: "GET" });
}

export function postJson<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const api = {
  baseUrl: API_BASE,
  get: getJson,
  post: postJson,
};
