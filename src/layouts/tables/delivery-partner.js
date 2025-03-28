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
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
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
const STATUS_TYPES = ["All", "Not Approved Yet", "Approved", "Rejected"];
const WORKING_STATUSES = ["All", "Online", "Offline"];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function DeliveryPartners() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    partners: [],
    loading: true,
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedStatus: "All",
    selectedWorkingStatus: "All",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    tabValue: 0,
  });
  const [dialogState, setDialogState] = useState({
    viewOpen: false,
    createOpen: false,
    currentPartner: null,
  });
  const [newPartner, setNewPartner] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    city: "",
    address: "",
    typeOfprofile: "Delivery",
    working_status: "Online",
    educationalDetails: {
      disability: {
        insurance: false,
        companyName: "",
        insuranceNumber: "",
      },
    },
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const fetchPartners = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      let url = `${baseUrl}/deliveryPartner.getAll1?page=${state.currentPage}&page_size=${DEFAULT_PAGE_SIZE}`;

      if (state.searchTerm) {
        url += `&search=${state.searchTerm}`;
      }
      if (state.selectedStatus !== "All") {
        url += `&status=${state.selectedStatus}`;
      }
      if (state.selectedWorkingStatus !== "All") {
        url += `&working_status=${state.selectedWorkingStatus}`;
      }

      const response = await fetch(url, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch partners");

      if (data?.status && data.deliveryPartners) {
        setState((prev) => ({
          ...prev,
          partners: data.deliveryPartners,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
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
  }, [
    state.currentPage,
    state.searchTerm,
    state.selectedStatus,
    state.selectedWorkingStatus,
    baseUrl,
    xAuthHeader,
  ]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleTabChange = (event, newValue) => {
    setState((prev) => ({
      ...prev,
      tabValue: newValue,
      currentPage: 1,
      selectedStatus:
        newValue === 1 ? "Approved" : newValue === 2 ? "Rejected" : "Not Approved Yet",
    }));
  };

  const handleStatusChange = async (partnerId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(`${baseUrl}/deliveryPartner/${partnerId}/status`, {
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
          message: `Partner status updated to ${newStatus} successfully!`,
          severity: "success",
        },
      }));
      await fetchPartners();
    } catch (error) {
      console.error("Error updating partner status:", error);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPartner((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDisabilityChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setNewPartner((prev) => ({
      ...prev,
      educationalDetails: {
        ...prev.educationalDetails,
        disability: {
          ...prev.educationalDetails.disability,
          [name]: fieldValue,
        },
      },
    }));
  };

  const handleCreatePartner = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      // Validate required fields
      if (!newPartner.firstName || !newPartner.phoneNumber) {
        throw new Error("First Name and Phone Number are required fields");
      }

      const response = await fetch(`${baseUrl}/deliveryPartner.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPartner),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data?.message || "Create failed");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Delivery partner created successfully!",
          severity: "success",
        },
        currentPage: 1,
      }));
      setNewPartner({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        city: "",
        address: "",
        typeOfprofile: "Delivery",
        working_status: "Online",
        educationalDetails: {
          disability: {
            insurance: false,
            companyName: "",
            insuranceNumber: "",
          },
        },
      });
      setDialogState((prev) => ({ ...prev, createOpen: false }));
      await fetchPartners();
    } catch (error) {
      console.error("Error creating partner:", error);
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

  const columns = [
    {
      Header: "Name",
      accessor: (row) => `${row.firstName || ""} ${row.lastName || ""}`.trim() || "N/A",
    },
    { Header: "Phone", accessor: "phoneNumber" },
    { Header: "Email", accessor: "email" },
    { Header: "City", accessor: "city" },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }) => {
        let color = "default";
        if (value === "Approved") color = "success";
        if (value === "Rejected") color = "error";
        return <Chip label={value || "Not Approved Yet"} color={color} size="small" />;
      },
    },
    {
      Header: "Working Status",
      accessor: "working_status",
      Cell: ({ value }) => {
        let color = value === "Online" ? "success" : "default";
        return <Chip label={value || "Offline"} color={color} size="small" />;
      },
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box>
          <IconButton
            onClick={() => setDialogState({ viewOpen: true, currentPartner: row.original })}
            size="small"
          >
            <VisibilityIcon color="info" />
          </IconButton>
          {row.original.status !== "Approved" && (
            <IconButton
              onClick={() => handleStatusChange(row.original.id, "Approved")}
              size="small"
            >
              <CheckCircleIcon color="success" />
            </IconButton>
          )}
          {row.original.status !== "Rejected" && (
            <IconButton
              onClick={() => handleStatusChange(row.original.id, "Rejected")}
              size="small"
            >
              <CancelIcon color="error" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const filteredPartners = state.partners.filter((partner) => {
    if (!partner) return false;
    const search = state.searchTerm.toLowerCase();
    return (
      ((partner.firstName || "") + " " + (partner.lastName || "")).toLowerCase().includes(search) ||
      (partner.phoneNumber || "").includes(search) ||
      (partner.email || "").toLowerCase().includes(search) ||
      (partner.city || "").toLowerCase().includes(search)
    );
  });

  if (state.loading && state.partners.length === 0) {
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
                    Delivery Partners Management
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Partners"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                          currentPage: 1,
                        }))
                      }
                      sx={{ width: 300 }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<AddIcon />}
                      onClick={() => setDialogState((prev) => ({ ...prev, createOpen: true }))}
                    >
                      Add Partner
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>

              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={state.tabValue} onChange={handleTabChange} aria-label="partner tabs">
                  <Tab label="All Partners" />
                  <Tab label="Approved" />
                  <Tab label="Rejected" />
                  <Tab label="Pending" />
                </Tabs>
              </Box>

              <MDBox pt={3}>
                {filteredPartners.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredPartners }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching partners found" : "No partners available"}
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

      {/* View Partner Dialog */}
      <Dialog
        open={dialogState.viewOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, viewOpen: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Partner Details - {dialogState.currentPartner?.firstName}{" "}
          {dialogState.currentPartner?.lastName}
        </DialogTitle>
        <DialogContent dividers>
          {dialogState.currentPartner && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Basic Information</MDTypography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>
                          {dialogState.currentPartner.firstName}{" "}
                          {dialogState.currentPartner.lastName}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Phone</TableCell>
                        <TableCell>{dialogState.currentPartner.phoneNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>{dialogState.currentPartner.email || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>City</TableCell>
                        <TableCell>{dialogState.currentPartner.city || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Address</TableCell>
                        <TableCell>{dialogState.currentPartner.address || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>
                          <Chip
                            label={dialogState.currentPartner.status || "Not Approved Yet"}
                            color={
                              dialogState.currentPartner.status === "Approved"
                                ? "success"
                                : dialogState.currentPartner.status === "Rejected"
                                  ? "error"
                                  : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Working Status</TableCell>
                        <TableCell>
                          <Chip
                            label={dialogState.currentPartner.working_status || "Offline"}
                            color={
                              dialogState.currentPartner.working_status === "Online"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Additional Information</MDTypography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Insurance</TableCell>
                        <TableCell>
                          {dialogState.currentPartner.educationalDetails?.disability?.insurance
                            ? "Yes"
                            : "No"}
                        </TableCell>
                      </TableRow>
                      {dialogState.currentPartner.educationalDetails?.disability?.insurance && (
                        <>
                          <TableRow>
                            <TableCell>Insurance Company</TableCell>
                            <TableCell>
                              {dialogState.currentPartner.educationalDetails.disability
                                .companyName || "N/A"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Insurance Number</TableCell>
                            <TableCell>
                              {dialogState.currentPartner.educationalDetails.disability
                                .insuranceNumber || "N/A"}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                      <TableRow>
                        <TableCell>Profile Type</TableCell>
                        <TableCell>{dialogState.currentPartner.typeOfprofile || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Created At</TableCell>
                        <TableCell>
                          {new Date(dialogState.currentPartner.createdAt).toLocaleString()}
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

      {/* Create Partner Dialog */}
      <Dialog
        open={dialogState.createOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, createOpen: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Delivery Partner</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name *"
                name="firstName"
                value={newPartner.firstName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                name="lastName"
                value={newPartner.lastName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number *"
                name="phoneNumber"
                value={newPartner.phoneNumber}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={newPartner.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="City"
                name="city"
                value={newPartner.city}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Working Status</InputLabel>
                <Select
                  name="working_status"
                  value={newPartner.working_status}
                  onChange={handleInputChange}
                  label="Working Status"
                >
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={newPartner.address}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="insurance"
                    checked={newPartner.educationalDetails.disability.insurance}
                    onChange={handleDisabilityChange}
                  />
                }
                label="Has Insurance"
              />
            </Grid>
            {newPartner.educationalDetails.disability.insurance && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Insurance Company"
                    name="companyName"
                    value={newPartner.educationalDetails.disability.companyName}
                    onChange={handleDisabilityChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Insurance Number"
                    name="insuranceNumber"
                    value={newPartner.educationalDetails.disability.insuranceNumber}
                    onChange={handleDisabilityChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, createOpen: false }))}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePartner}
            color="error"
            variant="contained"
            disabled={!newPartner.firstName || !newPartner.phoneNumber}
          >
            Create Partner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

DeliveryPartners.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      phoneNumber: PropTypes.string.isRequired,
      email: PropTypes.string,
      city: PropTypes.string,
      address: PropTypes.string,
      status: PropTypes.string,
      working_status: PropTypes.string,
      educationalDetails: PropTypes.shape({
        disability: PropTypes.shape({
          insurance: PropTypes.bool,
          companyName: PropTypes.string,
          insuranceNumber: PropTypes.string,
        }),
      }),
      createdAt: PropTypes.string,
    }).isRequired,
  }).isRequired,
  value: PropTypes.string, // Add this line to validate 'value'
};

export default DeliveryPartners;
