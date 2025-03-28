import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Coupons() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newCoupon, setNewCoupon] = useState({
    couponCode: "",
    description: "",
    limitPerUser: 1,
    cartValue: 0,
    couponType: "labtest",
    discountValue: 0,
    startDateTime: "",
    endDateTime: "",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const couponTypes = [
    { value: "labtest", label: "Lab Test" },
    { value: "product", label: "Product" },
    { value: "delivery", label: "Delivery" },
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewCoupon({
      couponCode: "",
      description: "",
      limitPerUser: 1,
      cartValue: 0,
      couponType: "labtest",
      discountValue: 0,
      startDateTime: "",
      endDateTime: "",
    });
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(
        `${baseUrl}/coupon.get?page=${currentPage}&search=${searchTerm}`,
        {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch coupons");

      if (data?.status && data.coupons) {
        setCoupons(data.coupons);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      window.alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon({
      ...newCoupon,
      [name]: value,
    });
  };

  const handleCreateCoupon = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (
        !newCoupon.couponCode ||
        !newCoupon.discountValue ||
        !newCoupon.startDateTime ||
        !newCoupon.endDateTime
      ) {
        window.alert("Coupon Code, Discount Value, and Dates are required");
        return;
      }

      const response = await fetch(`${baseUrl}/coupon.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCoupon),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create coupon");

      window.alert("Coupon created successfully!");

      // Reset form and state
      setNewCoupon({
        couponCode: "",
        description: "",
        limitPerUser: 1,
        cartValue: 0,
        couponType: "labtest",
        discountValue: 0,
        startDateTime: "",
        endDateTime: "",
      });

      setCurrentPage(1);
      await fetchCoupons();
      handleClose();
    } catch (error) {
      console.error("Error creating coupon:", error);
      window.alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { Header: "Coupon Code", accessor: "couponCode" },
    { Header: "Description", accessor: "description" },
    { Header: "Type", accessor: "couponType" },
    { Header: "Discount", accessor: "discountValue", Cell: ({ value }) => `${value}%` },
    { Header: "Min Cart", accessor: "cartValue", Cell: ({ value }) => `₹${value}` },
    { Header: "Limit", accessor: "limitPerUser", Cell: ({ value }) => `${value} per user` },
    {
      Header: "Validity",
      accessor: "startDate",
      Cell: ({ row }) => (
        <div>
          {row.original.startDate !== "Invalid date"
            ? `${row.original.startDate} to ${row.original.endDate}`
            : "No date set"}
        </div>
      ),
    },
  ];

  const filteredCoupons = coupons.filter((coupon) => {
    const search = searchTerm.toLowerCase();
    return (
      (coupon.couponCode || "").toLowerCase().includes(search) ||
      (coupon.description || "").toLowerCase().includes(search) ||
      (coupon.couponType || "").toLowerCase().includes(search)
    );
  });

  if (loading && coupons.length === 0) {
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
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <MDTypography variant="h6" color="black">
                    Coupons
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Coupons"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      sx={{ width: 300 }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleOpen}
                      startIcon={<AddCircleIcon />}
                    >
                      Create Coupon
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredCoupons.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredCoupons }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {searchTerm ? "No matching coupons found" : "No coupons available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
              {totalPages > 1 && (
                <MDBox p={2} display="flex" justifyContent="center">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                  />
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create Coupon Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Coupon</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Coupon Code *"
                name="couponCode"
                value={newCoupon.couponCode}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={newCoupon.description}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Coupon Type *"
                name="couponType"
                value={newCoupon.couponType}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              >
                {couponTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Limit Per User"
                name="limitPerUser"
                type="number"
                value={newCoupon.limitPerUser}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Minimum Cart Value (₹)"
                name="cartValue"
                type="number"
                value={newCoupon.cartValue}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Discount Value (%)"
                name="discountValue"
                type="number"
                value={newCoupon.discountValue}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date & Time"
                name="startDateTime"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={newCoupon.startDateTime}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date & Time"
                name="endDateTime"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={newCoupon.endDateTime}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreateCoupon}
            color="primary"
            variant="contained"
            disabled={
              !newCoupon.couponCode ||
              !newCoupon.discountValue ||
              !newCoupon.startDateTime ||
              !newCoupon.endDateTime
            }
          >
            {loading ? "Creating..." : "Create Coupon"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

Coupons.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      couponCode: PropTypes.string.isRequired,
      description: PropTypes.string,
      limitPerUser: PropTypes.number.isRequired,
      cartValue: PropTypes.number.isRequired,
      couponType: PropTypes.string.isRequired,
      discountValue: PropTypes.number.isRequired,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Coupons;
