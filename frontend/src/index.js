import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { AppProvider } from "./context/AppContext"; // Import the provider
import "./styles.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <AppProvider>
    <App />
  </AppProvider>
);