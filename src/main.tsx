import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';
import { applyPath } from "@/lib/deeplink";

// Register killer service worker
const updateSW = registerSW({
  onNeedRefresh() {
    toast('New version available!', {
      description: 'Click to update and reload',
      duration: 0,
      action: {
        label: 'Update',
        onClick: () => {
          updateSW(true);
        },
      },
    });
  },
  onOfflineReady() {
    toast.success('App ready to work offline!');
  },
});

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
