import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { CSVLink } from "react-csv";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { CircularProgress } from "@mui/material";
import "./Report.css";
import {
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
} from "recharts";

function Report() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Start of the month
  );
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState(null);
  const barChartColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#FF8042",
    "#9966FF",
    "#4CAF50",
  ];
  const pieChartColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#FF8042",
    "#ea2658",
  ];

  useEffect(() => {
    const fetchReportData = async () => {
      if (startDate && endDate && startDate <= endDate) {
        setLoading(true);
        setError(null);

        try {
          const start = Timestamp.fromDate(startDate);
          const end = Timestamp.fromDate(endDate);

          const ordersQuery = query(
            collection(db, "orders"),
            where("orderTime", ">=", start),
            where("orderTime", "<=", end),
            orderBy("orderTime")
          );

          const ordersSnapshot = await getDocs(ordersQuery);
          const data = ordersSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            orderTime: doc.data().orderTime.toDate(), // Convert to Date object
          }));

          setReportData(data);
        } catch (error) {
          console.error("Error fetching report data:", error);
          setError("An error occurred while fetching data.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReportData();
  }, [startDate, endDate]);

  useEffect(() => {
    window.onpopstate = () => {
      navigate("/dashboard");
    };
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { field: "id", headerName: "Order ID", width: 150 },
    { field: "name", headerName: "Customer Name", width: 200 },
    { field: "totalAmount", headerName: "Total Amount", width: 150 },
    {
      field: "orderTime",
      headerName: "Order Date",
      width: 200,
      type: "dateTime",
      valueFormatter: (params) =>
        params.value && format(params.value, "dd/MM/yyyy HH:mm"),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
    },
    {
      field: "paymentMethod",
      headerName: "Payment Method",
      width: 200,
    },
    {
      field: "mobile",
      headerName: "Mobile No",
      width: 150,
      //Optional: Add a custom cell renderer to make the address easier to read
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
    },
    {
      field: "email",
      headerName: "Email Address",
      width: 250,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
    },
  ];
  // Chart Data Preparation
  // Top Customers by Spending
  const customerSpending = reportData.reduce((acc, order) => {
    const customer = order.name;
    acc[customer] = (acc[customer] || 0) + order.totalAmount;
    return acc;
  }, {});

  // Sort customers by spending (descending) and take top 5
  const topCustomers = Object.entries(customerSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sales]) => ({ name, sales }));

  // Top Selling Products by Sales Value
  const productSales = reportData.reduce((acc, order) => {
    order.items.forEach((product) => {
      // Changed 'products' to 'items'
      acc[product.productName] =
        (acc[product.productName] || 0) + product.quantity * product.price;
    });
    return acc;
  }, {});

  const topSellingProductsData = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productName, salesValue]) => ({ productName, salesValue }));

  // Weekly sales calculation based on orderTime
  const weeklySales = reportData.reduce((acc, order) => {
    const date = format(order.orderTime, "yyyy-MM-dd");
    acc[date] = (acc[date] || 0) + order.totalAmount;
    return acc;
  }, {});
  const dailySalesData = Object.entries(weeklySales).map(([date, sales]) => ({
    date,
    sales,
  }));

  return (
    <div className="report-container">
      <h2 className="report-header">Sales Report</h2>

      <div className="date-filters">
        <input
          type="date"
          value={format(startDate, "yyyy-MM-dd")}
          onChange={(e) => setStartDate(new Date(e.target.value))}
        />
        <input
          type="date"
          value={format(endDate, "yyyy-MM-dd")}
          onChange={(e) => setEndDate(new Date(e.target.value))}
        />
        <Button variant="contained" onClick={handlePrint}>
          Print
        </Button>
        <CSVLink
          className="csvLink"
          data={reportData}
          filename={`sales_report_${format(startDate, "yyyy-MM-dd")}-${format(
            endDate,
            "yyyy-MM-dd"
          )}.csv`}
        >
          Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <DataGrid
          rows={reportData}
          columns={columns}
          autoHeight
          getRowClassName={(params) =>
            params.row.totalAmount < 250
              ? "row-red-background"
              : "row-green-background"
          }
          components={{ Toolbar: GridToolbar }}
          sx={{
            width: "100%",
            "& .row-red-background": { backgroundColor: "#ffdddd" },
            "& .row-green-background": { backgroundColor: "#ddffdd" },
            "& .MuiDataGrid-footerContainer": {
              // Target the footer
              backgroundColor: "#f0f0f0", // Apply your custom background color
            },
          }}
        />
      )}
      {!loading && !error && (
        <div className="chart-container">
          <div className="chart-section">
            <h3>Weekly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#28a745"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h3>Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingProductsData}> 
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="salesValue" fill="#82ca9d"> 
                  {topSellingProductsData.map((entry, index) => (
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
            <h3>Top Customers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8">
                  {topCustomers.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barChartColors[index % barChartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Report;
