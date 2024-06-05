// import React, { useState } from "react";
// import "./ProductCard.css";
// import EditProductModal from "./EditProductModal";
// export default ProductCard;

// function ProductCard({ product, onEditClick, onSaveClick, editing }) {
//   const [formData, setFormData] = useState({ ...product }); // Initialize with product data

//   const [showModal, setShowModal] = useState(false);

//   const handleEditClick = () => {
//     setShowModal(true); // Open the modal for editing
//   };

//   const handleCloseModal = () => {
//     setShowModal(false); // Close the modal
//     setFormData({ ...product }); // Reset form data on modal close
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const calculateStock = () => {
//     let totalStock = 0;
//     for (const variant in product.variant) {
//       totalStock += product.variant[variant].voucherCodes.length;
//     }
//     return totalStock;
//   };

//   return (
//     <div className="product-card">
//       <img
//         src={product.imageUrl}
//         alt={product.name}
//         className="product-image"
//       />
//       <h3>{product.name}</h3>
//       <p>Rating: {product.averageRating}</p> {/* Display rating */}
//       <p>Stock: {calculateStock()}</p> {/* Display stock */}
//       {/* Display other fields */}
//       <div className="card-actions">

//         <button onClick={handleEditClick}>Edit</button>
//       </div>
//       {showModal && (
//         <EditProductModal
//           product={product}
//           onClose={handleCloseModal}
//           onSave={onSaveClick}
//         />
//       )}
//     </div>
//   );
// }


import React from "react";
import "./ProductCard.css";

export default function ProductCard({ product, onEditClick }) {
  const calculateStock = () => {
    let totalStock = 0;
    for (const variant in product.variant) {
      totalStock += product.variant[variant].voucherCodes.length;
    }
    return totalStock;
  };

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} className="product-image" />
      <h3>{product.name}</h3>
      <p>Rating: {product.averageRating}</p> {/* Display rating */}
      <p>Stock: {calculateStock()}</p> {/* Display stock */}
      <div className="card-actions">
        <button onClick={() => onEditClick(product)}>Update</button>
      </div>
    </div>
  );
}
