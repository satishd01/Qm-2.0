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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Banners() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newBanner, setNewBanner] = useState({
    image: "",
    link: "",
    title: "",
    description: "",
    productId: "",
    type: "image 1",
    status: "Active",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewBanner({
      image: "",
      link: "",
      title: "",
      description: "",
      productId: "",
      type: "image 1",
      status: "Active",
    });
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${baseUrl}/banner.get?page=${currentPage}`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch banners");

      if (data?.status && data.banners) {
        setBanners(data.banners);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${baseUrl}/product.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch products");

      if (data?.status && data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchProducts();
  }, [currentPage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBanner({
      ...newBanner,
      [name]: value,
    });
  };

  const handleProductChange = (event, value) => {
    setNewBanner({
      ...newBanner,
      productId: value ? value.id : "",
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("files", file);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${baseUrl}/upload-files`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Upload failed");

      if (data?.files?.[0]) {
        setNewBanner((prev) => ({
          ...prev,
          image: `${baseUrl}/uploads/${data.files[0]}`,
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateBanner = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!newBanner.image) {
        setSnackbar({
          open: true,
          message: "Image is required",
          severity: "error",
        });
        return;
      }

      const response = await fetch(`${baseUrl}/banner.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBanner),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create banner");

      setSnackbar({
        open: true,
        message: "Banner created successfully!",
        severity: "success",
      });

      // Reset form and state
      setNewBanner({
        image: "",
        link: "",
        title: "",
        description: "",
        productId: "",
        type: "image 1",
        status: "Active",
      });

      setCurrentPage(1);
      await fetchBanners();
      handleClose();
    } catch (error) {
      console.error("Error creating banner:", error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this banner?")) return;

      const token = localStorage.getItem("token");
      setLoading(true);

      const response = await fetch(`${baseUrl}/banner.delete/${id}`, {
        method: "DELETE",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Failed to delete banner");
      }

      setSnackbar({
        open: true,
        message: "Banner deleted successfully!",
        severity: "success",
      });
      setCurrentPage(1);
      await fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      Header: "Image",
      accessor: "image",
      Cell: ({ value }) => (
        <Box sx={{ width: 100, height: 60, overflow: "hidden" }}>
          {value.includes(".mp4") ? (
            <video
              autoPlay
              loop
              muted
              style={{ height: "100%", width: "100%", objectFit: "cover" }}
            >
              <source src={value} type="video/mp4" />
            </video>
          ) : (
            <img
              src={value}
              alt="banner"
              style={{ height: "100%", width: "100%", objectFit: "cover" }}
            />
          )}
        </Box>
      ),
    },
    { Header: "Link", accessor: "link" },
    { Header: "Title", accessor: "title" },
    { Header: "Status", accessor: "status" },
    { Header: "Type", accessor: "type" },
    { Header: "Product ID", accessor: "productId" },
    { Header: "Created At", accessor: "createdAt" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <IconButton onClick={() => handleDeleteBanner(row.original.id)}>
          <DeleteIcon color="error" />
        </IconButton>
      ),
    },
  ];

  const filteredBanners = banners.filter((banner) => {
    const search = searchTerm.toLowerCase();
    return (
      (banner.title || "").toLowerCase().includes(search) ||
      (banner.link || "").toLowerCase().includes(search) ||
      (banner.status || "").toLowerCase().includes(search) ||
      (banner.type || "").toLowerCase().includes(search) ||
      (banner.productId?.toString() || "").includes(search)
    );
  });

  if (loading && banners.length === 0) {
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
                    Banners
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Banners"
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
                      Create Banner
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredBanners.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredBanners }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {searchTerm ? "No matching banners found" : "No banners available"}
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

      {/* Create Banner Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Banner</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <input
                type="file"
                id="bannerImageInput"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                accept="image/*,video/*"
              />
              <label htmlFor="bannerImageInput">
                <Button
                  component="span"
                  variant="contained"
                  color="error"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                  fullWidth
                >
                  {uploading ? "Uploading..." : "Upload Banner Image/Video"}
                </Button>
              </label>
              {newBanner.image && (
                <MDBox mt={2}>
                  {newBanner.image.includes(".mp4") ? (
                    <video controls style={{ maxWidth: "100%", maxHeight: 200 }}>
                      <source src={newBanner.image} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={newBanner.image}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: 200 }}
                    />
                  )}
                </MDBox>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Link"
                name="link"
                value={newBanner.link}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={newBanner.title}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={newBanner.description}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => option.productName || ""}
                onChange={handleProductChange}
                loading={productsLoading}
                renderInput={(params) => (
                  <TextField {...params} label="Select Product" margin="normal" fullWidth />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.productName}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.productName} />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Type"
                name="type"
                value={newBanner.type}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="image 1">Image 1</option>
                <option value="image 2">Image 2</option>
                <option value="image 3">Image 3</option>
                <option value="image 4">Image 4</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Status"
                name="status"
                value={newBanner.status}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreateBanner}
            color="error"
            variant="contained"
            disabled={!newBanner.image || loading}
          >
            {loading ? "Creating..." : "Create Banner"}
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

Banners.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  value: PropTypes.any,
};

export default Banners;
