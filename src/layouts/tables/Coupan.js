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
import InputLabel from "@mui/material/InputLabel";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Avatar from "@mui/material/Avatar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Coupons() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
    image: "",
    productId: "",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const couponTypes = [
    { value: "labtest", label: "Lab Test" },
    { value: "product", label: "Product" },
    { value: "delivery", label: "Delivery" },
  ];

  // Quill editor configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "link"];

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/product.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
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
      setSnackbar({
        open: true,
        message: error.message || "Failed to fetch coupons",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, [currentPage, searchTerm]);

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
      image: "",
      productId: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon({
      ...newCoupon,
      [name]: value,
    });
  };

  const handleDescriptionChange = (value) => {
    setNewCoupon({
      ...newCoupon,
      description: value,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch(`${baseUrl}/upload-files`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.files && data.files.length > 0) {
        const fileUrl = `${baseUrl}/uploads/${data.files[0]}`;
        setNewCoupon({ ...newCoupon, image: fileUrl });
        setSnackbar({
          open: true,
          message: "Image uploaded successfully!",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbar({
        open: true,
        message: error.message || "Error uploading file",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
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
        setSnackbar({
          open: true,
          message: "Required fields: Code, Discount, Start/End Dates",
          severity: "error",
        });
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

      setSnackbar({
        open: true,
        message: "Coupon created successfully!",
        severity: "success",
      });

      handleClose();
      setCurrentPage(1);
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to create coupon",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      Header: "Coupon",
      accessor: "image",
      Cell: ({ value }) => <Avatar alt="Coupon" src={value} sx={{ width: 56, height: 56 }} />,
    },
    { Header: "Coupon Code", accessor: "couponCode" },
    {
      Header: "Description",
      accessor: "description",
      Cell: ({ value }) => (
        <div
          dangerouslySetInnerHTML={{ __html: value }}
          style={{ maxHeight: "100px", overflow: "hidden" }}
        />
      ),
    },
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
                {coupons.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: coupons }}
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create New Coupon</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MDBox display="flex" flexDirection="column" gap={2} mb={2}>
                {newCoupon.image ? (
                  <Avatar
                    alt="Coupon Preview"
                    src={newCoupon.image}
                    sx={{ width: 100, height: 100, alignSelf: "center" }}
                  />
                ) : null}
                <Button
                  variant="contained"
                  color="error"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                </Button>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6}>
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
              <InputLabel>Description</InputLabel>
              <ReactQuill
                theme="snow"
                value={newCoupon.description}
                onChange={handleDescriptionChange}
                modules={modules}
                formats={formats}
                style={{ height: "200px", marginBottom: "50px" }}
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
            {newCoupon.couponType === "product" && (
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Product *"
                  name="productId"
                  value={newCoupon.productId}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.productName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
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
                label="Start Date & Time *"
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
                label="End Date & Time *"
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
          <Button onClick={handleCreateCoupon} color="error" variant="contained">
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
      image: PropTypes.string,
      productId: PropTypes.string,
    }).isRequired,
  }).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    }),
  ]),
};

export default Coupons;
