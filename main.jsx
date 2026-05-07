import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Remove loading screen once React mounts
const loading = document.getElementById("loading");
if (loading) loading.remove();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
