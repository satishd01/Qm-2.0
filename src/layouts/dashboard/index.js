import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Grid, Switch, FormControlLabel } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function OrdersDashboard() {
  const navigate = useNavigate();
  const [showGraphicalView, setShowGraphicalView] = useState(false);
  const [vendorCounts, setVendorCounts] = useState({
    newOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    partiallyDeliveredOrders: 0,
    callToModifyOrders: 0,
    returnOrderRequests: 0,
    howToTakeMedicineOrders: 0,
    eConsultationOrders: 0,
    uploadedInvoices: 0,
  });

  console.log("Vendor Counts:", vendorCounts);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch("https://quickmeds.sndktech.online/adminOrdersCount", {
          headers: {
            "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          },
        });
        const data = await response.json();
        if (data.status) {
          setVendorCounts({
            newOrders: data.data.statusCounts.newOrders,
            pendingOrders: data.data.statusCounts.pendingOrders,
            completedOrders: data.data.statusCounts.acceptedOrders,
            partiallyDeliveredOrders: data.data.statusCounts.partiallyDeliveredOrders,
            callToModifyOrders: data.data.statusCounts.callToModifyOrders,
            returnOrderRequests: data.data.statusCounts.returnOrderRequests,
            howToTakeMedicineOrders: data.data.statusCounts.howToTakeMedicineOrders,
            eConsultationOrders: data.data.statusCounts.eConsultationOrders,
            uploadedInvoices: data.data.totalUploadedInvoices,
          });
        }
      } catch (error) {
        console.error("Error fetching order counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const handleNavigate = (status) => {
    navigate(`/${status}`);
  };

  const toggleView = () => {
    setShowGraphicalView(!showGraphicalView);
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
          vendorCounts.newOrders,
          vendorCounts.pendingOrders,
          vendorCounts.completedOrders,
          vendorCounts.partiallyDeliveredOrders,
          vendorCounts.callToModifyOrders,
          vendorCounts.returnOrderRequests,
          vendorCounts.howToTakeMedicineOrders,
          vendorCounts.eConsultationOrders,
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
          vendorCounts.newOrders,
          vendorCounts.pendingOrders,
          vendorCounts.completedOrders,
          vendorCounts.partiallyDeliveredOrders,
          vendorCounts.callToModifyOrders,
          vendorCounts.uploadedInvoices,
          vendorCounts.uploadedInvoices,
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

  const totalMedicineOrders =
    vendorCounts.newOrders +
    vendorCounts.pendingOrders +
    vendorCounts.completedOrders +
    vendorCounts.partiallyDeliveredOrders;

  const totalLabOrders =
    vendorCounts.newOrders +
    vendorCounts.pendingOrders +
    vendorCounts.completedOrders +
    vendorCounts.partiallyDeliveredOrders;

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

          {/* Toggle Switch */}
          <Grid item xs={12} textAlign="right">
            <FormControlLabel
              control={<Switch checked={showGraphicalView} onChange={toggleView} color="primary" />}
              label={showGraphicalView ? "Graphical View" : "Card View"}
            />
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

              {/* Pie Charts for Summary */}
              <Grid item xs={12} md={6} mt={4}>
                <Card>
                  <MDBox p={2} height="400px">
                    <Pie
                      data={{
                        labels: ["Medicine Orders", "Lab Orders"],
                        datasets: [
                          {
                            data: [totalMedicineOrders, totalLabOrders],
                            backgroundColor: ["#36A2EB", "#FFCE56"],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Total Orders Distribution",
                          },
                        },
                      }}
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

              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("medicine-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">New Order</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("medicine-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Pending Order</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.pendingOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("medicine-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Completed Order</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.completedOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("medcine-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Partial Order</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.partiallyDeliveredOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("medicine-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Call To Modify Order</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("medicine-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Return Request</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("medicine-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6"> How To Take Medicine</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("medicine-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">E-cosultation</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("report")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Uploaded Invoice</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>

              {/* Lab Orders Section */}
              <Grid item xs={12} mt={1}>
                <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
                  Lab Orders
                </MDTypography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("lab-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">New Order</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("lab-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Pending Orders</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.pendingOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("lab-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Completed Orders</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.completedOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("lab-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Partial Orders</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.partiallyDeliveredOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("lab-order")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">call to modify Order</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("report")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Uploaded Lab reports</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card onClick={() => handleNavigate("report")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Uploaded invoices</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={14} md={3}>
                <Card onClick={() => handleNavigate("health-insurance")} sx={{ cursor: "pointer" }}>
                  <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6">Health Insuranse</MDTypography>
                    <MDTypography variant="h4" color="primary">
                      {vendorCounts.newOrders}
                    </MDTypography>
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
