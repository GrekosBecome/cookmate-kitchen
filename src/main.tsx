import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

// Register service worker with update prompt
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
