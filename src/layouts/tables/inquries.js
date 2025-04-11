import React, { useState, useEffect, useCallback } from "react";
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
  CircularProgress,
  Box,
  Chip,
  Avatar,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const DEFAULT_PAGE_SIZE = 10;

const InquiryItem = ({ item }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {/* <Avatar
      sx={{
        width: 56,
        height: 56,
        mr: 2,
        bgcolor: "#f44336", // Red color for inquiries
        color: "white",
      }}
    >
      {item.name?.charAt(0) || "?"}
    </Avatar> */}
    <Box>
      <MDTypography variant="h6" fontWeight="medium">
        {item.name || "N/A"}
      </MDTypography>
      <MDTypography variant="caption" color="text">
        {item.email || "N/A"}
      </MDTypography>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Chip label={`Phone: ${item.phoneno || "N/A"}`} size="small" color="info" />
        <Chip label={`Created: ${new Date(item.createdAt).toLocaleDateString()}`} size="small" />
      </Box>
    </Box>
  </Box>
);

InquiryItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phoneno: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

function Inquiries() {
  const [state, setState] = useState({
    inquiries: [],
    filteredInquiries: [],
    loading: true,
    searchTerm: "",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    confirmDelete: null,
    isEdit: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    phoneno: "",
    email: "",
    query: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    phoneno: false,
    email: false,
    query: false,
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU4-QWxoblBvb2ph";

  const showSnackbar = (message, severity = "success") => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        open: true,
        message,
        severity,
      },
    }));
  };

  const handleCloseSnackbar = () => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        ...prev.snackbar,
        open: false,
      },
    }));
  };

  const fetchInquiries = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/help`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch inquiries");

      if (data?.status && data.data) {
        setState((prev) => ({
          ...prev,
          inquiries: data.data,
          filteredInquiries: data.data,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      showSnackbar(error.message || "Error fetching inquiries", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [baseUrl, xAuthHeader]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));

    if (query.trim() === "") {
      setState((prev) => ({ ...prev, filteredInquiries: prev.inquiries }));
      return;
    }

    const filtered = state.inquiries.filter((inquiry) => {
      if (!inquiry) return false;
      return (
        (inquiry.name || "").toLowerCase().includes(query) ||
        (inquiry.email || "").toLowerCase().includes(query) ||
        (inquiry.query || "").toLowerCase().includes(query) ||
        (inquiry.phoneno?.toString() || "").includes(query)
      );
    });
    setState((prev) => ({ ...prev, filteredInquiries: filtered }));
  };

  const validateForm = () => {
    const errors = {
      name: !formData.name || !String(formData.name).trim(),
      phoneno: !formData.phoneno || !String(formData.phoneno).trim(),
      email: !formData.email || !String(formData.email).trim(),
      query: !formData.query || !String(formData.query).trim(),
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleCreateInquiry = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields correctly", "error");
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/help`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Create failed");

      showSnackbar("Inquiry created successfully!");
      resetForm();
      setDialogState((prev) => ({ ...prev, open: false }));
      await fetchInquiries();
    } catch (error) {
      console.error("Error creating inquiry:", error);
      showSnackbar(error.message || "Error creating inquiry", "error");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUpdateInquiry = async () => {
    if (!validateForm() || !dialogState.editingId) {
      showSnackbar("Please fill all required fields correctly", "error");
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/help/${dialogState.editingId}`, {
        method: "PUT",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Update failed");
      }

      showSnackbar("Inquiry updated successfully!");
      resetForm();
      setDialogState((prev) => ({ ...prev, open: false, editingId: null }));
      await fetchInquiries();
    } catch (error) {
      console.error("Error updating inquiry:", error);
      showSnackbar(error.message || "Error updating inquiry", "error");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteInquiry = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/help/${dialogState.confirmDelete}`, {
        method: "DELETE",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Delete failed");
      }

      showSnackbar("Inquiry deleted successfully!");
      setDialogState((prev) => ({ ...prev, confirmDelete: null }));
      await fetchInquiries();
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      showSnackbar(error.message || "Error deleting inquiry", "error");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phoneno: "",
      email: "",
      query: "",
    });
    setFormErrors({
      name: false,
      phoneno: false,
      email: false,
      query: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phoneno" ? String(value).replace(/\D/g, "") : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const editInquiry = (inquiry) => {
    setFormData({
      name: inquiry.name,
      phoneno: inquiry.phoneno,
      email: inquiry.email,
      query: inquiry.query,
    });
    setDialogState({
      open: true,
      isEdit: true,
      editingId: inquiry.id,
    });
  };

  const columns = [
    {
      Header: "Inquiry",
      accessor: "inquiry",
      Cell: ({ row }) => <InquiryItem item={row.original} />,
    },
    {
      Header: "Query",
      accessor: "query",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {row.original.query?.length > 50
            ? `${row.original.query.substring(0, 50)}...`
            : row.original.query || "N/A"}
        </MDTypography>
      ),
    },
    // {
    //   Header: "Actions",
    //   accessor: "actions",
    //   Cell: ({ row }) => (
    //     <Box>
    //       <IconButton onClick={() => editInquiry(row.original)} color="info">
    //         <EditIcon />
    //       </IconButton>
    //       <IconButton
    //         onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: row.original.id }))}
    //         color="error"
    //       >
    //         <DeleteIcon />
    //       </IconButton>
    //     </Box>
    //   ),
    // },
  ];

  if (state.loading && state.inquiries.length === 0) {
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
                    Inquiries
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Inquiries"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState({ open: true, isEdit: false, editingId: null })}
                    >
                      Create New Inquiry
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {state.filteredInquiries.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: state.filteredInquiries }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching inquiries found" : "No inquiries available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create/Edit Inquiry Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => {
          setDialogState({ open: false, isEdit: false, editingId: null });
          resetForm();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialogState.isEdit ? "Edit Inquiry" : "Create New Inquiry"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.name}
                helperText={formErrors.name ? "Name is required" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone Number *"
                name="phoneno"
                value={formData.phoneno}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.phoneno}
                helperText={formErrors.phoneno ? "Phone number is required" : ""}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email *"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.email}
                helperText={formErrors.email ? "Email is required" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Query *"
                name="query"
                value={formData.query}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                error={formErrors.query}
                helperText={formErrors.query ? "Query is required" : ""}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogState({ open: false, isEdit: false, editingId: null });
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={dialogState.isEdit ? handleUpdateInquiry : handleCreateInquiry}
            color="error"
            variant="contained"
            disabled={!formData.name || !formData.phoneno || !formData.email || !formData.query}
          >
            {dialogState.isEdit ? "Update Inquiry" : "Create Inquiry"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(dialogState.confirmDelete)}
        onClose={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>Are you sure you want to delete this inquiry?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button onClick={handleDeleteInquiry} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={state.snackbar.severity}
          sx={{ width: "100%" }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

Inquiries.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      phoneno: PropTypes.string,
      email: PropTypes.string,
      query: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Inquiries;
