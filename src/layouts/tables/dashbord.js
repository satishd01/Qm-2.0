import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  IconButton,
} from "@mui/material";
import { keyframes, styled } from "@mui/system";
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

// Enhanced blinking animation
const blink = keyframes`
  0% { opacity: 1; box-shadow: 0 0 0 0 rgba(255, 99, 132, 0.7); }
  50% { opacity: 0.7; box-shadow: 0 0 10px 5px rgba(255, 99, 132, 0.7); }
  100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255, 99, 132, 0.7); }
`;

const AnimatedCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "highlight",
})(({ highlight, theme }) => ({
  cursor: "pointer",
  height: "100%",
  transition: "all 0.3s ease",
  animation: highlight ? `${blink} 1s infinite` : "none",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[6],
  },
}));

function OrdersDashboard() {
  const navigate = useNavigate();
  const [showGraphicalView, setShowGraphicalView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalTestBookings: 0,
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
  const [highlightCards, setHighlightCards] = useState({
    medicineNew: false,
    labNew: false,
  });

  const prevStatsRef = useRef({
    totalOrders: null,
    totalTestBookings: null,
  });

  const isInitialMount = useRef(true); // Track initial mount

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
        const newStats = {
          totalOrders: ordersData.data.totalOrders,
          totalTestBookings: ordersData.data.totalTestBookings,
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
            healthInsuranceCount: ordersData.data.others?.healthInsuranceCount || 0,
            donateCount: ordersData.data.others?.donateCount || 0,
          },
          payments: {
            data: paymentsData.data,
            totalAmount: paymentsData.totalAmount,
            totalTransactions: paymentsData.total,
          },
        };

        console.log("Fetched stats:", newStats.totalOrders);
        console.log("prevStatsRef:", prevStatsRef.current.totalOrders);
        // Check for new medicine orders (totalOrders increased)
        setHighlightCards({
          medicineNew: ordersData.data.statusCounts.newOrdersBlink === true,
          labNew: ordersData.data.testBookingStatusCounts.newOrderTestBookingsBlink === true,
        });

        setStats(newStats);
        prevStatsRef.current = {
          totalOrders: newStats.totalOrders,
          totalTestBookings: newStats.totalTestBookings,
        };
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
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
  };

  // Data for charts
  const medicineOrderData = useMemo(
    () => ({
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
    }),
    [stats.medicineOrders]
  );

  const labOrderData = useMemo(
    () => ({
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
    }),
    [stats.labOrders]
  );

  const paymentData = useMemo(
    () => ({
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
    }),
    [stats.payments.data]
  );

  // Payment table columns
  const paymentColumns = useMemo(
    () => [
      { Header: "Order ID", accessor: "orderId", width: "25%" },
      { Header: "Amount", accessor: "amount", width: "25%" },
      { Header: "Payment Method", accessor: "transactionType", width: "25%" },
    ],
    []
  );

  // Format payment data for table
  const paymentTableData = useMemo(
    () => ({
      columns: paymentColumns,
      rows: stats.payments.data.map((payment) => ({
        orderId: payment.orderId || "N/A",
        amount: `₹${payment.amount}`,
        date: payment.date,
        method: payment.method || "Unknown",
      })),
    }),
    [stats.payments.data, paymentColumns]
  );

  if (loading && !prevStatsRef.current.totalOrders) {
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
                  Medicine Orders (Total: {stats.totalOrders})
                </MDTypography>
              </Grid>

              {[
                { label: "New Orders", value: stats.medicineOrders.newOrders, key: "newOrders" },
                {
                  label: "Pending Orders",
                  value: stats.medicineOrders.pendingOrders,
                  key: "pendingOrders",
                },
                {
                  label: "Completed Orders",
                  value: stats.medicineOrders.completedOrders,
                  key: "completedOrders",
                },
                {
                  label: "Partial Orders",
                  value: stats.medicineOrders.partiallyDeliveredOrders,
                  key: "partiallyDeliveredOrders",
                },
                {
                  label: "Call To Modify",
                  value: stats.medicineOrders.callToModifyOrders,
                  key: "callToModifyOrders",
                },
                {
                  label: "Return Requests",
                  value: stats.medicineOrders.returnOrderRequests,
                  key: "returnOrderRequests",
                },
                {
                  label: "How To Take Medicine",
                  value: stats.medicineOrders.howToTakeMedicineOrders,
                  key: "howToTakeMedicineOrders",
                },
                {
                  label: "E-Consultation",
                  value: stats.medicineOrders.eConsultationOrders,
                  key: "eConsultationOrders",
                },
              ].map((item) => (
                <Grid item xs={12} md={3} key={`medicine-${item.key}`}>
                  <AnimatedCard
                    onClick={() => handleNavigate("medicine-order")}
                    highlight={highlightCards.medicineNew && item.key === "newOrders"}
                  >
                    <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="h6">{item.label}</MDTypography>
                      <MDTypography
                        variant="h4"
                        color={
                          highlightCards.medicineNew && item.key === "newOrders"
                            ? "error"
                            : "primary"
                        }
                      >
                        {item.value}
                      </MDTypography>
                    </MDBox>
                  </AnimatedCard>
                </Grid>
              ))}

              {/* Lab Orders Section */}
              <Grid item xs={12} mt={4}>
                <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
                  Lab Orders (Total: {stats.totalTestBookings})
                </MDTypography>
              </Grid>

              {[
                { label: "New Orders", value: stats.labOrders.newOrders, key: "newOrders" },
                {
                  label: "Pending Orders",
                  value: stats.labOrders.pendingOrders,
                  key: "pendingOrders",
                },
                {
                  label: "Completed Orders",
                  value: stats.labOrders.completedOrders,
                  key: "completedOrders",
                },
                {
                  label: "Partial Orders",
                  value: stats.labOrders.partiallyDeliveredOrders,
                  key: "partiallyDeliveredOrders",
                },
                {
                  label: "Call To Modify",
                  value: stats.labOrders.callToModifyOrders,
                  key: "callToModifyOrders",
                },
                {
                  label: "Uploaded Reports",
                  value: stats.labOrders.uploadedReports,
                  key: "uploadedReports",
                },
                {
                  label: "Uploaded Invoices",
                  value: stats.labOrders.uploadedInvoices,
                  key: "uploadedInvoices",
                },
                {
                  label: "Health Insurance",
                  value: stats.labOrders.healthInsuranceCount,
                  key: "healthInsurance",
                },
                {
                  label: "Donation",
                  value: stats.labOrders.donateCount,
                  key: "donation",
                },
              ].map((item) => (
                <Grid item xs={12} md={3} key={`lab-${item.key}`}>
                  <AnimatedCard
                    onClick={() =>
                      handleNavigate(
                        item.key === "uploadedReports" || item.key === "uploadedInvoices"
                          ? "report"
                          : item.key === "healthInsurance"
                            ? "health-insurance"
                            : item.key === "donation"
                              ? "donation"
                              : "lab-order"
                      )
                    }
                    highlight={highlightCards.labNew && item.key === "newOrders"}
                  >
                    <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="h6">{item.label}</MDTypography>
                      <MDTypography
                        variant="h4"
                        color={
                          highlightCards.labNew && item.key === "newOrders" ? "error" : "primary"
                        }
                      >
                        {item.value}
                      </MDTypography>
                    </MDBox>
                  </AnimatedCard>
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
