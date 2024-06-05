import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import AddProduct from './AddProduct'; // Import the AddProduct component
import ProductCard from './ProductCard'; // Import the ProductCard component
import EditProductModal from './EditProductModal'; // Import the EditProductModal component
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

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

  const handleCloseModal = () => {
    setEditingProduct(null); // Close the modal
  };

  const handleSaveClick = async (updatedProduct) => {
    try {
      await updateDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
      setProducts(products.map(product =>
        product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product
      ));
      setEditingProduct(null); // Close the modal after saving
    } catch (error) {
      console.error('Error updating product:', error);
    }
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
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSaveClick}
        />
      )}

      <div className='add-product'>
        <button onClick={() => setEditingProduct({})}>Add More Product</button>
        </div>
    </div>
  );
}

export default Products;


// import React, { useState, useEffect } from 'react';
// import { db } from '../services/firebase';
// import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
// import AddProduct from './AddProduct'; // Import the AddProduct component
// import ProductCard from './ProductCard'; // Import the ProductCard component
// import './Products.css';

// function Products() {
//   const [products, setProducts] = useState([]);
//   const [editingProductId, setEditingProductId] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const productsSnapshot = await getDocs(collection(db, 'products'));
//         const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setProducts(productsData);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       }
//     };
//     fetchProducts();
//   }, []);

//   const handleEditClick = (productId) => {
//     setEditingProductId(productId);
//   };

//   const handleSaveClick = async (productId, updatedData) => {
//     try {
//       await updateDoc(doc(db, 'products', productId), updatedData);
//       setProducts(products.map(product => 
//         product.id === productId ? { ...product, ...updatedData } : product
//       ));
//       setEditingProductId(null); // Exit edit mode
//     } catch (error) {
//       console.error('Error updating product:', error);
//     }
//   };

//   return (
//     <div className="product-list">
//       <h2>Products</h2>
//       <AddProduct /> {/* Render the AddProduct component */}

//       <div className="product-grid">
//         {products.map(product => (
//           <ProductCard
//             key={product.id}
//             product={product}
//             onEditClick={handleEditClick}
//             onSaveClick={handleSaveClick}
//             editing={editingProductId === product.id}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
// export default Products;
