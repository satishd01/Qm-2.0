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
  InputAdornment,
  Snackbar,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  CloudUpload as CloudUploadIcon,
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

function LabTests() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    labTests: [],
    loading: true,
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });
  const [dialogState, setDialogState] = useState({
    open: false,
    uploading: false,
  });
  const [formData, setFormData] = useState({
    bannerImage: "",
    coverImage: "",
    testName: "",
    description: "",
    mrp: 0,
    sellingPrice: 0,
    preparations: "",
    sampleRequired: "",
    recommendedFor: "",
    others: [],
    containsMultipleTest: [],
    faq: [],
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const fetchLabTests = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(
        `${baseUrl}/labTest.get?page=${state.currentPage}&page_size=${DEFAULT_PAGE_SIZE}`,
        {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch lab tests");

      if (data?.labTests) {
        setState((prev) => ({
          ...prev,
          labTests: data.labTests,
          totalPages: data.totalPages || 1,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching lab tests:", error);
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
  }, [state.currentPage, baseUrl, xAuthHeader, navigate]);

  useEffect(() => {
    fetchLabTests();
  }, [fetchLabTests]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "mrp" || name === "sellingPrice" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleNestedInputChange = (section, index, field, value) => {
    setFormData((prev) => {
      const updatedSection = [...(prev[section] || [])];
      updatedSection[index] = {
        ...updatedSection[index],
        [field]: value,
      };
      return {
        ...prev,
        [section]: updatedSection,
      };
    });
  };

  const handleAddSectionItem = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [
        ...(prev[section] || []),
        section === "faq" ? { question: "", answer: "" } : { title: "", description: "" },
      ],
    }));
  };

  const handleRemoveSectionItem = (section, index) => {
    setFormData((prev) => {
      const updatedSection = [...(prev[section] || [])];
      updatedSection.splice(index, 1);
      return {
        ...prev,
        [section]: updatedSection,
      };
    });
  };

  const handleImageUpload = async (event, fieldName) => {
    const file = event.target.files[0];
    if (!file) return;

    setDialogState((prev) => ({ ...prev, uploading: true }));

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
        setFormData((prev) => ({
          ...prev,
          [fieldName]: `${baseUrl}/${data.files[0]}`,
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    } finally {
      setDialogState((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      if (!formData.testName || !formData.description) {
        setState((prev) => ({
          ...prev,
          snackbar: {
            open: true,
            message: "Test Name and Description are required",
            severity: "warning",
          },
        }));
        return;
      }

      // Clean empty items from arrays
      const cleanedData = {
        ...formData,
        others: (formData.others || []).filter((item) => item.title || item.description),
        faq: (formData.faq || []).filter((item) => item.question || item.answer),
      };

      const response = await fetch(`${baseUrl}/labTest.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create lab test");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Lab test created successfully!",
          severity: "success",
        },
        currentPage: 1, // Reset to first page
      }));
      setDialogState((prev) => ({ ...prev, open: false }));
      await fetchLabTests(); // Refresh the list
    } catch (error) {
      console.error("Submission error:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    }
  };

  const columns = [
    { Header: "Test Name", accessor: "testName" },
    { Header: "MRP", accessor: "mrp" },
    { Header: "Selling Price", accessor: "sellingPrice" },
    { Header: "Sample Required", accessor: "sampleRequired" },
    { Header: "Recommended For", accessor: "recommendedFor" },
  ];

  const filteredLabTests = state.labTests.filter((test) => {
    if (!test) return false;
    const search = state.searchTerm.toLowerCase();
    return (
      (test.testName || "").toLowerCase().includes(search) ||
      (test.preparations || "").toLowerCase().includes(search) ||
      (test.sampleRequired || "").toLowerCase().includes(search)
    );
  });

  if (state.loading && state.labTests.length === 0) {
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
                    Lab Tests
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Lab Tests"
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
                      onClick={() => setDialogState((prev) => ({ ...prev, open: true }))}
                    >
                      Create Lab Test
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredLabTests.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredLabTests }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching lab tests found" : "No lab tests available"}
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

      {/* Create Lab Test Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create New Lab Test</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Test Name *"
                name="testName"
                value={formData.testName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
              <TextField
                label="Recommended For (e.g., male, female)"
                name="recommendedFor"
                value={formData.recommendedFor}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            {/* Pricing and Images */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="MRP (₹)"
                    name="mrp"
                    type="number"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Selling Price (₹)"
                    name="sellingPrice"
                    type="number"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Preparations"
                name="preparations"
                value={formData.preparations}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                margin="normal"
              />

              <TextField
                label="Sample Required"
                name="sampleRequired"
                value={formData.sampleRequired}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />

              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <input
                    type="file"
                    id="bannerImageInput"
                    onChange={(e) => handleImageUpload(e, "bannerImage")}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                  <label htmlFor="bannerImageInput">
                    <Button
                      component="span"
                      variant="outlined"
                      color="primary"
                      startIcon={<CloudUploadIcon />}
                      disabled={dialogState.uploading}
                      fullWidth
                    >
                      {dialogState.uploading ? "Uploading..." : "Banner Image"}
                    </Button>
                  </label>
                  {formData.bannerImage && (
                    <MDTypography variant="caption" display="block" noWrap>
                      {formData.bannerImage.split("/").pop()}
                    </MDTypography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <input
                    type="file"
                    id="coverImageInput"
                    onChange={(e) => handleImageUpload(e, "coverImage")}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                  <label htmlFor="coverImageInput">
                    <Button
                      component="span"
                      variant="outlined"
                      color="primary"
                      startIcon={<CloudUploadIcon />}
                      disabled={dialogState.uploading}
                      fullWidth
                    >
                      Cover Image
                    </Button>
                  </label>
                  {formData.coverImage && (
                    <MDTypography variant="caption" display="block" noWrap>
                      {formData.coverImage.split("/").pop()}
                    </MDTypography>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <MDTypography variant="h6" gutterBottom mt={2}>
                Additional Information
              </MDTypography>
              {(formData.others || []).map((item, index) => (
                <MDBox key={`other-${index}`} mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="subtitle2">Section {index + 1}</MDTypography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSectionItem("others", index)}
                      color="error"
                    >
                      <RemoveCircleIcon fontSize="small" />
                    </IconButton>
                  </MDBox>
                  <TextField
                    label="Title"
                    value={item.title || ""}
                    onChange={(e) =>
                      handleNestedInputChange("others", index, "title", e.target.value)
                    }
                    fullWidth
                    margin="dense"
                  />
                  <TextField
                    label="Description"
                    value={item.description || ""}
                    onChange={(e) =>
                      handleNestedInputChange("others", index, "description", e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={2}
                    margin="dense"
                  />
                </MDBox>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                onClick={() => handleAddSectionItem("others")}
                sx={{ mt: 2 }}
              >
                Add Information Section
              </Button>
            </Grid>

            {/* FAQs */}
            <Grid item xs={12}>
              <MDTypography variant="h6" gutterBottom mt={2}>
                Frequently Asked Questions
              </MDTypography>
              {(formData.faq || []).map((item, index) => (
                <MDBox key={`faq-${index}`} mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="subtitle2">FAQ {index + 1}</MDTypography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSectionItem("faq", index)}
                      color="error"
                    >
                      <RemoveCircleIcon fontSize="small" />
                    </IconButton>
                  </MDBox>
                  <TextField
                    label="Question"
                    value={item.question || ""}
                    onChange={(e) =>
                      handleNestedInputChange("faq", index, "question", e.target.value)
                    }
                    fullWidth
                    margin="dense"
                  />
                  <TextField
                    label="Answer"
                    value={item.answer || ""}
                    onChange={(e) =>
                      handleNestedInputChange("faq", index, "answer", e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={2}
                    margin="dense"
                  />
                </MDBox>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                onClick={() => handleAddSectionItem("faq")}
                sx={{ mt: 2 }}
              >
                Add FAQ
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="error"
            variant="contained"
            disabled={!formData.testName || !formData.description}
          >
            Create Lab Test
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

LabTests.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      testName: PropTypes.string.isRequired,
      mrp: PropTypes.number.isRequired,
      sellingPrice: PropTypes.number.isRequired,
      preparations: PropTypes.string.isRequired,
      sampleRequired: PropTypes.string.isRequired,
      recommendedFor: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default LabTests;
