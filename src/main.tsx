import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import "./store/useSystemStore"; // aplica el tema del SO (data-theme) al arrancar
import App from "./App";
import { BrowserRouter } from "react-router-dom"
import { initSocketRouter } from "./lib/socketRouter";

initSocketRouter()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
