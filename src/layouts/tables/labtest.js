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
  Switch,
  FormGroup,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  CloudUpload as CloudUploadIcon,
  Schedule as ScheduleIcon,
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
    slotDialog: {
      open: false,
      labTestId: null,
      loading: false,
    },
  });
  const [formData, setFormData] = useState({
    bannerImage: "",
    coverImage: "",
    prescription: "",
    prescriptionRequired: false,
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
    discount: 0,
    fasting: false,
    compiled_by: "",
    reviewed_by: "",
  });
  const [slotForm, setSlotForm] = useState({
    slot: "",
    date: "",
    time: "",
    price: "",
  });

  const [authors, setAuthors] = useState([]);

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  // Time slots options
  const timeSlots = [
    "01AM to 02AM",
    "02AM to 03AM",
    "03AM to 04AM",
    "04AM to 05AM",
    "05AM to 06AM",
    "06AM to 07AM",
    "07AM to 08AM",
    "08AM to 09AM",
    "09AM to 10AM",
    "10AM to 11AM",
    "11AM to 12PM",
    "12PM to 01PM",
    "01PM to 02PM",
    "02PM to 03PM",
    "03PM to 04PM",
    "04PM to 05PM",
    "05PM to 06PM",
    "06PM to 07PM",
    "07PM to 08PM",
    "08PM to 09PM",
    "09PM to 10PM",
    "10PM to 11PM",
    "11PM to 12AM",
    "12AM to 01AM",
  ];

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

  const fetchAuthors = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/authors`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data?.data) {
        setAuthors(data.data);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Failed to load authors",
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  useEffect(() => {
    fetchAuthors();
    fetchLabTests();
  }, [fetchLabTests, fetchAuthors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "mrp" || name === "sellingPrice" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSlotInputChange = (e) => {
    const { name, value } = e.target;
    setSlotForm((prev) => ({
      ...prev,
      [name]: value,
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
          [fieldName]: `/uploads/${data.files[0]}`,
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

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    const mrp = formData.mrp;
    const sellingPrice = mrp - (mrp * discount) / 100;
    setFormData((prev) => ({
      ...prev,
      discount,
      sellingPrice,
    }));
  };

  const handlePrescriptionRequiredChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      prescriptionRequired: e.target.checked,
    }));
  };

  const handleFastingChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      fasting: e.target.checked,
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      if (!formData.testName) {
        setState((prev) => ({
          ...prev,
          snackbar: {
            open: true,
            message:
              "Test Name ,Sample,Mrp,Selling Price,Discount,Prescription Required are required",
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

  const handleOpenSlotDialog = (labTestId) => {
    setDialogState((prev) => ({
      ...prev,
      slotDialog: {
        ...prev.slotDialog,
        open: true,
        labTestId,
      },
    }));
    // Reset form when opening
    setSlotForm({
      slot: "",
      date: "",
      time: "",
      price: "",
    });
  };

  const handleCloseSlotDialog = () => {
    setDialogState((prev) => ({
      ...prev,
      slotDialog: {
        ...prev.slotDialog,
        open: false,
        labTestId: null,
        loading: false,
      },
    }));
  };

  const handleCreateSlot = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/authentication/sign-in");
        return;
      }

      if (!slotForm.slot || !slotForm.date || !slotForm.time || !slotForm.price) {
        setState((prev) => ({
          ...prev,
          snackbar: {
            open: true,
            message: "All slot fields are required",
            severity: "warning",
          },
        }));
        return;
      }

      setDialogState((prev) => ({
        ...prev,
        slotDialog: {
          ...prev.slotDialog,
          loading: true,
        },
      }));

      const payload = {
        slot: parseInt(slotForm.slot),
        date: slotForm.date,
        time: slotForm.time,
        price: slotForm.price,
        labTestId: dialogState.slotDialog.labTestId,
      };

      const response = await fetch(`${baseUrl}/slots1.create`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create slot");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Slot created successfully!",
          severity: "success",
        },
      }));
      handleCloseSlotDialog();
    } catch (error) {
      console.error("Slot creation error:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    } finally {
      setDialogState((prev) => ({
        ...prev,
        slotDialog: {
          ...prev.slotDialog,
          loading: false,
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
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<ScheduleIcon />}
          onClick={() => handleOpenSlotDialog(row.original.id)}
        >
          Add Slot
        </Button>
      ),
    },
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
                    label="Discount (%)"
                    name="discount"
                    type="number"
                    value={formData.discount}
                    onChange={handleDiscountChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">%</InputAdornment>,
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
                      variant="contained"
                      color="error"
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
                      variant="contained"
                      color="error"
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

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Compiled By</InputLabel>
                <Select
                  name="compiled_by"
                  value={formData.compiled_by}
                  onChange={handleInputChange}
                  label="Compiled By"
                  sx={{ width: 350, height: 40 }}
                >
                  {authors.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Reviewed By</InputLabel>
                <Select
                  name="reviewed_by"
                  value={formData.reviewed_by}
                  onChange={handleInputChange}
                  label="Reviewed By"
                  sx={{ width: 350, height: 40 }}
                >
                  {authors.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                variant="contained"
                color="error"
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
                variant="contained"
                color="error"
                startIcon={<AddCircleIcon />}
                onClick={() => handleAddSectionItem("faq")}
                sx={{ mt: 2 }}
              >
                Add FAQ
              </Button>
            </Grid>

            {/* Prescription and Fasting */}
            <Grid item xs={12}>
              <MDTypography variant="h6" gutterBottom mt={2}>
                Additional Options
              </MDTypography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.prescriptionRequired}
                      onChange={handlePrescriptionRequiredChange}
                      name="prescriptionRequired"
                    />
                  }
                  label="Prescription Required"
                />
                {formData.prescriptionRequired && (
                  <input
                    type="file"
                    id="prescriptionInput"
                    onChange={(e) => handleImageUpload(e, "prescription")}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                )}
                {formData.prescriptionRequired && (
                  <label htmlFor="prescriptionInput">
                    <Button
                      component="span"
                      variant="contained"
                      color="error"
                      startIcon={<CloudUploadIcon />}
                      disabled={dialogState.uploading}
                      fullWidth
                    >
                      {dialogState.uploading ? "Uploading..." : "Upload Prescription"}
                    </Button>
                  </label>
                )}
                {formData.prescription && (
                  <MDTypography variant="caption" display="block" noWrap>
                    {formData.prescription.split("/").pop()}
                  </MDTypography>
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.fasting}
                      onChange={handleFastingChange}
                      name="fasting"
                    />
                  }
                  label="Fasting Required"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="error" variant="contained">
            Create Lab Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Slot Dialog */}
      <Dialog
        open={dialogState.slotDialog.open}
        onClose={handleCloseSlotDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Slot</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Slot Number"
                name="slot"
                type="number"
                value={slotForm.slot}
                onChange={handleSlotInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  inputProps: { min: 1 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={slotForm.date}
                onChange={handleSlotInputChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Time Slot</InputLabel>
                <Select
                  name="time"
                  value={slotForm.time}
                  onChange={handleSlotInputChange}
                  label="Time Slot"
                  sx={{ width: 250, height: 40 }}
                >
                  {timeSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Price"
                name="price"
                type="number"
                value={slotForm.price}
                onChange={handleSlotInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0 },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSlotDialog}>Cancel</Button>
          <Button onClick={handleCreateSlot} color="error" variant="contained">
            {dialogState.slotDialog.loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Slot"
            )}
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
