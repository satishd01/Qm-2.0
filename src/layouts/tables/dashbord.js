import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Box,
  IconButton,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import DataTable from "examples/Tables/DataTable";
import FilterListIcon from "@mui/icons-material/FilterList";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const periodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

function OrdersDashboard() {
  const navigate = useNavigate();
  const [showGraphicalView, setShowGraphicalView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    medicineOrders: {
      newOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      partiallyDeliveredOrders: 0,
      callToModifyOrders: 0,
      returnOrderRequests: 0,
      howToTakeMedicineOrders: 0,
      eConsultationOrders: 0,
    },
    labOrders: {
      newOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      partiallyDeliveredOrders: 0,
      callToModifyOrders: 0,
      uploadedReports: 0,
      uploadedInvoices: 0,
    },
    payments: {
      data: [],
      totalAmount: 0,
      totalTransactions: 0,
    },
  });
  const [paymentPeriod, setPaymentPeriod] = useState("monthly");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const baseUrl = "https://quickmeds.sndktech.online";
  const xAuthHeader = "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Build URL with parameters
      const params = new URLSearchParams();
      params.append("period", paymentPeriod);

      if (showDateFilter && dateRange.startDate && dateRange.endDate) {
        params.append("startDate", dateRange.startDate);
        params.append("endDate", dateRange.endDate);
      }

      // Fetch order counts
      const ordersResponse = await fetch(`${baseUrl}/adminOrdersCount?${params.toString()}`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const ordersData = await ordersResponse.json();

      // Fetch payments data
      const paymentsResponse = await fetch(`${baseUrl}/payments.received?${params.toString()}`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const paymentsData = await paymentsResponse.json();

      if (ordersData.status && paymentsData.status) {
        setStats({
          medicineOrders: {
            newOrders: ordersData.data.statusCounts.newOrders,
            pendingOrders: ordersData.data.statusCounts.pendingOrders,
            completedOrders: ordersData.data.statusCounts.acceptedOrders,
            partiallyDeliveredOrders: ordersData.data.statusCounts.partiallyDeliveredOrders,
            callToModifyOrders: ordersData.data.statusCounts.callToModifyOrders,
            returnOrderRequests: ordersData.data.statusCounts.returnOrderRequests,
            howToTakeMedicineOrders: ordersData.data.statusCounts.howToTakeMedicineOrders,
            eConsultationOrders: ordersData.data.statusCounts.eConsultationOrders,
          },
          labOrders: {
            newOrders: ordersData.data.testBookingStatusCounts.newOrderTestBookings,
            pendingOrders: ordersData.data.testBookingStatusCounts.pendingTestBookings,
            completedOrders: ordersData.data.testBookingStatusCounts.completedTestBookings,
            partiallyDeliveredOrders:
              ordersData.data.testBookingStatusCounts.partiallyDeliveredTestBookings,
            callToModifyOrders: ordersData.data.testBookingStatusCounts.callToModifyTestBookings,
            uploadedReports: ordersData.data.totalLabReportUploads,
            uploadedInvoices: ordersData.data.totalUploadedInvoices,
          },
          payments: {
            data: paymentsData.data,
            totalAmount: paymentsData.totalAmount,
            totalTransactions: paymentsData.total,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paymentPeriod, showDateFilter, dateRange]);

  const handleNavigate = (status) => {
    navigate(`/${status}`);
  };

  const toggleView = () => {
    setShowGraphicalView(!showGraphicalView);
  };

  const handlePaymentPeriodChange = (event, newValue) => {
    setPaymentPeriod(newValue);
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const resetFilters = () => {
    setPaymentPeriod("monthly");
    setDateRange({ startDate: "", endDate: "" });
    setShowDateFilter(false);
    // No need to call fetchData here as the useEffect will trigger it
  };

  // Data for charts
  const medicineOrderData = {
    labels: [
      "New",
      "Pending",
      "Completed",
      "Partial",
      "Modify",
      "Return",
      "How to Take",
      "E-Consult",
    ],
    datasets: [
      {
        label: "Medicine Orders",
        data: [
          stats.medicineOrders.newOrders,
          stats.medicineOrders.pendingOrders,
          stats.medicineOrders.completedOrders,
          stats.medicineOrders.partiallyDeliveredOrders,
          stats.medicineOrders.callToModifyOrders,
          stats.medicineOrders.returnOrderRequests,
          stats.medicineOrders.howToTakeMedicineOrders,
          stats.medicineOrders.eConsultationOrders,
        ],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC24A",
          "#607D8B",
        ],
      },
    ],
  };

  const labOrderData = {
    labels: ["New", "Pending", "Completed", "Partial", "Modify", "Reports", "Invoices"],
    datasets: [
      {
        label: "Lab Orders",
        data: [
          stats.labOrders.newOrders,
          stats.labOrders.pendingOrders,
          stats.labOrders.completedOrders,
          stats.labOrders.partiallyDeliveredOrders,
          stats.labOrders.callToModifyOrders,
          stats.labOrders.uploadedReports,
          stats.labOrders.uploadedInvoices,
        ],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC24A",
        ],
      },
    ],
  };

  const paymentData = {
    labels: stats.payments.data.map((payment) => payment.orderId || "N/A"),
    datasets: [
      {
        label: "Payment Amount",
        data: stats.payments.data.map((payment) => payment.amount),
        backgroundColor: "#4BC0C0",
        borderColor: "#4BC0C0",
        tension: 0.1,
      },
    ],
  };

  // Payment table columns
  const paymentColumns = [
    { Header: "Order ID", accessor: "orderId", width: "25%" },
    { Header: "Amount", accessor: "amount", width: "25%" },
    { Header: "Payment Method", accessor: "transactionType", width: "25%" },
  ];

  // Format payment data for table
  const paymentTableData = useMemo(() => {
    return {
      columns: paymentColumns,
      rows: stats.payments.data.map((payment) => ({
        orderId: payment.orderId || "N/A",
        amount: `₹${payment.amount}`,
        date: payment.date,
        method: payment.method || "Unknown",
      })),
    };
  }, [stats.payments.data]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={0} pb={3}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <MDTypography variant="h3" textAlign="center" mb={4}>
              DASHBOARD
            </MDTypography>
          </Grid>

          {/* View Toggle and Filters */}
          <Grid item xs={12}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={
                  <Switch checked={showGraphicalView} onChange={toggleView} color="primary" />
                }
                label={showGraphicalView ? "Graphical View" : "Card View"}
              />

              <MDBox display="flex" alignItems="center">
                <IconButton onClick={toggleDateFilter} color="primary">
                  <FilterListIcon />
                </IconButton>
                {showDateFilter && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
                    <input
                      type="date"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateChange}
                      style={{ padding: "2px", borderRadius: "1px", border: "1px solid #ccc" }}
                    />
                    <input
                      type="date"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateChange}
                      style={{ padding: "2px", borderRadius: "1px", border: "1px solid #ccc" }}
                    />
                    <button
                      onClick={applyFilters}
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    >
                      Apply
                    </button>
                    <button
                      onClick={resetFilters}
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "#f5f5f5",
                        color: "#333",
                        border: "1px solid #ccc",
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                  </Box>
                )}
                <Tabs
                  value={paymentPeriod}
                  onChange={handlePaymentPeriodChange}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ ml: 2 }}
                >
                  {periodOptions.map((option) => (
                    <Tab key={option.value} label={option.label} value={option.value} />
                  ))}
                </Tabs>
              </MDBox>
            </MDBox>
          </Grid>

          {showGraphicalView ? (
            // Graphical View
            <>
              {/* Medicine Orders Chart */}
              <Grid item xs={12}>
                <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
                  Medicine Orders
                </MDTypography>
                <Card>
                  <MDBox p={2} height="400px">
                    <Bar
                      data={medicineOrderData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Medicine Orders Overview",
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Card>
              </Grid>

              {/* Lab Orders Chart */}
              <Grid item xs={12} mt={4}>
                <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
                  Lab Orders
                </MDTypography>
                <Card>
                  <MDBox p={2} height="400px">
                    <Bar
                      data={labOrderData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Lab Orders Overview",
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Card>
              </Grid>

              {/* Payments Chart */}
              <Grid item xs={12} mt={4}>
                <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
                  Earning
                </MDTypography>
                <Card>
                  <MDBox p={2} height="400px">
                    <Line
                      data={paymentData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: `Earning (${paymentPeriod})`,
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Card>
              </Grid>

              {/* Payments Table */}
              <Grid item xs={12} mt={4}>
                <Card>
                  <MDBox p={2}>
                    <MDTypography variant="h5" mb={2}>
                      Earning Details
                    </MDTypography>
                    <DataTable
                      table={paymentTableData}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={true}
                      noEndBorder
                    />
                  </MDBox>
                </Card>
              </Grid>
            </>
          ) : (
            // Card View
            <>
              {/* Medicine Orders Section */}
              <Grid item xs={12}>
                <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
                  Medicine Orders
                </MDTypography>
              </Grid>

              {[
                { label: "New Orders", value: stats.medicineOrders.newOrders },
                { label: "Pending Orders", value: stats.medicineOrders.pendingOrders },
                { label: "Completed Orders", value: stats.medicineOrders.completedOrders },
                { label: "Partial Orders", value: stats.medicineOrders.partiallyDeliveredOrders },
                { label: "Call To Modify", value: stats.medicineOrders.callToModifyOrders },
                { label: "Return Requests", value: stats.medicineOrders.returnOrderRequests },
                {
                  label: "How To Take Medicine",
                  value: stats.medicineOrders.howToTakeMedicineOrders,
                },
                { label: "E-Consultation", value: stats.medicineOrders.eConsultationOrders },
              ].map((item, index) => (
                <Grid item xs={12} md={3} key={`medicine-${index}`}>
                  <Card
                    onClick={() => handleNavigate("medicine-order")}
                    sx={{ cursor: "pointer", height: "100%" }}
                  >
                    <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="h6">{item.label}</MDTypography>
                      <MDTypography variant="h4" color="primary">
                        {item.value}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              ))}

              {/* Lab Orders Section */}
              <Grid item xs={12} mt={4}>
                <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
                  Lab Orders
                </MDTypography>
              </Grid>

              {[
                { label: "New Orders", value: stats.labOrders.newOrders },
                { label: "Pending Orders", value: stats.labOrders.pendingOrders },
                { label: "Completed Orders", value: stats.labOrders.completedOrders },
                { label: "Partial Orders", value: stats.labOrders.partiallyDeliveredOrders },
                { label: "Call To Modify", value: stats.labOrders.callToModifyOrders },
                { label: "Uploaded Reports", value: stats.labOrders.uploadedReports },
                { label: "Uploaded Invoices", value: stats.labOrders.uploadedInvoices },
                { label: "Health Insurance", value: stats.labOrders.uploadedInvoices },
              ].map((item, index) => (
                <Grid item xs={12} md={3} key={`lab-${index}`}>
                  <Card
                    onClick={() =>
                      handleNavigate(
                        item.label === "Uploaded Reports" || item.label === "Uploaded Invoices"
                          ? "report"
                          : item.label === "Health Insurance"
                            ? "health-insurance"
                            : "lab-order"
                      )
                    }
                    sx={{ cursor: "pointer", height: "100%" }}
                  >
                    <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="h6">{item.label}</MDTypography>
                      <MDTypography variant="h4" color="primary">
                        {item.value}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              ))}

              {/* Payments Section */}
              <Grid item xs={12} mt={4}>
                <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
                  Earning
                </MDTypography>
                <Card>
                  <MDBox p={2}>
                    <MDBox display="flex" justifyContent="space-between" mb={2}>
                      <MDTypography variant="h5">
                        Total Amount: ₹{stats.payments.totalAmount}
                      </MDTypography>
                      <MDTypography variant="h5">
                        Total Transactions: {stats.payments.totalTransactions}
                      </MDTypography>
                    </MDBox>
                    <DataTable
                      table={paymentTableData}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={true}
                      noEndBorder
                    />
                  </MDBox>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrdersDashboard;
