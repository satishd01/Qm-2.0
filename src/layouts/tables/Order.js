import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Pagination,
  CircularProgress,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DEFAULT_PAGE_SIZE = 10;
const ORDER_STATUSES = [
  "All",
  "Accepted",
  "Rejected",
  "Delivered",
  "Partially-Delivered",
  "Cart-Accept",
];

const CustomerCell = ({ value }) => (
  <Box display="flex" alignItems="center">
    <Avatar src={value?.avatar} alt={value?.name} sx={{ width: 32, height: 32, mr: 1 }} />
    <span>{value?.name}</span>
  </Box>
);

CustomerCell.propTypes = {
  value: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
};

const StatusCell = ({ value }) => {
  let color = "default";
  if (value === "Accepted") color = "success";
  if (value === "Rejected") color = "error";
  if (value === "Pending") color = "warning";

  return <Chip label={value} color={color} size="small" />;
};

StatusCell.propTypes = {
  value: PropTypes.string.isRequired,
};

function Orders() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    orders: [],
    loading: true,
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    selectedStatus: "Accepted",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    vendors: [],
    users: [],
    loadingVendors: false,
    loadingUsers: false,
  });
  const [dialogState, setDialogState] = useState({
    viewOpen: false,
    createOpen: false,
    currentOrder: null,
  });
  const [newOrder, setNewOrder] = useState({
    products: [{ productId: "", quantity: 1, price: 0 }],
    name: "",
    state: "",
    city: "",
    phone: "",
    address: "",
    amount: 0,
    userId: "",
    vendorId: "",
    PaymentType: "COD",
    vendorType: "Medicine Vendor",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loadingVendors: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/vendor.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch vendors");

      if (data?.status && data.vendors) {
        setState((prev) => ({
          ...prev,
          vendors: data.vendors,
          loadingVendors: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setState((prev) => ({
        ...prev,
        loadingVendors: false,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loadingUsers: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/users.getAllUser`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch users");

      if (data?.status && data.users) {
        setState((prev) => ({
          ...prev,
          users: data.users,
          loadingUsers: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setState((prev) => ({
        ...prev,
        loadingUsers: false,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  const fetchOrders = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const statusParam = state.selectedStatus === "All" ? "" : state.selectedStatus;
      const response = await fetch(
        `${baseUrl}/adminOrders1/${statusParam}?page=${state.currentPage}&page_size=${DEFAULT_PAGE_SIZE}`,
        {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch orders");

      if (data?.status && data.orders) {
        setState((prev) => ({
          ...prev,
          orders: data.orders,
          totalPages: Math.ceil(data.orders.length / DEFAULT_PAGE_SIZE),
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    }
  }, [state.currentPage, state.selectedStatus, baseUrl, xAuthHeader]);

  useEffect(() => {
    fetchOrders();
    fetchVendors();
    fetchUsers();
  }, [fetchOrders, fetchVendors, fetchUsers]);

  const handleCreateOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const validProducts = newOrder.products.filter(
        (product) => product.productId && product.quantity > 0
      );

      if (validProducts.length === 0) {
        throw new Error("At least one valid product is required");
      }

      if (!newOrder.userId) {
        throw new Error("Please select a user");
      }

      if (!newOrder.vendorId) {
        throw new Error("Please select a vendor");
      }

      const orderData = {
        ...newOrder,
        products: validProducts,
      };

      const response = await fetch(`${baseUrl}/adminOrder`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Create failed");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Order created successfully!",
          severity: "success",
        },
        currentPage: 1,
      }));
      setNewOrder({
        products: [{ productId: "", quantity: 1, price: 0 }],
        name: "",
        state: "",
        city: "",
        phone: "",
        address: "",
        amount: 0,
        userId: "",
        vendorId: "",
        PaymentType: "COD",
        vendorType: "Medicine Vendor",
      });
      setDialogState((prev) => ({ ...prev, createOpen: false }));
      await fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(`${baseUrl}/adminOrder/${orderId}`, {
        method: "PUT",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Status update failed");
      }

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: `Order status updated to ${newStatus} successfully!`,
          severity: "success",
        },
      }));
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const addProductField = () => {
    setNewOrder((prev) => ({
      ...prev,
      products: [...prev.products, { productId: "", quantity: 1, price: 0 }],
    }));
  };

  const removeProductField = (index) => {
    setNewOrder((prev) => {
      const newProducts = [...prev.products];
      newProducts.splice(index, 1);
      return { ...prev, products: newProducts };
    });
  };

  const handleProductChange = (index, field, value) => {
    setNewOrder((prev) => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [field]: value };

      // Recalculate total amount
      const amount = newProducts.reduce((sum, product) => {
        return sum + (product.price || 0) * (product.quantity || 0);
      }, 0);

      return { ...prev, products: newProducts, amount };
    });
  };

  const columns = [
    { Header: "Order ID", accessor: "orderId" },
    {
      Header: "Customer",
      accessor: "user",
      Cell: CustomerCell,
    },
    { Header: "Address", accessor: "address" },
    { Header: "Amount", accessor: "amount" },
    { Header: "Order Date", accessor: "createdAt" },
    {
      Header: "Status",
      accessor: "status",
      Cell: StatusCell,
    },
    {
      Header: "Details",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box>
          <IconButton
            onClick={() => setDialogState({ viewOpen: true, currentOrder: row.original })}
            size="small"
          >
            <VisibilityIcon color="info" />
          </IconButton>
          {row.original.status === "Pending" && (
            <>
              <IconButton
                onClick={() => handleStatusChange(row.original.id, "Accepted")}
                size="small"
              >
                <CheckCircleIcon color="success" />
              </IconButton>
              <IconButton
                onClick={() => handleStatusChange(row.original.id, "Rejected")}
                size="small"
              >
                <CancelIcon color="error" />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  const filteredOrders = state.orders.filter((order) => {
    if (!order) return false;
    const search = state.searchTerm.toLowerCase();
    return (
      (order.orderId || "").toLowerCase().includes(search) ||
      (order.user?.name || "").toLowerCase().includes(search) ||
      (order.address || "").toLowerCase().includes(search) ||
      (order.amount?.toString() || "").includes(search)
    );
  });

  if (state.loading && state.orders.length === 0) {
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
                    Order
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <FormControl sx={{ minWidth: 150 }} size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={state.selectedStatus}
                        label="Status"
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            selectedStatus: e.target.value,
                            currentPage: 1,
                          }))
                        }
                      >
                        {ORDER_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Search Orders"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                          currentPage: 1,
                        }))
                      }
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState((prev) => ({ ...prev, createOpen: true }))}
                    >
                      Create Order
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredOrders.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredOrders }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching orders found" : "No orders available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
              {state.totalPages > 1 && (
                <MDBox p={2} display="flex" justifyContent="center">
                  <Pagination
                    count={state.totalPages}
                    page={state.currentPage}
                    onChange={(_, page) => setState((prev) => ({ ...prev, currentPage: page }))}
                    color="primary"
                  />
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog
        open={dialogState.viewOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, viewOpen: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Order Details - {dialogState.currentOrder?.orderId}</DialogTitle>
        <DialogContent dividers>
          {dialogState.currentOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Customer Information</MDTypography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>{dialogState.currentOrder.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Phone</TableCell>
                        <TableCell>{dialogState.currentOrder.phone}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Address</TableCell>
                        <TableCell>{dialogState.currentOrder.address}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>City/State</TableCell>
                        <TableCell>
                          {dialogState.currentOrder.city}, {dialogState.currentOrder.state}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Payment Type</TableCell>
                        <TableCell>{dialogState.currentOrder.PaymentType}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Order Summary</MDTypography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dialogState.currentOrder.products?.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">{product.price}</TableCell>
                          <TableCell align="right">
                            {(product.quantity * product.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>Total Amount:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{dialogState.currentOrder.amount}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, viewOpen: false }))}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogState.createOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, createOpen: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MDTypography variant="h6" gutterBottom>
                Customer Information
              </MDTypography>

              {/* User Dropdown */}
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={newOrder.userId}
                  label="Select User"
                  onChange={(e) => setNewOrder((prev) => ({ ...prev, userId: e.target.value }))}
                  disabled={state.loadingUsers}
                >
                  {state.users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.phone})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Vendor Dropdown */}
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Vendor</InputLabel>
                <Select
                  value={newOrder.vendorId}
                  label="Select Vendor"
                  onChange={(e) => setNewOrder((prev) => ({ ...prev, vendorId: e.target.value }))}
                  disabled={state.loadingVendors}
                >
                  {state.vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName} ({vendor.businessType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="dense"
                name="name"
                label="Customer Name"
                fullWidth
                variant="outlined"
                value={newOrder.name}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, name: e.target.value }))}
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                name="phone"
                label="Phone Number"
                fullWidth
                variant="outlined"
                value={newOrder.phone}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, phone: e.target.value }))}
                sx={{ mt: 1 }}
              />
              <TextField
                margin="dense"
                name="address"
                label="Address"
                fullWidth
                variant="outlined"
                value={newOrder.address}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, address: e.target.value }))}
                sx={{ mt: 1 }}
              />
              <TextField
                margin="dense"
                name="city"
                label="City"
                fullWidth
                variant="outlined"
                value={newOrder.city}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, city: e.target.value }))}
                sx={{ mt: 1 }}
              />
              <TextField
                margin="dense"
                name="state"
                label="State"
                fullWidth
                variant="outlined"
                value={newOrder.state}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, state: e.target.value }))}
                sx={{ mt: 1 }}
              />
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={newOrder.PaymentType}
                  label="Payment Type"
                  onChange={(e) =>
                    setNewOrder((prev) => ({ ...prev, PaymentType: e.target.value }))
                  }
                >
                  <MenuItem value="COD">Cash on Delivery</MenuItem>
                  <MenuItem value="Online">Online Payment</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Vendor Type</InputLabel>
                <Select
                  value={newOrder.vendorType}
                  label="Vendor Type"
                  onChange={(e) => setNewOrder((prev) => ({ ...prev, vendorType: e.target.value }))}
                >
                  <MenuItem value="Medicine Vendor">Medicine Vendor</MenuItem>
                  <MenuItem value="Lab Vendor">Lab Vendor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDTypography variant="h6" gutterBottom>
                Order Items
              </MDTypography>
              {newOrder.products.map((product, index) => (
                <Box key={index} sx={{ mb: 2, p: 1, border: "1px solid #eee", borderRadius: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="subtitle2">Product #{index + 1}</MDTypography>
                    {index > 0 && (
                      <IconButton size="small" onClick={() => removeProductField(index)}>
                        <DeleteIcon color="error" fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <TextField
                    margin="dense"
                    name="productId"
                    label="Product ID"
                    fullWidth
                    variant="outlined"
                    value={product.productId}
                    onChange={(e) => handleProductChange(index, "productId", e.target.value)}
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    margin="dense"
                    name="productName"
                    label="Product Name"
                    fullWidth
                    variant="outlined"
                    value={product.productName}
                    onChange={(e) => handleProductChange(index, "productName", e.target.value)}
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    margin="dense"
                    name="quantity"
                    label="Quantity"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={product.quantity}
                    onChange={(e) =>
                      handleProductChange(index, "quantity", parseInt(e.target.value) || 0)
                    }
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    margin="dense"
                    name="price"
                    label="Price"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={product.price}
                    onChange={(e) =>
                      handleProductChange(index, "price", parseFloat(e.target.value) || 0)
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}
              <Button variant="outlined" color="primary" onClick={addProductField} sx={{ mt: 1 }}>
                Add Product
              </Button>
              <Box sx={{ mt: 2 }}>
                <MDTypography variant="h6">
                  Total Amount: ₹{newOrder.amount.toFixed(2)}
                </MDTypography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, createOpen: false }))}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrder}
            color="error"
            variant="contained"
            disabled={
              !newOrder.name ||
              !newOrder.phone ||
              !newOrder.address ||
              !newOrder.userId ||
              !newOrder.vendorId ||
              newOrder.products.some((p) => !p.productId || p.quantity <= 0)
            }
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            snackbar: { ...prev.snackbar, open: false },
          }))
        }
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() =>
            setState((prev) => ({
              ...prev,
              snackbar: { ...prev.snackbar, open: false },
            }))
          }
          severity={state.snackbar.severity}
          sx={{ width: "100%" }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

Orders.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      orderId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        phone: PropTypes.string,
        email: PropTypes.string,
      }).isRequired,
      products: PropTypes.arrayOf(
        PropTypes.shape({
          productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          productName: PropTypes.string.isRequired,
          quantity: PropTypes.number.isRequired,
          price: PropTypes.number.isRequired,
        })
      ),
    }).isRequired,
  }).isRequired,
};

export default Orders;
