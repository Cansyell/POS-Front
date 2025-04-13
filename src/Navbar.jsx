import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './index.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to determine if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-red-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">POS System</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/products" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/products') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                >
                  Products
                </Link>
                <Link 
                  to="/orders" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/orders') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                >
                  Orders
                </Link>
                <Link 
                  to="/menu" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/menu') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                >
                  Menu
                </Link>
                <Link 
                  to="/reports" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/reports') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                >
                  Reports
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full hover:bg-gray-700 focus:outline-none">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="ml-3 relative">
                <div>
                  <button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none">
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full" src="/api/placeholder/200/200" alt="User avatar" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/dashboard" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/products" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/products') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
            >
              Products
            </Link>
            <Link 
              to="/orders" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/orders') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
            >
              Orders
            </Link>
            <Link 
              to="/menu" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/menu') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
            >
              Menu
            </Link>
            <Link 
              to="/reports" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/reports') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
            >
              Reports
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="/api/placeholder/200/200" alt="User avatar" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">Admin User</div>
                <div className="text-sm font-medium text-gray-400">admin@example.com</div>
              </div>
              <button className="ml-auto p-1 rounded-full hover:bg-gray-700 focus:outline-none">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;