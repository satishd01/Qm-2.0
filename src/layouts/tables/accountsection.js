import React, { useState, useEffect } from "react";
import {
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

const PaymentTransactions = () => {
  const [receivedPayments, setReceivedPayments] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({ admins: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("03-2025");
  const [entityType, setEntityType] = useState("All");

  const entityTypes = [
    "All",
    "Medicine Vendor",
    "Lab Vendor",
    "Lab Delivery",
    "Medicine Delivery",
    "Admin",
  ];

  // Fetch received payments
  useEffect(() => {
    const fetchReceivedPayments = async () => {
      try {
        const response = await fetch(
          `https://quickmeds.sndktech.online/payments.received?period=${period}`,
          {
            headers: {
              "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzE2NzQ1Mzg1LCJleHAiOjE3NDgzMDI5ODV9.5wRlYbaliLtMW57h7YCASiJZsESXS1Ouo6i48zuIyTI",
            },
          }
        );
        const data = await response.json();
        if (data.status) {
          setReceivedPayments(data.data);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchReceivedPayments();
  }, [period]);

  // Fetch transaction summary
  useEffect(() => {
    const fetchTransactionSummary = async () => {
      try {
        const response = await fetch(
          "https://quickmeds.sndktech.online/adminOrder/transactionSummary?type=Admin",
          {
            headers: {
              "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.status) {
          setTransactionSummary(data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionSummary();
  }, []);

  // Filter payments based on selected entity type
  const filteredPayments = receivedPayments.filter((payment) => {
    if (entityType === "All") return true;
    if (entityType === "Medicine Vendor" || entityType === "Lab Vendor") {
      return payment.vendorInfo?.vendor_type === entityType;
    }
    if (entityType === "Medicine Delivery" || entityType === "Lab Delivery") {
      return payment.deliveryPartnerId !== null;
    }
    if (entityType === "Admin") {
      return payment.adminId !== null;
    }
    return true;
  });

  // Calculate total received amount
  const totalReceived = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Columns for received payments table
  const paymentColumns = [
    { Header: "ID", accessor: "id", width: "5%" },
    { Header: "Order ID", accessor: "orderId", width: "10%" },
    { Header: "Entity", accessor: "entity", width: "20%" },
    { Header: "Type", accessor: "type", width: "10%" },
    { Header: "Amount", accessor: "amount", width: "10%" },
    { Header: "Status", accessor: "status", width: "10%" },
    { Header: "Transaction Type", accessor: "transactionType", width: "15%" },
    { Header: "Date", accessor: "createdAt", width: "20%" },
  ];

  // Prepare payment data for table
  const paymentData = filteredPayments.map((payment) => ({
    id: payment.id,
    orderId: payment.orderId,
    entity: payment.vendorInfo
      ? `${payment.vendorInfo.businessName || payment.vendorInfo.shop_name} (${payment.vendorInfo.vendor_type})`
      : payment.deliveryPartnerId
        ? `Delivery Partner #${payment.deliveryPartnerId}`
        : payment.adminId
          ? `Admin #${payment.adminId}`
          : "Unknown",
    type: payment.type,
    amount: `₹${payment.amount.toFixed(2)}`,
    status: payment.status,
    transactionType: payment.transactionType,
    createdAt: formatDate(payment.createdAt),
  }));

  // Prepare vendor summary data
  const vendorSummary = Object.values(
    receivedPayments
      .filter((p) => p.vendorInfo)
      .reduce((acc, payment) => {
        const vendorId = payment.vendorInfo.id;
        if (!acc[vendorId]) {
          acc[vendorId] = {
            vendor: payment.vendorInfo,
            total: 0,
            count: 0,
          };
        }
        acc[vendorId].total += payment.amount;
        acc[vendorId].count++;
        return acc;
      }, {})
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDTypography variant="h3" textAlign="center" mb={4}>
              Payment Transactions
            </MDTypography>
          </Grid>

          {/* Filters */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="period-select-label">Period</InputLabel>
              <Select
                labelId="period-select-label"
                value={period}
                label="Period"
                onChange={(e) => setPeriod(e.target.value)}
                sx={{ width: 350, height: 45 }}
              >
                <MenuItem value="03-2025">March 2025</MenuItem>
                <MenuItem value="02-2025">February 2025</MenuItem>
                <MenuItem value="01-2025">January 2025</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="entity-type-label">Entity Type</InputLabel>
              <Select
                labelId="entity-type-label"
                value={entityType}
                label="Entity Type"
                onChange={(e) => setEntityType(e.target.value)}
                sx={{ width: 350, height: 45 }}
              >
                {entityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Total Received</MDTypography>
                <MDTypography variant="h4" color="success">
                  ₹{totalReceived.toFixed(2)}
                </MDTypography>
                <MDTypography variant="caption">For {period}</MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Admin Balance</MDTypography>
                <MDTypography variant="h4" color="primary">
                  ₹{transactionSummary.admins?.[0]?.currentAmount?.toFixed(2) || "0.00"}
                </MDTypography>
                <MDTypography variant="caption">Current Amount</MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Transactions</MDTypography>
                <MDTypography variant="h4">{filteredPayments.length}</MDTypography>
                <MDTypography variant="caption">Total Records</MDTypography>
              </MDBox>
            </Card>
          </Grid>

          {/* Received Payments Table */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" mb={2}>
                  Received Payments
                </MDTypography>
                {loading ? (
                  <MDTypography>Loading...</MDTypography>
                ) : error ? (
                  <MDTypography color="error">{error}</MDTypography>
                ) : (
                  <DataTable
                    table={{ columns: paymentColumns, rows: paymentData }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={true}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Transaction Summary */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" mb={2}>
                  Outgoing Payments
                </MDTypography>
                <Grid container spacing={3}>
                  {/* Admin Summary */}
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6">Admin Transactions</MDTypography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Admin</TableCell>
                            <TableCell align="right">Total Credit</TableCell>
                            <TableCell align="right">Total Debit</TableCell>
                            <TableCell align="right">Balance</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactionSummary.admins?.map((admin, index) => (
                            <TableRow key={index}>
                              <TableCell>{admin.admin.email}</TableCell>
                              <TableCell align="right">₹{admin.totalCredit.toFixed(2)}</TableCell>
                              <TableCell align="right">₹{admin.totalDebit.toFixed(2)}</TableCell>
                              <TableCell align="right">₹{admin.currentAmount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  {/* Vendor Summary */}
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6">Vendor Transactions</MDTypography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Vendor</TableCell>
                            <TableCell align="right">Type</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="right">Transactions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vendorSummary.map((vendorData, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {vendorData.vendor.businessName || vendorData.vendor.shop_name}
                              </TableCell>
                              <TableCell align="right">{vendorData.vendor.vendor_type}</TableCell>
                              <TableCell align="right">₹{vendorData.total.toFixed(2)}</TableCell>
                              <TableCell align="right">{vendorData.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default PaymentTransactions;
