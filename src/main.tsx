/**
 * Axo interactive pet entry point.
 * - Axo component lives in src/components/Axolotl.tsx
 * - App simply renders Axo with optional demo wrapper; background stays transparent for embedding.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
