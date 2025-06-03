// src/main.jsx
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import EntryManager from "./utils/EntryManager.jsx"; // ← import the context provider

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <EntryManager>
      <App />
    </EntryManager>
  </StrictMode>
);
