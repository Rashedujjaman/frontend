import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore"; // Import doc
import "./Dashboard.css";

function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [TotalOrders, setTotalOrders] = useState(0); // Add state for total orders [1
  const [totalSales, setTotalSales] = useState(0);
  const [bestBuyer, setBestBuyer] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total products
        const productsSnapshot = await getDocs(collection(db, "products"));
        setTotalProducts(productsSnapshot.size);

        // Fetch total orders
        const TotalOrdersSnapshot = await getDocs(collection(db, "orders"));
        setTotalOrders(TotalOrdersSnapshot.size); // Set total orders [2]

        // Fetch total sales for the month (assuming 'orders' collection has a 'date' field)
        const currentMonth = new Date().getMonth();
        const ordersQuery = query(
          collection(db, "orders"),
          where(
            "orderTime",
            ">=",
            new Date(new Date().getFullYear(), currentMonth, 1)
          ),
          where(
            "orderTime",
            "<",
            new Date(new Date().getFullYear(), currentMonth + 1, 1)
          )
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        let monthlySales = 0;
        const buyerSales = {}; // Track sales per buyer
        ordersSnapshot.forEach((doc) => {
          monthlySales += doc.data().totalAmount; // Assuming 'total' is the order total
          const buyerId = doc.data().uid;
          buyerSales[buyerId] =
            (buyerSales[buyerId] || 0) + doc.data().totalAmount;
        });
        setTotalSales(monthlySales);

        // Find the best buyer
        const bestBuyerId = Object.keys(buyerSales).reduce((a, b) =>
          buyerSales[a] > buyerSales[b] ? a : b
        );
        const bestBuyerSnapshot = await getDoc(
          doc(db, "Customers", bestBuyerId)
        );

        setBestBuyer(bestBuyerSnapshot.data());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []); // Run this effect only once when the component mounts

  return (
    <div className="dashboard">
      <h2>Sales Dashboard</h2>
      <div className="center-container">
        <div className="circle-card">
          <i className="fas fa-box"></i> {/* Icon */}
          <h4>Total Orders</h4>
          <p>{TotalOrders}</p>
        </div>
        {/* <div className="card">
        <i className="fas fa-box"></i>
        <h4>Total Orders</h4>
        <p>{totalProducts}</p>
      </div> */}
        <div className="circle-card">
          <i className="fas fa-shopping-cart"></i>{" "}
          {/* Icon (using Font Awesome) */}
          <h4>Total Sales</h4>
          <p>{totalSales}</p>
        </div>
      </div>

      {bestBuyer && (
        <div className="card highlight">
          {/* Display photo if available */}
          {bestBuyer.imageUrl && (
            <div className="circle">
              <img
                src={bestBuyer.imageUrl}
                alt={`${bestBuyer.fullName}'s profile`}
                className="buyer-photo"
              />
            </div>
          )}

          {/* <i className="fa-solid fa-user"></i> */}
          <h4>Best Buyer</h4>
          <p>{bestBuyer.fullName}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
