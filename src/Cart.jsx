import React, { useState } from 'react';
import { useCart } from './component/CartProvider';
import { XCircle, ShoppingBag, Trash, Plus, Minus, Loader } from 'lucide-react';

const Cart = () => {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal 
  } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isCartOpen) {
    return (
      <button 
        onClick={toggleCart} 
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        aria-label="Open cart"
      >
        <ShoppingBag />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>
    );
  }

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Example data - you'll need to adjust this based on your actual user and table data
      const orderData = {
        user_id: 1, // Replace with actual user ID
        table: "Table 5", // Replace with actual table info
        order_type: "dine_in", // Or dynamically determine type
        status: "pending",
        subtotal: getCartTotal(),
        tax: Math.round(getCartTotal() * 0.1), // Assuming 10% tax
        discount: 0, // Update if you have discount logic
        total: getCartTotal() + Math.round(getCartTotal() * 0.1),
        notes: "" // You might want to add a field for overall order notes
      };
      
      // Create the order
      const orderResponse = await fetch('https://pos.cansyell.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }
      
      const orderResult = await orderResponse.json();
      const orderId = orderResult.data.id;
      
      // Create order items
      const orderItemPromises = cart.map(item => {
        const orderItemData = {
          order_id: orderId,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: parseInt(item.product.price),
          subtotal: item.quantity * parseInt(item.product.price),
          notes: item.notes || ""
        };
        
        return fetch('https://pos.cansyell.com/api/order-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderItemData)
        });
      });
      
      const orderItemResponses = await Promise.all(orderItemPromises);
      
      // Check if all order items were created successfully
      const failedResponses = orderItemResponses.filter(response => !response.ok);
      
      if (failedResponses.length > 0) {
        throw new Error(`Failed to create ${failedResponses.length} order items`);
      }
      
      // Success - clear cart and show success message
      clearCart();
      setSuccess(`Order #${orderResult.data.order_number} created successfully!`);
    } catch (err) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-lg z-50 flex flex-col h-full md:h-auto md:inset-y-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Keranjang Belanja</h2>
        <button onClick={toggleCart} className="text-gray-500 hover:text-gray-700">
          <XCircle size={24} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingBag size={48} />
            <p className="mt-2">Keranjang belanja kosong</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {cart.map((item, index) => (
              <li key={`${item.product.id}-${index}`} className="border-b pb-4">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">Rp {parseInt(item.product.price).toLocaleString('id-ID')}</p>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Catatan:</span> {item.notes}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => removeFromCart(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove item"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                
                <div className="flex items-center mt-2">
                  <div className="flex items-center border rounded-md">
                    <button 
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 py-1">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="ml-auto font-medium">
                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      <div className="border-t p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Total</span>
          <span className="text-xl font-bold">Rp {getCartTotal().toLocaleString('id-ID')}</span>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={clearCart}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center"
            disabled={cart.length === 0 || isLoading}
          >
            <Trash size={16} className="mr-2" />
            Kosongkan Keranjang
          </button>
          
          <button 
            onClick={handleCheckout}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center"
            disabled={cart.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              'Lanjutkan ke Pembayaran'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;