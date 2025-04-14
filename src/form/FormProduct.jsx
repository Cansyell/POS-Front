import { useState, useEffect } from 'react';
import axios from 'axios';

const FormProduct = ({ onClose, onProductAdded, onProductEdited, categories, editProduct }) => {
  const isEditMode = Boolean(editProduct);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_active: 1,
    is_featured: 0
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [apiErrors, setApiErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch product details if in edit mode
  useEffect(() => {
    if (editProduct) {
      // If we already have the complete product data, use it
      if (typeof editProduct === 'object' && editProduct.id) {
        populateFormWithProductData(editProduct);
      } else {
        // Otherwise, fetch the product details
        fetchProductDetails(editProduct);
      }
    }
  }, [editProduct]);

  // Fetch product details from API
  const fetchProductDetails = async (productId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://pos.cansyell.com/api/products/${productId}`);
      let productData;
      
      // Handle different API response formats
      if (response.data && response.data.data) {
        productData = response.data.data;
      } else if (response.data) {
        productData = response.data;
      }
      
      if (productData) {
        populateFormWithProductData(productData);
      }
    } catch (error) {
      setSubmitError('Failed to fetch product details');
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fill form with product data
  const populateFormWithProductData = (product) => {
    setFormData({
      category_id: product.category_id || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      is_active: product.is_active === true || product.is_active === 1 ? 1 : 0,
      is_featured: product.is_featured === true || product.is_featured === 1 ? 1 : 0
    });

    // Set image preview if available
    if (product.image_path) {
      setImagePreview(`https://pos.cansyell.com/storage/${product.image_path}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    });
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear API error when field is updated
    if (apiErrors[name]) {
      setApiErrors({
        ...apiErrors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedImage);
      
      // Clear validation error
      if (errors.image) {
        setErrors({
          ...errors,
          image: ''
        });
      }
      
      // Clear API error
      if (apiErrors.image) {
        setApiErrors({
          ...apiErrors,
          image: null
        });
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.name || formData.name.length > 255) newErrors.name = 'Name must be between 1 and 255 characters';
    if (!formData.price) newErrors.price = 'Price is required';
    if (isNaN(formData.price) || Number(formData.price) < 0) newErrors.price = 'Price must be a positive number';
    
    if (image) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(image.type)) {
        newErrors.image = 'Image must be of type: jpeg, png, jpg, gif';
      }
      if (image.size > 2 * 1024 * 1024) { // 2MB
        newErrors.image = 'Image size should not exceed 2MB';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    setApiErrors({});
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Append image if exists
      if (image) {
        formDataToSend.append('image', image);
      }
      
      // Determine API endpoint and method based on mode
      const url = isEditMode 
        ? `https://pos.cansyell.com/api/products/${editProduct.id}` 
        : 'https://pos.cansyell.com/api/products';
      
      // For edit mode, we need to use PUT method
      if (isEditMode) {
        formDataToSend.append('_method', 'PUT'); // Laravel accepts _method for method spoofing
      }
      
      const response = await fetch(url, {
        method: 'POST', // Always POST when sending FormData, with _method for spoofing if needed
        body: formDataToSend,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from API
        if (response.status === 422 && result.errors) {
          setApiErrors(result.errors);
          throw new Error('Please correct the validation errors');
        }
        throw new Error(result.message || `Failed to ${isEditMode ? 'update' : 'add'} product`);
      }
      
      // Handle success
      if (result.status && result.data) {
        if (isEditMode) {
          onProductEdited(result.data);
        } else {
          onProductAdded(result.data);
        }
      } else {
        throw new Error(result.message || `Failed to ${isEditMode ? 'update' : 'add'} product`);
      }
    } catch (err) {
      setSubmitError(err.message || `An error occurred while ${isEditMode ? 'updating' : 'adding'} the product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to display field errors (client or server validation)
  const getFieldError = (fieldName) => {
    // First check local validation errors
    if (errors[fieldName]) {
      return errors[fieldName];
    }
    
    // Then check API validation errors
    if (apiErrors[fieldName]) {
      return Array.isArray(apiErrors[fieldName]) 
        ? apiErrors[fieldName][0] 
        : apiErrors[fieldName];
    }
    
    return null;
  };

  // Helper function to determine if a field has an error
  const hasError = (fieldName) => {
    return Boolean(errors[fieldName] || apiErrors[fieldName]);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 text-center">
          <div className="text-xl font-semibold">Loading product data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* General form error message */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-bold">Error</p>
              <p>{submitError}</p>
            </div>
          )}
          
          {/* API general errors if any */}
          {apiErrors.message && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p>{apiErrors.message}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category_id">
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`shadow appearance-none border ${hasError('category_id') ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {getFieldError('category_id') && (
              <p className="text-red-500 text-xs italic mt-1">{getFieldError('category_id')}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Product Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`shadow appearance-none border ${hasError('name') ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Enter product name"
              required
            />
            {getFieldError('name') && (
              <p className="text-red-500 text-xs italic mt-1">{getFieldError('name')}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`shadow appearance-none border ${hasError('description') ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Enter product description"
              rows="3"
            />
            {getFieldError('description') && (
              <p className="text-red-500 text-xs italic mt-1">{getFieldError('description')}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`shadow appearance-none border ${hasError('price') ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Enter product price"
              required
            />
            {getFieldError('price') && (
              <p className="text-red-500 text-xs italic mt-1">{getFieldError('price')}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
              Product Image
            </label>
            
            {/* Show current image preview if available */}
            {imagePreview && (
              <div className="mb-2">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="h-24 w-auto object-cover rounded" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditMode && !image ? "Current image shown. Upload a new one to replace it." : ""}
                </p>
              </div>
            )}
            
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleImageChange}
              className={`shadow appearance-none border ${hasError('image') ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Max size: 2MB. Formats: jpeg, png, jpg, gif
              {isEditMode && " (leave empty to keep current image)"}
            </p>
            {getFieldError('image') && (
              <p className="text-red-500 text-xs italic mt-1">{getFieldError('image')}</p>
            )}
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active === 1}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="is_active">
              Active
            </label>
            {getFieldError('is_active') && (
              <p className="text-red-500 text-xs italic ml-2">{getFieldError('is_active')}</p>
            )}
          </div>
          
          <div className="mb-6 flex items-center">
            <input
              id="is_featured"
              name="is_featured"
              type="checkbox"
              checked={formData.is_featured === 1}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="is_featured">
              Featured product
            </label>
            {getFieldError('is_featured') && (
              <p className="text-red-500 text-xs italic ml-2">{getFieldError('is_featured')}</p>
            )}
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Product' : 'Save Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormProduct;