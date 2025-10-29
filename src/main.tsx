import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyPath } from "@/lib/deeplink";

// Manual killer SW registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(registration => {
      console.log('[App] Killer SW registered:', registration);
      registration.update();
    })
    .catch(error => {
      console.error('[App] Killer SW registration failed:', error);
    });
}

// Deep link handling for native WebView messages
window.addEventListener("message", (ev) => {
  try {
    const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
    if (data && data.type === "DEEPLINK" && data.path) applyPath(data.path);
  } catch {}
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
