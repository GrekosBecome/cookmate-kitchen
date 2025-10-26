const KEY = "chef_session_cache";
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export type ChefCache = {
  ts: number;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string; allergenWarning?: string }>;
  draft?: string;
  ctx?: {
    recipeId?: string;
    recipeTitle?: string;
    have?: string;
    need?: string;
  };
};

export function saveChef(cache: Omit<ChefCache, "ts">) {
  try {
    const payload: ChefCache = { ts: Date.now(), ...cache };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Silent fail for private mode
  }
}

export function loadChef(): ChefCache | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ChefCache;
    if (Date.now() - data.ts > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearChef() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Silent fail
  }
}
