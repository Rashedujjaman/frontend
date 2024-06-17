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
