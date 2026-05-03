/**
 * @fileoverview Main entry point for the React application.
 * This file renders the root component of the application. It wraps the App component
 * with AuthProvider and StaffProvider to make authentication and staff state available
 * throughout the component tree and uses StrictMode to highlight potential problems during development.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { StaffProvider } from "./contexts/StaffContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <StaffProvider>
        {" "}
        <App />
      </StaffProvider>{" "}
    </AuthProvider>
  </StrictMode>,
);
