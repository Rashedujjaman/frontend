import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import OrderDetailsModal from "./OrderDetailsModal";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Add orderBy query to sort by orderTime descending
        const ordersQuery = query(collection(db, "orders"), orderBy("orderTime", "desc"));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const handleOrderClick = (order) => {
    setSelectedOrder(order); // Set the selected order to show in the modal
  };

  return (
    <div className="orders-container">
      <h2>Orders</h2>
      <div className="order-list">
        {orders.map((order) => (
          <div
            key={order.id}
            className="order-card"
            onClick={() => handleOrderClick(order)}
          >
            {/* Basic order information (e.g., order ID, customer name, date) */}
            <h3>Order ID: {order.id}</h3>
            <p>Customer: {order.name}</p>
            <p>Amount: {order.totalAmount} BDT</p>
            <p>
              Date: {order.orderTime.toDate().toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

export default Orders;
