// main.jsx - Entry point for the React app.
// This finds the #root div in index.html and mounts the whole app inside it.
// StrictMode helps catch bugs during development by running effects twice.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode><App /></StrictMode>
);
