import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handlers to prevent crashes
// Guard Node-specific handlers so they don't run in the browser (causes blank page)
if (typeof process !== "undefined" && typeof process.on === "function") {
  process.on("uncaughtException", (err) => {
    console.error("CRASH - Uncaught Exception:", err);
  });

  process.on("unhandledRejection", (err) => {
    console.error("Promise Rejection Error:", err);
  });
}

// Window error handler (browser)
window.addEventListener("error", (event) => {
  console.error("Window Error:", event.error);
});

// Unhandled promise rejection handler (browser)
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
});

createRoot(document.getElementById("root")!).render(<App />);
