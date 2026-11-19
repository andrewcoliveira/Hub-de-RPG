import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/jade.css";
import "../styles/gerador.css";
import GeradorApp from "./GeradorApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><GeradorApp /></React.StrictMode>,
);
