import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/jade.css";
import "../styles/ficha.css";
import FichaApp from "./FichaApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><FichaApp /></React.StrictMode>,
);
