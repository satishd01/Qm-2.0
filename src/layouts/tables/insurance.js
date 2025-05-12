import React, { useState, useEffect, useCallback } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://quickmeds.sndktech.online";
const X_AUTH_HEADER =
  process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

const PlanItem = ({ item }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {item.image?.[0] && (
      <Avatar
        src={item.image[0]}
        alt={item.plan_id}
        sx={{ width: 56, height: 56, mr: 2 }}
        variant="rounded"
      />
    )}
    <Box>
      <MDTypography variant="h6" fontWeight="medium">
        {item.plan_id}
      </MDTypography>
      <MDTypography variant="caption" color="text">
        {item.details_of_plan?.length > 50
          ? `${item.details_of_plan.substring(0, 50)}...`
          : item.details_of_plan}
      </MDTypography>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Chip label={`Yearly: $${item.year_plan}`} size="small" color="primary" />
        <Chip label={`Monthly: $${item.month_plan}`} size="small" color="error" />
      </Box>
    </Box>
  </Box>
);

PlanItem.propTypes = {
  item: PropTypes.shape({
    plan_id: PropTypes.string.isRequired,
    details_of_plan: PropTypes.string,
    year_plan: PropTypes.string,
    month_plan: PropTypes.string,
    image: PropTypes.array,
  }).isRequired,
};

function InsurancePlansManagement() {
  const [state, setState] = useState({
    plans: [],
    filteredPlans: [],
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
    fileUploadOpen: false,
  });

  const [formData, setFormData] = useState({
    image: [],
    year_plan: "",
    month_plan: "",
    details_of_plan: "",
    plan_id: "",
  });

  const [formErrors, setFormErrors] = useState({
    year_plan: false,
    month_plan: false,
    details_of_plan: false,
    plan_id: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const fetchPlans = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/health-insurance-plans`, {
        headers: {
          "x-authorization": X_AUTH_HEADER,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch plans");

      if (data?.data) {
        setState((prev) => ({
          ...prev,
          plans: data.data,
          filteredPlans: data.data,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      showSnackbar(error.message || "Error fetching plans", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));

    if (query.trim() === "") {
      setState((prev) => ({ ...prev, filteredPlans: prev.plans }));
      return;
    }

    const filtered = state.plans.filter((plan) => {
      if (!plan) return false;
      return (
        (plan.plan_id || "").toLowerCase().includes(query) ||
        (plan.details_of_plan || "").toLowerCase().includes(query)
      );
    });
    setState((prev) => ({ ...prev, filteredPlans: filtered }));
  };

  const validateForm = () => {
    const errors = {
      year_plan: !formData.year_plan || isNaN(formData.year_plan),
      month_plan: !formData.month_plan || isNaN(formData.month_plan),
      details_of_plan: !formData.details_of_plan.trim(),
      plan_id: !formData.plan_id.trim(),
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleUploadFiles = async (files) => {
    try {
      setUploadProgress(0);
      const token = localStorage.getItem("token");
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch(`${BASE_URL}/upload-files`, {
        method: "POST",
        headers: {
          "x-authorization": X_AUTH_HEADER,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Upload failed");

      const uploadedUrls = data.files.map((file) => `${BASE_URL}/upload/${file}`);
      setUploadedFiles(uploadedUrls);
      showSnackbar("Files uploaded successfully!");
      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading files:", error);
      showSnackbar(error.message || "Error uploading files", "error");
      return [];
    } finally {
      setUploadProgress(0);
    }
  };

  const handleCreatePlan = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields correctly", "error");
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const planData = {
        ...formData,
        image: uploadedFiles,
      };

      const response = await fetch(`${BASE_URL}/insurance-plan.add`, {
        method: "POST",
        headers: {
          "x-authorization": X_AUTH_HEADER,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Create failed");

      showSnackbar("Plan created successfully!");
      resetForm();
      setDialogState((prev) => ({ ...prev, open: false }));
      await fetchPlans();
    } catch (error) {
      console.error("Error creating plan:", error);
      showSnackbar(error.message || "Error creating plan", "error");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUpdatePlan = async () => {
    if (!validateForm() || !dialogState.editingId) {
      showSnackbar("Please fill all required fields correctly", "error");
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const planData = {
        ...formData,
        image: uploadedFiles.length > 0 ? uploadedFiles : formData.image,
      };

      const response = await fetch(`${BASE_URL}/insurance-plan/${dialogState.editingId}`, {
        method: "PUT",
        headers: {
          "x-authorization": X_AUTH_HEADER,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Update failed");
      }

      showSnackbar("Plan updated successfully!");
      resetForm();
      setDialogState((prev) => ({ ...prev, open: false, editingId: null }));
      await fetchPlans();
    } catch (error) {
      console.error("Error updating plan:", error);
      showSnackbar(error.message || "Error updating plan", "error");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeletePlan = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/insurance-plan/${dialogState.confirmDelete}`, {
        method: "DELETE",
        headers: {
          "x-authorization": X_AUTH_HEADER,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Delete failed");
      }

      showSnackbar("Plan deleted successfully!");
      setDialogState((prev) => ({ ...prev, confirmDelete: null }));
      await fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      showSnackbar(error.message || "Error deleting plan", "error");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      image: [],
      year_plan: "",
      month_plan: "",
      details_of_plan: "",
      plan_id: "",
    });
    setFormErrors({
      year_plan: false,
      month_plan: false,
      details_of_plan: false,
      plan_id: false,
    });
    setUploadedFiles([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const uploadedUrls = await handleUploadFiles(files);
      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          image: [...prev.image, ...uploadedUrls],
        }));
      }
    }
  };

  const editPlan = (plan) => {
    setFormData({
      image: plan.image || [],
      year_plan: plan.year_plan || "",
      month_plan: plan.month_plan || "",
      details_of_plan: plan.details_of_plan || "",
      plan_id: plan.plan_id || "",
    });
    setDialogState({
      open: true,
      isEdit: true,
      editingId: plan.id,
    });
  };

  const columns = [
    // {
    //   Header: "Plan",
    //   accessor: "plan",
    //   Cell: ({ row }) => <PlanItem item={row.original} />,
    // },

    {
      Header: "Plan ID",
      accessor: "plan_id",
    },
    {
      Header: "Member",
      accessor: "member",
    },
    {
      Header: "Existing disease",
      accessor: "existing_disease",
    },
    {
      Header: "details of disease",
      accessor: "existing_disease_details",
    },

    {
      Header: "Status",
      accessor: "plan_status",
      Cell: ({ row }) => (
        <Chip
          label={row.original.plan_status || "N/A"}
          color={
            row.original.plan_status === "active"
              ? "success"
              : row.original.plan_status === "yearly"
                ? "info"
                : "default"
          }
          size="small"
        />
      ),
    },
    // {
    //   Header: "Actions",
    //   accessor: "actions",
    //   Cell: ({ row }) => (
    //     <Box>
    //       {/* <IconButton onClick={() => editPlan(row.original)} color="info">
    //         <EditIcon />
    //       </IconButton> */}
    //       {/* <IconButton
    //         onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: row.original.id }))}
    //         color="error"
    //       >
    //         <DeleteIcon />
    //       </IconButton> */}
    //     </Box>
    //   ),
    // },
  ];

  if (state.loading && state.plans.length === 0) {
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
                    Health insurance
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search health insurance"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                    {/* <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState({ open: true, isEdit: false, editingId: null })}
                    >
                      Create New Plan
                    </Button> */}
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {state.filteredPlans.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: state.filteredPlans }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching plans found" : "No plans available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create/Edit Plan Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => {
          setDialogState({ open: false, isEdit: false, editingId: null });
          resetForm();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{dialogState.isEdit ? "Edit Plan" : "Create New Plan"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Plan ID *"
                name="plan_id"
                value={formData.plan_id}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.plan_id}
                helperText={formErrors.plan_id ? "Plan ID is required" : ""}
              />
              <TextField
                label="Yearly Plan Price ($) *"
                name="year_plan"
                type="number"
                value={formData.year_plan}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.year_plan}
                helperText={formErrors.year_plan ? "Valid price required" : ""}
              />
              <TextField
                label="Monthly Plan Price ($) *"
                name="month_plan"
                type="number"
                value={formData.month_plan}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.month_plan}
                helperText={formErrors.month_plan ? "Valid price required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Plan Details *"
                name="details_of_plan"
                value={formData.details_of_plan}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                error={formErrors.details_of_plan}
                helperText={formErrors.details_of_plan ? "Details are required" : ""}
              />
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*"
                  type="file"
                  id="planImages"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  multiple
                />
                <label htmlFor="planImages">
                  <Button
                    component="span"
                    color="error"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Plan Images
                  </Button>
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Box sx={{ width: "100%", mt: 1 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="caption" display="block" textAlign="center">
                      {uploadProgress}% uploaded
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {formData.image.map((img, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <img
                        src={img}
                        alt={`Plan ${index}`}
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.7)",
                          },
                        }}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image: prev.image.filter((_, i) => i !== index),
                          }));
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
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
            onClick={dialogState.isEdit ? handleUpdatePlan : handleCreatePlan}
            color="error"
            variant="contained"
            disabled={
              !formData.plan_id ||
              !formData.year_plan ||
              !formData.month_plan ||
              !formData.details_of_plan
            }
          >
            {dialogState.isEdit ? "Update Plan" : "Create Plan"}
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
          <MDTypography>Are you sure you want to delete this plan?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button onClick={handleDeletePlan} color="error" variant="contained">
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

InsurancePlansManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      plan_id: PropTypes.string.isRequired,
      year_plan: PropTypes.string,
      month_plan: PropTypes.string,
      details_of_plan: PropTypes.string,
      image: PropTypes.array,
      plan_status: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default InsurancePlansManagement;
