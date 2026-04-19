import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SettingsProvider } from "@/contexts/SettingsContext";
import App from "./App.tsx";
import "./index.css";

// @uiw/react-md-editor v4 — only markdown-editor.css is exported.
// markdown.css does NOT exist as a package specifier in v4.
import "@uiw/react-md-editor/markdown-editor.css";

const AppWithProviders = () => (
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(<AppWithProviders />);