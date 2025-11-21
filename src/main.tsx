import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (typeof document !== "undefined") {
  // document.addEventListener("contextmenu", (e) => {
  //   e.preventDefault();
  // });
  // document.addEventListener("keydown", (e) => {
  //   const key = e.key?.toLowerCase();
  //   if (
  //     key === "f12" ||
  //     (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
  //     (e.ctrlKey && key === "u")
  //   ) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  //   // Block printing via Ctrl+P
  //   if (e.ctrlKey && key === "p") {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  // });
}

createRoot(document.getElementById("root")!).render(<App />);
