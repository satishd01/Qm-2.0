import { useEffect, useState } from "react";
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
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Pagination from "@mui/material/Pagination";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CircularProgress from "@mui/material/CircularProgress";

function Products() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newProduct, setNewProduct] = useState({
    productName: "",
    mrp: 0,
    sellingPrice: 0,
    brand: "",
    vendorId: 1,
    productForm: "",
    uses: "",
    age: "",
    categoryId: 1,
    category: "",
    manufacturer: "",
    consumeType: "",
    expireDate: "",
    packagingDetails: "",
    images: [],
    variants: [],
    composition: "",
    productIntroduction: "",
    usesOfMedication: "",
    benefits: "",
    contradictions: "",
    isPrescriptionRequired: false,
    expertAdvice: "",
    substituteProducts: [],
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewProduct({
      productName: "",
      mrp: 0,
      sellingPrice: 0,
      brand: "",
      vendorId: 1,
      productForm: "",
      uses: "",
      age: "",
      categoryId: 1,
      category: "",
      manufacturer: "",
      consumeType: "",
      expireDate: "",
      packagingDetails: "",
      images: [],
      variants: [],
      composition: "",
      productIntroduction: "",
      usesOfMedication: "",
      benefits: "",
      contradictions: "",
      isPrescriptionRequired: false,
      expertAdvice: "",
      substituteProducts: [],
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${baseUrl}/product.get?page=${currentPage}`, {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data?.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBooleanChange = (e) => {
    const { name, checked } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach((file) => {
        uploadFormData.append("files", file);
      });

      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/upload-files`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok && data?.files) {
        const uploadedUrls = data.files.map((file) => `${baseUrl}/${file}`);
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
      } else {
        alert(data?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCreateProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true); // Set loading state

      // Validate required fields
      if (!newProduct.productName || !newProduct.mrp || !newProduct.sellingPrice) {
        // setSnackbar({
        //   open: true,
        //   message: "Product Name, MRP and Selling Price are required fields",
        //   severity: "warning",
        // });
        return;
      }

      const response = await fetch(`${baseUrl}/product.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create product");

      // On success
      // setSnackbar({
      //   open: true,
      //   message: "Product created successfully!",
      //   severity: "success",
      // });
      window.alert("Product created successfully!");

      // Reset form and close dialog
      setNewProduct({
        productName: "",
        mrp: 0,
        sellingPrice: 0,
        brand: "",
        vendorId: 1,
        productForm: "",
        uses: "",
        age: "",
        categoryId: 1,
        category: "",
        manufacturer: "",
        consumeType: "",
        expireDate: "",
        packagingDetails: "",
        images: [],
        variants: [],
        composition: "",
        productIntroduction: "",
        usesOfMedication: "",
        benefits: "",
        contradictions: "",
        isPrescriptionRequired: false,
        expertAdvice: "",
        substituteProducts: [],
      });

      setOpen(false);
      setCurrentPage(1); // Reset to first page

      // Refresh the product list
      const refreshResponse = await fetch(`${baseUrl}/product.get?page=1`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const refreshData = await refreshResponse.json();
      if (refreshData?.products) {
        setProducts(refreshData.products);
        setTotalPages(refreshData.totalPages || 1);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      window.alert(error.message);
      // setSnackbar({
      //   open: true,
      //   message: error.message,
      //   severity: "error",
      // });
    } finally {
      setLoading(false); // Clear loading state
    }
  };

  const columns = [
    { Header: "Product Name", accessor: "productName" },
    { Header: "MRP", accessor: "mrp" },
    { Header: "Selling Price", accessor: "sellingPrice" },
    { Header: "Brand", accessor: "brand" },
    { Header: "Category", accessor: "category" },
    { Header: "Expire Date", accessor: "expireDate" },
  ];

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      (product.productName || "").toLowerCase().includes(search) ||
      (product.brand || "").toLowerCase().includes(search) ||
      (product.category || "").toLowerCase().includes(search)
    );
  });

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
                    Products
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Products"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ width: 300 }}
                    />
                    <Button variant="contained" color="error" onClick={handleOpen}>
                      Add New Product
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: filteredProducts }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
              <MDBox p={2} display="flex" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  color="primary"
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create Product Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="paper">
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Product Name *"
                name="productName"
                value={newProduct.productName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Brand *"
                name="brand"
                value={newProduct.brand}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Category *"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Manufacturer"
                name="manufacturer"
                value={newProduct.manufacturer}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Product Form"
                name="productForm"
                value={newProduct.productForm}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Consume Type"
                name="consumeType"
                value={newProduct.consumeType}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            {/* Pricing and Dates */}
            <Grid item xs={12} md={6}>
              <TextField
                label="MRP *"
                name="mrp"
                type="number"
                value={newProduct.mrp}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Selling Price *"
                name="sellingPrice"
                type="number"
                value={newProduct.sellingPrice}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Expire Date"
                name="expireDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newProduct.expireDate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Packaging Details"
                name="packagingDetails"
                value={newProduct.packagingDetails}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Age Group"
                name="age"
                value={newProduct.age}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="isPrescriptionRequired"
                    checked={newProduct.isPrescriptionRequired}
                    onChange={handleBooleanChange}
                  />
                }
                label="Prescription Required"
              />
            </Grid>

            {/* Images Upload */}
            <Grid item xs={12}>
              <input
                type="file"
                id="productImages"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                accept="image/*"
                multiple
              />
              <label htmlFor="productImages">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                  sx={{
                    mt: 1,
                    mb: 1,
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.light,
                      borderColor: theme.palette.primary.dark,
                    },
                    "& .MuiSvgIcon-root": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {uploading ? "Uploading..." : "Upload Product Images"}
                </Button>
              </label>
              <MDBox mt={2}>
                {newProduct.images.map((image, index) => (
                  <MDBox key={index} display="flex" alignItems="center" mb={1}>
                    <MDTypography variant="caption" noWrap sx={{ flexGrow: 1 }}>
                      {image.split("/").pop()}
                    </MDTypography>
                    <Button size="small" color="error" onClick={() => handleRemoveImage(index)}>
                      Remove
                    </Button>
                  </MDBox>
                ))}
              </MDBox>
            </Grid>

            {/* Variants and Composition */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Variants (comma separated)"
                value={newProduct.variants.join(", ")}
                onChange={(e) => handleArrayChange(e, "variants")}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Substitute Products (comma separated)"
                value={newProduct.substituteProducts.join(", ")}
                onChange={(e) => handleArrayChange(e, "substituteProducts")}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Composition"
                name="composition"
                value={newProduct.composition}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            {/* Uses and Benefits */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Uses"
                name="uses"
                value={newProduct.uses}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Benefits"
                name="benefits"
                value={newProduct.benefits}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            {/* Detailed Information */}
            <Grid item xs={12}>
              <TextField
                label="Product Introduction"
                name="productIntroduction"
                value={newProduct.productIntroduction}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                label="Uses of Medication"
                name="usesOfMedication"
                value={newProduct.usesOfMedication}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                label="Contradictions"
                name="contradictions"
                value={newProduct.contradictions}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Expert Advice"
                name="expertAdvice"
                value={newProduct.expertAdvice}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreateProduct}
            color="primary"
            variant="contained"
            disabled={!newProduct.productName || !newProduct.mrp || !newProduct.sellingPrice}
          >
            Create Product
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

Products.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      productName: PropTypes.string.isRequired,
      mrp: PropTypes.number.isRequired,
      sellingPrice: PropTypes.number.isRequired,
      brand: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      expireDate: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Products;
