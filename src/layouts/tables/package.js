import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import DataTable from "examples/Tables/DataTable";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Packages() {
  const theme = useTheme();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [types] = useState(["medicine vendor", "lab vendor"]);

  // Package management states
  const [packageDialog, setPackageDialog] = useState({
    open: false,
    mode: "create",
    data: { id: null, name: "" },
  });

  // Package data management states
  const [packageDataDialog, setPackageDataDialog] = useState({
    open: false,
    packageId: null,
    type: "",
    productIds: [],
  });

  // Product data viewing state
  const [productViewDialog, setProductViewDialog] = useState({
    open: false,
    product: null,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/package.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.status && data.packages) {
        setPackages(data.packages);
      } else {
        console.error("No packages data found");
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      showSnackbar("Failed to fetch packages", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all products with detailed information
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

      if (data.status && data.products) {
        setProducts(data.products);
      } else {
        console.error("No products data found");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showSnackbar("Failed to fetch products", "error");
    }
  };

  // Fetch all lab tests
  const fetchLabTests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/labTest.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.status && data.labTests) {
        setLabTests(data.labTests);
      } else {
        console.error("No lab tests data found");
      }
    } catch (error) {
      console.error("Error fetching lab tests:", error);
      showSnackbar("Failed to fetch lab tests", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchPackages();
    fetchProducts();
    fetchLabTests();
  }, []);

  // Package CRUD operations
  const handleCreatePackage = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const response = await fetch(`${baseUrl}/package.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: packageDialog.data.name }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar(data.message || "Package created successfully!", "success");
        setPackageDialog({ ...packageDialog, open: false });
        fetchPackages();
      } else {
        showSnackbar(data.message || "Failed to create package", "error");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      showSnackbar("Error creating package", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePackage = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const response = await fetch(`${baseUrl}/package.update`, {
        method: "PUT",
        headers: {
          "x-authorization": xAuthHeader,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(packageDialog.data),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar(data.message || "Package updated successfully!", "success");
        setPackageDialog({ ...packageDialog, open: false });
        fetchPackages();
      } else {
        showSnackbar(data.message || "Failed to update package", "error");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      showSnackbar("Error updating package", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (pkg) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const response = await fetch(`${baseUrl}/package.delete/${pkg.id}`, {
        method: "DELETE",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar(data.message || "Package deleted successfully!", "success");
        fetchPackages();
      } else {
        showSnackbar(data.message || "Failed to delete package", "error");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      showSnackbar("Error deleting package", "error");
    } finally {
      setLoading(false);
    }
  };

  // Package Data operations
  const handleAddPackageData = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (
        !packageDataDialog.packageId ||
        packageDataDialog.productIds.length === 0 ||
        !packageDataDialog.type
      ) {
        showSnackbar("Please fill all required fields", "error");
        return;
      }

      const response = await fetch(`${baseUrl}/packagedata.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: packageDataDialog.packageId,
          productId: packageDataDialog.productIds,
          type: packageDataDialog.type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar(data.message || "Package data added successfully!", "success");
        setPackageDataDialog({ ...packageDataDialog, open: false, productIds: [], type: "" });
        fetchPackages();
      } else {
        showSnackbar(data.message || "Failed to add package data", "error");
      }
    } catch (error) {
      console.error("Error adding package data:", error);
      showSnackbar("Error adding package data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelection = (event) => {
    const { value } = event.target;
    setPackageDataDialog({
      ...packageDataDialog,
      productIds: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleViewProduct = (productId, type) => {
    if (type === "medicine vendor") {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setProductViewDialog({
          open: true,
          product,
          type: "medicine",
        });
      }
    } else if (type === "lab vendor") {
      const test = labTests.find((t) => t.id === productId);
      if (test) {
        setProductViewDialog({
          open: true,
          product: test,
          type: "lab",
        });
      }
    }
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Name", accessor: "name" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <MDBox display="flex" gap={1}>
          <IconButton
            onClick={() =>
              setPackageDialog({
                open: true,
                mode: "edit",
                data: { ...row.original },
              })
            }
          >
            <EditIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => handleDeletePackage(row.original)}>
            <DeleteIcon color="error" />
          </IconButton>
          <IconButton
            onClick={() =>
              setPackageDataDialog({
                open: true,
                packageId: row.original.id,
                type: "",
                productIds: [],
              })
            }
          >
            <AddIcon color="success" />
          </IconButton>
        </MDBox>
      ),
    },
  ];

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
                    Packages
                  </MDTypography>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      setPackageDialog({
                        open: true,
                        mode: "create",
                        data: { id: null, name: "" },
                      })
                    }
                  >
                    Create Package
                  </Button>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: packages }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Package Create/Edit Dialog */}
      <Dialog
        open={packageDialog.open}
        onClose={() => setPackageDialog({ ...packageDialog, open: false })}
      >
        <DialogTitle>
          {packageDialog.mode === "create" ? "Create New Package" : "Edit Package"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Package Name"
            fullWidth
            variant="standard"
            value={packageDialog.data.name}
            onChange={(e) =>
              setPackageDialog({
                ...packageDialog,
                data: { ...packageDialog.data, name: e.target.value },
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackageDialog({ ...packageDialog, open: false })}>
            Cancel
          </Button>
          <Button
            onClick={packageDialog.mode === "create" ? handleCreatePackage : handleUpdatePackage}
            disabled={!packageDialog.data.name}
          >
            {packageDialog.mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Package Data Dialog */}
      <Dialog
        open={packageDataDialog.open}
        onClose={() => setPackageDataDialog({ ...packageDataDialog, open: false })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Products to Package</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Vendor Type</InputLabel>
            <Select
              value={packageDataDialog.type}
              onChange={(e) =>
                setPackageDataDialog({
                  ...packageDataDialog,
                  type: e.target.value,
                  productIds: [], // Reset product selection when type changes
                })
              }
              label="Vendor Type"
              sx={{
                width: 600,
                "& .MuiSelect-select": {
                  minHeight: "50px", // 👈 This increases the visible height
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              {types.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>
              {packageDataDialog.type === "lab vendor" ? "Lab Tests" : "Products"}
            </InputLabel>
            <Select
              multiple
              value={packageDataDialog.productIds}
              onChange={handleProductSelection}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    let item;
                    if (packageDataDialog.type === "lab vendor") {
                      item = labTests.find((t) => t.id === id);
                    } else {
                      item = products.find((p) => p.id === id);
                    }
                    return item ? (
                      <Chip
                        key={id}
                        label={
                          packageDataDialog.type === "lab vendor" ? item.testName : item.productName
                        }
                        onDelete={() =>
                          setPackageDataDialog({
                            ...packageDataDialog,
                            productIds: packageDataDialog.productIds.filter((pId) => pId !== id),
                          })
                        }
                      />
                    ) : null;
                  })}
                </Box>
              )}
              sx={{
                width: 600,
                "& .MuiSelect-select": {
                  minHeight: "50px", // 👈 This increases the visible height
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              {packageDataDialog.type === "lab vendor"
                ? labTests.map((test) => (
                    <MenuItem key={test.id} value={test.id}>
                      <Checkbox checked={packageDataDialog.productIds.indexOf(test.id) > -1} />
                      <ListItemText
                        primary={test.testName}
                        secondary={
                          <Box display="flex" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProduct(test.id, "lab vendor");
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="caption">
                              {test.id} | ₹{test.sellingPrice}
                            </Typography>
                          </Box>
                        }
                      />
                    </MenuItem>
                  ))
                : products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      <Checkbox checked={packageDataDialog.productIds.indexOf(product.id) > -1} />
                      <ListItemText
                        primary={product.productName}
                        secondary={
                          <Box display="flex" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProduct(product.id, "medicine vendor");
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="caption">
                              {product.productId} | ₹{product.price}
                            </Typography>
                          </Box>
                        }
                      />
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackageDataDialog({ ...packageDataDialog, open: false })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleAddPackageData}
            disabled={!packageDataDialog.type || packageDataDialog.productIds.length === 0}
          >
            Add Selected {packageDataDialog.type === "lab vendor" ? "Tests" : "Products"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product/Lab Test View Dialog */}
      <Dialog
        open={productViewDialog.open}
        onClose={() => setProductViewDialog({ ...productViewDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        {productViewDialog.product && (
          <>
            <DialogTitle>
              {productViewDialog.type === "lab" ? "Lab Test" : "Product"} Details:{" "}
              {productViewDialog.type === "lab"
                ? productViewDialog.product.testName
                : productViewDialog.product.productName}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>
                            {productViewDialog.type === "lab"
                              ? productViewDialog.product.id
                              : productViewDialog.product.productId}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>
                            {productViewDialog.type === "lab"
                              ? productViewDialog.product.testName
                              : productViewDialog.product.productName}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Price</TableCell>
                          <TableCell>
                            ₹
                            {productViewDialog.type === "lab"
                              ? productViewDialog.product.sellingPrice
                              : productViewDialog.product.price}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell>{productViewDialog.product.description || "N/A"}</TableCell>
                        </TableRow>
                        {productViewDialog.type === "lab" && (
                          <>
                            <TableRow>
                              <TableCell>Sample Required</TableCell>
                              <TableCell>
                                {productViewDialog.product.sampleRequired || "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Preparations</TableCell>
                              <TableCell>
                                {productViewDialog.product.preparations || "N/A"}
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  {(productViewDialog.product.bannerImage ||
                    productViewDialog.product.coverImage) && (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Avatar
                        src={
                          productViewDialog.type === "lab"
                            ? productViewDialog.product.bannerImage ||
                              productViewDialog.product.coverImage
                            : `${baseUrl}${productViewDialog.product.image}`
                        }
                        alt={
                          productViewDialog.type === "lab"
                            ? productViewDialog.product.testName
                            : productViewDialog.product.productName
                        }
                        variant="rounded"
                        sx={{ width: 200, height: 200 }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProductViewDialog({ ...productViewDialog, open: false })}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
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

Packages.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Packages;
