import React from "react";
import "./OrderDetailsModal.css";

function OrderDetailsModal({ order, onClose }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Order Details</h2>
        <p>
          <strong>Order No:</strong> {order.id}
        </p>
        <p>
          <strong>Date and Time:</strong> {order.orderTime.toDate().toLocaleString()}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment Method:</strong> {order.paymentMethod} 
        </p>
        <p>
          <strong>Valid ID:</strong> {order.valId}
        </p>
        <p>
          <strong>Total Amount:</strong> {order.totalAmount.toFixed(2)} BDT
        </p>
        <p>
          <strong>Discount:</strong> {order.discount.toFixed(2)} BDT
        </p>
        <p>
          <strong>Paid:</strong> {order.adjustedTotal.toFixed(2)} BDT
        </p>
        <p>
          <strong>Earned Loyalty Points:</strong> {order.earnedLoyaltyPoints}
        </p>
        {/* You'll need to add logic to fetch and display the payment method */}

        <p>
          <strong>Customer Name:</strong> {order.name}
        </p>
        <p>
          <strong>Email:</strong> {order.email}
        </p>
        <p>
          <strong>Mobile:</strong> {order.mobile}
        </p>
        
        <h3>Items:</h3>
        <ul className="item-list">
          {order.items.map((item) => (
            <li key={item.id} className="order-item">
              <img src={item.imageUrl} alt={item.productName} className="item-image" />
              <div className="item-details">
                <strong>Product:</strong> {item.productName}<br />
                <strong>Variant:</strong> {item.amount} {item.variantName}<br />
                <strong>Quantity:</strong> {item.quantity}<br />
                <strong>Price:</strong> {item.price.toFixed(2)} BDT<br />
                <strong>Voucher Code:</strong> {item.voucherCode}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
