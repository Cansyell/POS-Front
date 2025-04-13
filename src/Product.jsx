import { useEffect, useState } from 'react';
import './index.css';
import FormProduct from './form/FormProduct';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => quantity > 1 && setQuantity(quantity - 1);

  const addToCart = () => {
    console.log(`Added ${quantity} of ${product.name} to cart`);
    // dispatch to cart state here
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={`https://pos.cansyell.com/storage/${product.image_path}`}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 mt-1">{product.description}</p>
        <div className="mt-2 text-xl font-bold text-gray-900">
          Rp {parseInt(product.price).toLocaleString('id-ID')}
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex items-center border rounded-md">
            <button onClick={decreaseQuantity} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
            <span className="px-3 py-1">{quantity}</span>
            <button onClick={increaseQuantity} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
          </div>
          <button
            onClick={addToCart}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch products
    fetch('https://pos.cansyell.com/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.status && Array.isArray(data.data)) {
          setProducts(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
    
    // Fetch categories for the form
    fetch('https://pos.cansyell.com/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.status && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  const handleAddProduct = (newProduct) => {
    setProducts([...products, newProduct]);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Our Products</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <FormProduct 
          onClose={() => setShowForm(false)} 
          onProductAdded={handleAddProduct}
          categories={categories}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;