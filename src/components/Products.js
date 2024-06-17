// //Products.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import AddProduct from './AddProduct'; // Import the AddProduct component
import ProductCard from './ProductCard'; // Import the ProductCard component
import EditProductModal from './EditProductModal'; // Import the EditProductModal component
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleEditClick = (product) => {
    setEditingProduct(product);
  };

  const handleAddProductClick = () => {
    setAddingProduct(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null); // Close the modal
    setAddingProduct(false); // Reset adding product mode
  };

  const handleSaveClick = async (updatedProduct) => {
    try {
      const productData = { ...updatedProduct };

      if (updatedProduct.id) {
        // Update existing product
        await updateDoc(doc(db, 'products', updatedProduct.id), productData);
        setProducts(products.map(product =>
          product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product
        ));
      } else {
        // Add new product
        const newProductRef = doc(collection(db, 'products'));
        await setDoc(newProductRef, productData);
        setProducts([...products, { id: newProductRef.id, ...productData }]);
      }

      setEditingProduct(null);
      setAddingProduct(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = () => {
    // Logic to handle after product is deleted (e.g., refresh product list)
    setProducts(products.filter(product => product.id !== editingProduct.id));
  };

  return (
    <div className="product-list">
      <h1>All Products</h1>

      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEditClick={handleEditClick}
          />
        ))}
      </div>
      
      {/* Conditional rendering for AddProduct component */}
      {addingProduct && (
        <AddProduct onSave={handleSaveClick} onClose={handleCloseModal} />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSaveClick}
          onDelete={handleDeleteProduct}
        />
      )}

      <div className='add-product'>
        <button onClick={handleAddProductClick}>Add More Product</button>
      </div>
    </div>
  );
}

export default Products;