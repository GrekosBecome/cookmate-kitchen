export function applyPath(path: string) {
  const p = path?.startsWith("/") ? path : `/${path || ""}`;
  try {
    window.history.pushState({}, "", p);
    window.dispatchEvent(new Event("popstate")); // Inform routers if needed
  } catch (e) {
    console.warn("Deeplink push failed", e);
  }
}
