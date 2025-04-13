import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Menu from './Product';
import ListProduct from './list/ListProduct';
import ListOrder from './list/ListOrder';
import './index.css';

function App() {
  // No need for currentTab state anymore as we'll use routing

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ListProduct />} />
            <Route path="/orders" element={<ListOrder />} />
            <Route path="/menu" element={<Menu />} />
            {/* Fallback route if none match */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;