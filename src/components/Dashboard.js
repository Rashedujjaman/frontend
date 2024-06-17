import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Sparklines, SparklinesLine } from "react-sparklines";
import CountUp from "react-countup";
import "./Dashboard.css";

function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [bestBuyer, setBestBuyer] = useState(null);
  const [customersByAddress, setCustomersByAddress] = useState([]);
  const [productSalesData, setProductSalesData] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [currentOrderCount, setCurrentOrderCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total products
        const productsSnapshot = await getDocs(collection(db, "products"));
        setTotalProducts(productsSnapshot.size);

        // Fetch total orders
        const TotalOrdersSnapshot = await getDocs(collection(db, "orders"));
        setTotalOrders(TotalOrdersSnapshot.size);

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
        const buyerSales = {};
        ordersSnapshot.forEach((doc) => {
          monthlySales += doc.data().totalAmount;
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

        // Fetch customer data and group by address
        const customersSnapshot = await getDocs(collection(db, "Customers"));
        const addressCounts = {};
        customersSnapshot.forEach((doc) => {
          const address = doc.data().address || "Unknown";
          addressCounts[address] = (addressCounts[address] || 0) + 1;
        });
        setCustomersByAddress(
          Object.entries(addressCounts).map(([address, count]) => ({
            name: address,
            value: count,
          }))
        );

        // Fetch product sales data
        const productsSnapshotForSales = await getDocs(
          collection(db, "products")
        );
        const salesData = {};
        ordersSnapshot.forEach((orderDoc) => {
          orderDoc.data().items.forEach((item) => {
            const productName = item.productName;
            const itemTotal = item.quantity * item.price;
            salesData[productName] = (salesData[productName] || 0) + itemTotal;
          });
        });
        setProductSalesData(
          Object.entries(salesData).map(([name, sales]) => ({ name, sales }))
        );

        // Fetch daily sales data
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const dailySalesQuery = query(
          collection(db, "orders"),
          where("orderTime", ">=", sevenDaysAgo),
          where("orderTime", "<=", today)
        );

        const dailySalesSnapshot = await getDocs(dailySalesQuery);
        const salesByDay = {};
        dailySalesSnapshot.forEach((doc) => {
          const date = doc.data().orderTime.toDate().toDateString();
          salesByDay[date] = (salesByDay[date] || 0) + doc.data().totalAmount;
        });

        // Transform data into an array for Sparklines
        const salesDataArray = Object.entries(salesByDay).map(
          ([date, sales]) => ({
            date,
            sales: parseFloat(sales), // Convert sales to number
          })
        );

        console.log("Daily Sales Data:", salesDataArray); // Debugging line to check the data

        setDailySales(salesDataArray);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const barChartColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#FF8042",
    "#9966FF",
    "#4CAF50",
  ];

  // Colors for pie chart slices
  const pieChartColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#FF8042",
    "#ea2658",
  ];
  useEffect(() => {
    let currentCount = 0;
    const interval = setInterval(() => {
      currentCount = Math.min(currentCount + 1, totalOrders);
      setCurrentOrderCount(currentCount);
    }, 50);
    return () => clearInterval(interval);
  }, [totalOrders]);

  return (
    <div className="dashboard">
      <h2>Sales Dashboard</h2>

      <div className="summary-section">
        <div className="center-container">
          <div className="circle-card">
            <i className="fas fa-box"></i>
            <h4>Total Orders</h4>
            <CountUp end={totalOrders} duration={1.5} />
          </div>
          <div className="circle-card">
            <i className="fas fa-dollar-sign"></i>
            <h4>Total Sales</h4>
            <p>{totalSales.toFixed()}</p>
          </div>
        </div>

        {bestBuyer && (
          <div className="card highlight">
            {bestBuyer.imageUrl && (
              <div className="circle">
                <img
                  src={bestBuyer.imageUrl}
                  alt={`${bestBuyer.fullName}'s profile`}
                  className="buyer-photo"
                />
              </div>
            )}
            <h4>Best Buyer</h4>
            <p>{bestBuyer.fullName}</p>
          </div>
        )}
      </div>

      <div className="chart-section">
        <h3>Products by Sales Report</h3>
        <ResponsiveContainer width="50%" height={250}>
          <BarChart data={productSalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip dataKey="sales" />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8">
              {productSalesData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barChartColors[index % barChartColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h3>Customers by location</h3>
        <PieChart width={500} height={500}>
          <Pie
            data={customersByAddress}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
          >
            {customersByAddress.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={pieChartColors[index % pieChartColors.length]}
              />
            ))}
            <LabelList
              position="outside" // Place labels outside
              dataKey="value" // Use name as label text
              fill="#000000" // Set label color to white (or any color of your choice)
            />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
      <div className="summary-section">
        <h3>Weekly Sales Report</h3>
        <div className="line-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySales} className="line-chart">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#28a745" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
