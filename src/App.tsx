import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainApp from './routes/MainApp';
import CartoonPage from './routes/CartoonPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/cartoon/:id" element={<CartoonPage />} />
      </Routes>
    </Router>
  );
}