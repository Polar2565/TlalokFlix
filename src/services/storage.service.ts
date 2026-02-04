const KEY = "tlalokflix:lastMood";

export const storageService = {
  getLastMood(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },

  setLastMood(mood: string) {
    try {
      localStorage.setItem(KEY, mood);
    } catch {}
  },

  clearLastMood() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  },
};
