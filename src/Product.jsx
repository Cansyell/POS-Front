import { useState, useEffect } from 'react';
import { useCart } from './component/CartProvider';

// Individual Product component
const Product = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const { addToCart } = useCart();
  
  // Return early if product is undefined
  if (!product) {
    return <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">Loading product...</div>;
  }
  
  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => quantity > 1 && setQuantity(quantity - 1);
  
  const handleAddToCart = () => {
    addToCart(product, quantity, notes);
    setQuantity(1);
    setNotes('');
    setShowNotes(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={`https://pos.cansyell.com/storage/${product.image_path}`}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="text-gray-600 mt-1">{product.description}</p>
        <p className="text-lg font-bold text-gray-900 mt-2">
          Rp {parseInt(product.price).toLocaleString('id-ID')}
        </p>
        
        <div className="flex items-center mt-4">
          <div className="flex items-center border rounded-md">
            <button 
              onClick={decreaseQuantity}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-3 py-1">{quantity}</span>
            <button 
              onClick={increaseQuantity}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
          
          <button 
            onClick={() => setShowNotes(!showNotes)}
            className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </button>
        </div>
        
        {showNotes && (
          <div className="mt-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add special instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>
        )}
        
        <button 
          onClick={handleAddToCart}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Main component that fetches and displays products
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch products
    const fetchProducts = async () => {
      try {
        console.log("Fetching products...");
        const response = await fetch('https://pos.cansyell.com/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Products fetched:", data);
        
        // Check the structure of the response
        if (data && Array.isArray(data.data)) {
          // If the products are in a 'data' property
          setProducts(data.data);
        } else if (Array.isArray(data)) {
          // If the response directly contains the products array
          setProducts(data);
        } else {
          console.error("Unexpected data format:", data);
          setError("Unexpected data format from API");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading products: {error}</div>;
  }

  if (!products || products.length === 0) {
    return <div className="p-4 text-center">No products found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => (
          <Product key={product.id || index} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;