import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { SettingsProvider } from "@/contexts/SettingsContext";
import App from "./App.tsx";
import "./index.css";

// Lazy load components if needed
const AppWithProviders = () => (
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(<AppWithProviders />);

