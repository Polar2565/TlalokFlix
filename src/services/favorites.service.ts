import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "tlalokflix_favorites_v1";

function webGet(): string | null {
  try {
    return globalThis?.localStorage?.getItem(KEY) ?? null;
  } catch {
    return null;
  }
}
function webSet(v: string) {
  try {
    globalThis?.localStorage?.setItem(KEY, v);
  } catch {}
}

async function getRaw(): Promise<string | null> {
  if (Platform.OS === "web") return webGet();
  return SecureStore.getItemAsync(KEY);
}

async function setRaw(v: string): Promise<void> {
  if (Platform.OS === "web") return webSet(v);
  await SecureStore.setItemAsync(KEY, v);
}

export type FavoriteMovie = {
  id: string;
  title: string;
  poster: string | null;
  savedAt: number;
};

export async function getFavorites(): Promise<FavoriteMovie[]> {
  const raw = await getRaw();
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function isFavorite(id: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some((x) => x.id === String(id));
}

export async function addFavorite(movie: {
  id: string;
  title: string;
  poster: string | null;
}): Promise<void> {
  const favs = await getFavorites();
  const id = String(movie.id);

  if (favs.some((x) => x.id === id)) return;

  const next: FavoriteMovie[] = [
    {
      id,
      title: movie.title,
      poster: movie.poster ?? null,
      savedAt: Date.now(),
    },
    ...favs,
  ];

  await setRaw(JSON.stringify(next));
}

export async function removeFavorite(id: string): Promise<void> {
  const favs = await getFavorites();
  const next = favs.filter((x) => x.id !== String(id));
  await setRaw(JSON.stringify(next));
}

export async function toggleFavorite(movie: {
  id: string;
  title: string;
  poster: string | null;
}): Promise<boolean> {
  const id = String(movie.id);
  const favs = await getFavorites();
  const exists = favs.some((x) => x.id === id);

  if (exists) {
    await removeFavorite(id);
    return false;
  } else {
    await addFavorite(movie);
    return true;
  }
}
