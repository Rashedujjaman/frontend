import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomersAndOrders = async () => {
      try {
        // Fetch customers
        const customerSnapshot = await getDocs(collection(db, "Customers"));
        const customerData = [];
        const customerIds = [];

        customerSnapshot.forEach((doc) => {
          const data = doc.data();
          customerData.push({ id: doc.id, ...data });
          customerIds.push(doc.id);
        });

        // Fetch orders
        const orderSnapshot = await getDocs(collection(db, "orders"));
        const orders = {};
        const totalAmountSpent = {};
        
        orderSnapshot.forEach((doc) => {
          const data = doc.data();
          const customerId = data.uid;
          const orderAmount = data.adjustedTotal || 0;
          if (orders[customerId]) {
            orders[customerId]++;
            totalAmountSpent[customerId] += orderAmount;

          } else {
            orders[customerId] = 1;
            totalAmountSpent[customerId] = orderAmount;
          }
        });

        // Combine customer data with order counts
        const customersWithOrders = customerData.map(customer => ({
          ...customer,
          orderCount: orders[customer.id] || 0,
          totalAmountSpent: totalAmountSpent[customer.id] || 0,
        }));

        setCustomers(customersWithOrders);
      } catch (error) {
        console.error("Error fetching customers and orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersAndOrders();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="customers">
      <h2>Total Customers: {customers.length}</h2>
      <div className="customer-list">
        {customers.map((customer) => (
          <div className="customer-card" key={customer.id}>
            <div className="customer-avatar">
              <div className="circle"><img src={customer.imageUrl} alt={customer.fullName} className="customer-image" /></div>
            </div>
            <div className="customer-details">
              <p><strong>Surname:</strong> {customer.username}</p>
              <p><strong>Name:</strong> {customer.fullName}</p>
              <p><strong>Phone:</strong> {customer.mobileNo}</p>
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Address:</strong> {customer.address}</p>
              <p><strong>Loyalty Points:</strong> {customer.rewardPoint}</p>
              <p><strong>Total Orders:</strong> {customer.orderCount}</p>
              <p><strong>Total Purchase:</strong> {customer.totalAmountSpent.toFixed(2)} BDT</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;