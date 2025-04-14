import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Product from './Product';
import ListProduct from './list/ListProduct';
import ListOrder from './list/ListOrder';
import { CartProvider } from './component/CartProvider';
import Cart  from './Cart';
import './index.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          
          <div className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ListProduct />} />
              <Route path="/orders" element={<ListOrder />} />
              <Route path="/menu" element={<Product />} />
              {/* Fallback route if none match */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          
          {/* Cart components that will be available across all routes */}
          
          <Cart />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;