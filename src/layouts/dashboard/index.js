import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function OrdersDashboard() {
  const navigate = useNavigate();
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

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Navigate to a specific order status page
   * @param {string} status The order status (e.g. "newOrders", "pendingOrders", etc.)
   */
  /*******  fd9666f4-0e96-440d-907a-30d56554e024  *******/

  const handleNavigate = (status) => {
    navigate(`/${status}`);
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

          {/* Medicine Orders Section */}
          <Grid item xs={12}>
            <MDTypography variant="h4" textAlign="left" mb={2} ml={2}>
              Medicine Orders
            </MDTypography>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">New Order</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.newOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">Pending Order</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.pendingOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">Completed Order</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.completedOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">Partial Order</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.partiallyDeliveredOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">call to modify Order</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.newOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">return request</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.newOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("report")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6"> How to take medicine</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.newOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
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
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">New Order</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.newOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">Pending Orders</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.pendingOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">Completed Orders</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.completedOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">Partial Orders</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.partiallyDeliveredOrders}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card onClick={() => handleNavigate("order")} sx={{ cursor: "pointer" }}>
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
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrdersDashboard;
