/**
 * @fileoverview Main entry point for the React application.
 * This file renders the root component of the application and uses StrictMode
 * to highlight potential problems during development.
 *
 * PERF: AuthProvider/StaffProvider used to be wrapped here AND again inside
 * App.tsx. The inner pair (App.tsx) is the one that actually reaches every
 * route, so the outer pair here was dead weight — a second, redundant
 * GET /users/profile fetch on every load for no consumer. Removed; App.tsx
 * remains the single source of these contexts.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
