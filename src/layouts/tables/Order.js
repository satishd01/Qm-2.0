import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import UploadIcon from "@mui/icons-material/Upload";
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
  Typography,
  Modal,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Token,
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
  "Pending",
  "New-Order",
  "Partially-Accepted",
  "Partially-Delivered",
  "Cart-Accept",
  "call-me-to-modify",
  "call-me-to-how-to-take-medicine",
  "Cancel-order",
  "return-order-request",
  "E-Consultation",
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
  if (value === "Accepted" || value === "Delivered" || value === "Cart-Accept") color = "success";
  if (value === "Rejected" || value === "Cancel-order") color = "error";
  if (
    value === "Pending" ||
    value === "New-Order" ||
    value === "call-me-to-modify" ||
    value === "call-me-to-how-to-take-medicine"
  )
    color = "warning";
  if (
    value === "Partially-Accepted" ||
    value === "Partially-Delivered" ||
    value === "return-order-request" ||
    value === "E-Consultation"
  )
    color = "info";

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
    selectedStatus: "All",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    vendors: [],
    users: [],
    loadingVendors: false,
    loadingUsers: false,
    // const orderCounts = {
    //   all: 0,
    //   accepted: 0,
    //   rejected: 0,
    //   delivered: 0,
    //   pending: 0,
    //   "New-Order": 0,  // Key with a hyphen - must be in quotes
    //   "Partially-Accepted": 0,  // Key with a hyphen - must be in quotes
    //   "Partially-Delivered": 0,  // Key with a hyphen - must be in quotes
    //   "Cart-Accept": 0,  // Key with a hyphen - must be in quotes
    //   "call-me-to-modify": 0,  // Key with a hyphen - must be in quotes
    //   "call-me-to-how-to-take-medicine": 0,  // Key with a hyphen - must be in quotes
    //   "Cancel-order": 0,  // Key with a hyphen - must be in quotes
    //   "return-order-request": 0,  // Key with a hyphen - must be in quotes
    //   "E-Consultation": 0,  // Key with a hyphen - must be in quotes
    // };
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
  const [prescriptionModal, setPrescriptionModal] = useState({
    open: false,
    images: [],
    currentIndex: 0,
  });
  console.log("prescriptionModal", prescriptionModal);
  const [productsList, setProductsList] = useState([]);
  console.log("productsList", productsList);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU4-QWxoblBvb2ph";

  // Fetch order counts for all statuses
  const fetchOrderCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const responses = await Promise.all([
        fetch(`${baseUrl}/adminOrders1/All?page=1&page_size=1`, {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${baseUrl}/adminOrders1/Accepted?page=1&page_size=1`, {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${baseUrl}/adminOrders1/Rejected?page=1&page_size=1`, {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${baseUrl}/adminOrders1/Delivered?page=1&page_size=1`, {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${baseUrl}/adminOrders1/Pending?page=1&page_size=1`, {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const data = await Promise.all(responses.map((res) => res.json()));

      setState((prev) => ({
        ...prev,
        orderCounts: {
          all: data[0]?.total || 0,
          accepted: data[1]?.total || 0,
          rejected: data[2]?.total || 0,
          delivered: data[3]?.total || 0,
          pending: data[4]?.total || 0,
        },
      }));
    } catch (error) {
      console.error("Error fetching order counts:", error);
    }
  }, [baseUrl, xAuthHeader]);

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loadingVendors: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/vendor.get1?vendor_type=Medicine Vendor`, {
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

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/product.get`, {
        method: "get",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status && data.products) {
        setProductsList(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

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
      const vendorType = "Medicine Vendor"; // You can also make this dynamic if needed

      const queryParams = new URLSearchParams({
        ...(statusParam && { status: statusParam }),
        vendorType,
        page: state.currentPage,
        page_size: DEFAULT_PAGE_SIZE,
      });

      const response = await fetch(`${baseUrl}/adminOrders1?${queryParams.toString()}`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch orders");

      if (data?.status && data.orders) {
        setState((prev) => ({
          ...prev,
          orders: data.orders,
          totalPages: Math.ceil(data.total / DEFAULT_PAGE_SIZE),
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
    fetchOrderCounts();
    fetchOrders();
    fetchVendors();
    fetchUsers();
    fetchProducts();
  }, [fetchOrderCounts, fetchOrders, fetchVendors, fetchUsers]);

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
      await fetchOrderCounts();
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
      await fetchOrderCounts();
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

  const handleOpenPrescriptionModal = (images) => {
    setPrescriptionModal({
      open: true,
      images: images,
      currentIndex: 0,
    });
  };

  const handleClosePrescriptionModal = () => {
    setPrescriptionModal({
      open: false,
      images: [],
      currentIndex: 0,
    });
  };

  const handleNextImage = () => {
    setPrescriptionModal((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const handlePrevImage = () => {
    setPrescriptionModal((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const columns = [
    { Header: "Order ID", accessor: "orderId" },
    {
      Header: "Customer",
      accessor: "user",
      Cell: CustomerCell,
    },
    // { Header: "Address", accessor: "address" },
    { Header: "Amount", accessor: "amount" },
    {
      Header: "Order Date",
      accessor: "createdAt",
      Cell: ({ value }) => new Date(value).toLocaleString(), // Formats to user-friendly date + time
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: StatusCell,
    },
    {
      Header: "Details",
      accessor: "actions",
      Cell: ({ row }) => {
        const order = row.original;

        const handleFileUpload = async (event) => {
          const file = event.target.files[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("files", file);

          try {
            const uploadResponse = await fetch("https://quickmeds.sndktech.online/upload-files", {
              method: "POST",
              headers: {
                "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
                Authorization:
                  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQxNTE5MTM1LCJleHAiOjE3NDIxMjM5MzV9._pPDrGFeA7uYP_5ZjBxHSTHExF73XctzQRTKOy-7tEY",
              },
              body: formData,
            });

            const uploadData = await uploadResponse.json();
            const uploadedFileName = uploadData?.files?.[0];

            if (uploadedFileName) {
              await fetch(`https://quickmeds.sndktech.online/adminOrderStatus/${order.id}`, {
                method: "PUT",
                headers: {
                  "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
                  Authorization:
                    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQxNTE5MTM1LCJleHAiOjE3NDIxMjM5MzV9._pPDrGFeA7uYP_5ZjBxHSTHExF73XctzQRTKOy-7tEY",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: "New-Order",
                  prescription: [`/uploads/${uploadedFileName}`],
                }),
              });
              setState((prev) => ({
                ...prev,
                snackbar: {
                  open: true,
                  message: "Prescription uploaded successfully!",
                  severity: "success",
                },
                currentPage: 1,
              }));
              fetchOrders();
            }
          } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
          }
        };

        return (
          <Box>
            <IconButton
              onClick={() => setDialogState({ viewOpen: true, currentOrder: order })}
              size="small"
            >
              <VisibilityIcon color="info" />
            </IconButton>

            {order.status === "Pending" && (
              <>
                <IconButton onClick={() => handleStatusChange(order.id, "Accepted")} size="small">
                  <CheckCircleIcon color="success" />
                </IconButton>
                <IconButton onClick={() => handleStatusChange(order.id, "Rejected")} size="small">
                  <CancelIcon color="error" />
                </IconButton>
              </>
            )}

            {order.status === "E-Consultation" && (
              <label htmlFor={`file-upload-${order.id}`}>
                <input
                  id={`file-upload-${order.id}`}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <IconButton component="span" size="small">
                  <UploadIcon color="primary" />
                </IconButton>
              </label>
            )}
          </Box>
        );
      },
    },
    {
      Header: "Cancel Order",
      accessor: "cancelOrder",
      Cell: ({ row }) => {
        const order = row.original;

        const handleOpenCancelDialog = () => {
          setCancelOrderId(order.id);
          setCancelDialogOpen(true);
        };

        return (
          <IconButton
            onClick={handleOpenCancelDialog}
            size="small"
            disabled={order.status === "Cancelled" || order.status === "Delivered"}
          >
            <CancelIcon color="error" />
          </IconButton>
        );
      },
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
        <Grid container spacing={3}>
          {/* Order Count Cards */}
          <Grid container spacing={2}>
            {/* Existing cards */}
            {/* All */}
            {/* <Grid item xs={12} sm={6} md={2.4}>
              <Card
                onClick={() =>
                  setState((prev) => ({ ...prev, selectedStatus: "All", currentPage: 1 }))
                }
                sx={{
                  cursor: "pointer",
                  border: state.selectedStatus === "All" ? "2px solid #1976d2" : "none",
                  height: "100%",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 3,
                  },
                }}
              >
                <MDBox p={2} textAlign="center">
                  <MDTypography variant="h6">All Orders</MDTypography>
                  <MDTypography variant="h4" color="primary">
                    {state.orderCounts.all}
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid> */}

            {/* Repeat similar for others */}
            {[
              { label: "All", status: "All", color: "info", borderColor: "#0288d1" },
              { label: "Accepted", status: "Accepted", color: "success", borderColor: "#2e7d32" },
              { label: "Rejected", status: "Rejected", color: "error", borderColor: "#d32f2f" },
              { label: "Delivered", status: "Delivered", color: "success", borderColor: "#2e7d32" },
              { label: "Pending", status: "Pending", color: "warning", borderColor: "#ed6c02" },
              { label: "New-Order", status: "New-Order", color: "info", borderColor: "#0288d1" },
              {
                label: "Partially-Accepted",
                status: "Partially-Accepted",
                color: "info",
                borderColor: "#0288d1",
              },
              {
                label: "Partially-Delivered",
                status: "Partially-Delivered",
                color: "info",
                borderColor: "#0288d1",
              },
              {
                label: "Cart-Accept",
                status: "Cart-Accept",
                color: "secondary",
                borderColor: "#7b1fa2",
              },
              {
                label: "Call Me To Modify Prescription",
                status: "call-me-to-modify",
                color: "secondary",
                borderColor: "#7b1fa2",
              },
              {
                label: "Call Me - How To Take Medicine",
                status: "call-me-to-how-to-take-medicine",
                color: "secondary",
                borderColor: "#7b1fa2",
              },
              {
                label: "Cancel Order",
                status: "Cancel-order",
                color: "error",
                borderColor: "#c62828",
              },
              {
                label: "Return Order Request",
                status: "return-order-request",
                color: "warning",
                borderColor: "#f57c00",
              },
              {
                label: "E-Consultation",
                status: "E-Consultation",
                color: "info",
                borderColor: "#0288d1",
              },
            ].map(({ label, status, color, borderColor }) => (
              <Grid key={status} item xs={1} sm={3} md={2.4}>
                <Card
                  onClick={() =>
                    setState((prev) => ({ ...prev, selectedStatus: status, currentPage: 1 }))
                  }
                  sx={{
                    cursor: "pointer",
                    border: state.selectedStatus === status ? `2px solid ${borderColor}` : "none",
                    height: "100%",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <MDBox p={2} textAlign="center">
                    <MDTypography variant="h6">{label}</MDTypography>
                    <MDTypography variant="h4" color={color}>
                      {state.orderCounts[status]}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Main Table */}
          <Grid item xs={12} mt={2}>
            <Card>
              <MDBox
                m={1}
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
                    {state.selectedStatus === "All" ? "All" : state.selectedStatus} Orders
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
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

      {/* Order Details Dialog */}
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
                        <TableCell>{dialogState.currentOrder.user.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>User Id</TableCell>
                        <TableCell>{dialogState.currentOrder.user.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Phone</TableCell>
                        <TableCell>{dialogState.currentOrder.user.phone}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>{dialogState.currentOrder.user?.email || "N/A"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {dialogState.currentOrder.prescription && (
                  <Box mt={3}>
                    <MDTypography variant="h6">Prescription</MDTypography>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() =>
                        handleOpenPrescriptionModal(dialogState.currentOrder.prescription)
                      }
                      sx={{ mt: 2 }}
                    >
                      View Prescription Images ({dialogState.currentOrder.prescription.length})
                    </Button>
                  </Box>
                )}
              </Grid>
              <Box mt={3}>
                <MDTypography variant="h6">Vendor Information</MDTypography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Vendor ID</TableCell>
                        <TableCell>{dialogState.currentOrder.vendorId}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Business Name</TableCell>
                        <TableCell>
                          {dialogState.currentOrder.vendorDetails?.businessName || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Business Type</TableCell>
                        <TableCell>
                          {dialogState.currentOrder.vendorDetails?.businessType || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell>
                          {dialogState.currentOrder.vendorDetails?.location || "N/A"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Order Summary</MDTypography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {dialogState.currentOrder.products?.map((product, index) => {
                        const productName =
                          product.productName ||
                          product.product?.productName ||
                          `Product ${index + 1}`;
                        const quantity = product.quantity || 0;
                        const price = product.price ?? product.product?.sellingPrice ?? 0;
                        const total = quantity * price;

                        return (
                          <React.Fragment key={index}>
                            <TableRow>
                              <TableCell>
                                <strong>Product {index + 1}</strong>
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Product Name</TableCell>
                              <TableCell>{productName}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Quantity</TableCell>
                              <TableCell>{quantity}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Price</TableCell>
                              <TableCell>₹{price.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Total</TableCell>
                              <TableCell>₹{total.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={2}>
                                <hr />
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}

                      {/* Total Amount Row */}
                      {/* <TableRow>
                        <TableCell>
                          <strong>Total Amount</strong>
                        </TableCell>
                        <TableCell>
                          <strong>₹{dialogState.currentOrder.amount?.toFixed(2) ?? "0.00"}</strong>
                        </TableCell>
                      </TableRow> */}
                    </TableBody>
                  </Table>
                </TableContainer>

                {dialogState.currentOrder.deliveryPartnerDetails && (
                  <Box mt={3}>
                    <MDTypography variant="h6">Delivery Partner</MDTypography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>
                              {dialogState.currentOrder.deliveryPartnerDetails.firstName}{" "}
                              {dialogState.currentOrder.deliveryPartnerDetails.lastName}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Phone</TableCell>
                            <TableCell>
                              {dialogState.currentOrder.deliveryPartnerDetails.phoneNumber}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>
                              {dialogState.currentOrder.deliveryPartnerDetails.email}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Status</TableCell>
                            <TableCell>
                              {dialogState.currentOrder.deliveryPartnerDetails.status}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
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

      {/* Prescription Images Modal */}
      <Modal
        open={prescriptionModal.open}
        onClose={handleClosePrescriptionModal}
        aria-labelledby="prescription-images-modal"
        aria-describedby="view-prescription-images"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "80vw",
            maxWidth: "1000px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: "none",
          }}
        >
          <IconButton
            onClick={handleClosePrescriptionModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "text.primary",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Typography variant="h6">
              Prescription {prescriptionModal.currentIndex + 1} of {prescriptionModal.images.length}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconButton
              onClick={handlePrevImage}
              disabled={prescriptionModal.images.length <= 1}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Box
              component="img"
              src={`${baseUrl}${prescriptionModal.images[prescriptionModal.currentIndex]}`}
              alt={`Prescription ${prescriptionModal.currentIndex + 1}`}
              sx={{
                maxHeight: "70vh",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />

            <IconButton
              onClick={handleNextImage}
              disabled={prescriptionModal.images.length <= 1}
              sx={{ ml: 2 }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>

          {prescriptionModal.images.length > 1 && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              {prescriptionModal.images.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setPrescriptionModal((prev) => ({ ...prev, currentIndex: index }))}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: index === prescriptionModal.currentIndex ? "primary.main" : "grey.500",
                    mx: 0.5,
                    cursor: "pointer",
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Modal>

      {/* Create Order Dialog */}
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

              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={newOrder.userId}
                  label="Select User"
                  onChange={(e) => setNewOrder((prev) => ({ ...prev, userId: e.target.value }))}
                  disabled={state.loadingUsers}
                  sx={{ width: 350, height: 45 }}
                >
                  {state.users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.phone})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Vendor</InputLabel>
                <Select
                  value={newOrder.vendorId}
                  label="Select Vendor"
                  onChange={(e) => setNewOrder((prev) => ({ ...prev, vendorId: e.target.value }))}
                  disabled={state.loadingVendors}
                  sx={{ width: 350, height: 45 }}
                >
                  {state.vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName} ({vendor.shop_name})
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
                  sx={{ width: 350, height: 45 }}
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
                  sx={{ width: 350, height: 45 }}
                >
                  <MenuItem value="Medicine Vendor">Medicine Vendor</MenuItem>
                  {/* <MenuItem value="Lab Vendor">Lab Vendor</MenuItem> */}
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
                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel>Select Product</InputLabel>
                    <Select
                      value={product.productId || ""}
                      label="Select Product"
                      onChange={(e) => {
                        const selectedProduct = productsList.find((p) => p.id === e.target.value);
                        handleProductChange(index, "productId", selectedProduct.id);
                        handleProductChange(index, "productName", selectedProduct.productName);
                        handleProductChange(index, "price", selectedProduct.sellingPrice);
                      }}
                      sx={{ width: 350, height: 45 }}
                    >
                      {productsList.map((prod) => (
                        <MenuItem key={prod.id} value={prod.id}>
                          {prod.productName} (₹{prod.sellingPrice})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
              <Button variant="contained" color="error" onClick={addProductField} sx={{ mt: 1 }}>
                Add Product
              </Button>
              {/* <Box sx={{ mt: 2 }}>
                <MDTypography variant="h6">
                  Total Amount: ₹{newOrder.amount.toFixed(2)}
                </MDTypography>
              </Box> */}
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
      {/* cancel order dailog */}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>Are you sure you want to cancel this order?</DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="primary">
            No
          </Button>
          <Button
            onClick={async () => {
              try {
                const response = await fetch(
                  "https://quickmeds.sndktech.online/adminOrder/cancel",
                  {
                    method: "PUT",
                    headers: {
                      Authorization: `Bearer ${Token}`,
                      "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      orderId: cancelOrderId,
                      finalOrderStatus: "Cancelled",
                    }),
                  }
                );
                if (response.ok) {
                  setState((prev) => ({
                    ...prev,
                    snackbar: {
                      open: true,
                      message: "Order cancelled successfully!",
                      severity: "success",
                    },
                  }));
                  fetchOrders();
                } else {
                  throw new Error("Failed to cancel");
                }
              } catch (error) {
                console.error("Cancel failed", error);
                alert("Cancellation failed. Please try again.");
              } finally {
                setCancelDialogOpen(false);
                setCancelOrderId(null);
              }
            }}
            color="error"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
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
