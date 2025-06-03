// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PanelSelector from "./pages/PanelSelector.jsx";
import Receivers from "./pages/Receivers.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configure" element={<PanelSelector />} />
        <Route path="/receivers" element={<Receivers />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
