import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Card,
  CircularProgress,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { Edit, Delete, Add } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://quickmeds.sndktech.online";

function Donations() {
  const [state, setState] = useState({
    donations: [],
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
    mode: "create",
    currentDonation: null,
    formData: {
      name: "",
      phoneNo: "",
      email: "",
      medicineData: [
        {
          medicineName: "",
          expiryDate: "",
        },
      ],
    },
    formErrors: {
      name: false,
      phoneNo: false,
      email: false,
      medicineName: false,
      expiryDate: false,
    },
  });

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

  const fetchDonations = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/donations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch donations");
      }

      const data = await response.json();
      if (response.ok) {
        setState((prev) => ({
          ...prev,
          donations: data.data || [],
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No donations found");
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      showSnackbar(error.message || "Error fetching donations", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const validateForm = () => {
    const errors = {
      name: !dialogState.formData.name,
      phoneNo: !dialogState.formData.phoneNo,
      email: !dialogState.formData.email,
      medicineName: !dialogState.formData.medicineData[0].medicineName,
      expiryDate: !dialogState.formData.medicineData[0].expiryDate,
    };

    setDialogState((prev) => ({
      ...prev,
      formErrors: errors,
    }));

    return !Object.values(errors).some(Boolean);
  };

  const handleCreateDonation = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-authorization": "YourXAuthorizationTokenHere",
        },
        body: JSON.stringify(dialogState.formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create donation");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Donation created successfully");
        setDialogState((prev) => ({ ...prev, open: false }));
        fetchDonations();
      }
    } catch (error) {
      console.error("Error creating donation:", error);
      showSnackbar(error.message || "Error creating donation", "error");
    }
  };

  const handleUpdateDonation = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/donations/${dialogState.currentDonation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-authorization": "YourXAuthorizationTokenHere",
        },
        body: JSON.stringify(dialogState.formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update donation");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Donation updated successfully");
        setDialogState((prev) => ({ ...prev, open: false }));
        fetchDonations();
      }
    } catch (error) {
      console.error("Error updating donation:", error);
      showSnackbar(error.message || "Error updating donation", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDialogState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
      },
      formErrors: {
        ...prev.formErrors,
        [name]: false,
      },
    }));
  };

  const handleMedicineInputChange = (index, e) => {
    const { name, value } = e.target;
    const newMedicineData = [...dialogState.formData.medicineData];
    newMedicineData[index][name] = value;
    setDialogState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        medicineData: newMedicineData,
      },
      formErrors: {
        ...prev.formErrors,
        [name]: false,
      },
    }));
  };

  const handleAddMedicine = () => {
    setDialogState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        medicineData: [
          ...prev.formData.medicineData,
          {
            medicineName: "",
            expiryDate: "",
          },
        ],
      },
    }));
  };

  const handleRemoveMedicine = (index) => {
    const newMedicineData = [...dialogState.formData.medicineData];
    newMedicineData.splice(index, 1);
    setDialogState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        medicineData: newMedicineData,
      },
    }));
  };

  const handleEditDonation = (donation) => {
    setDialogState({
      open: true,
      mode: "edit",
      currentDonation: donation,
      formData: {
        name: donation.name,
        phoneNo: donation.phoneNo,
        email: donation.email,
        medicineData: donation.medicineData.map((medicine) => ({
          medicineName: medicine.medicineName,
          expiryDate: medicine.expiryDate,
        })),
      },
      formErrors: {
        name: false,
        phoneNo: false,
        email: false,
        medicineName: false,
        expiryDate: false,
      },
    });
  };

  const handleCreateNewDonation = () => {
    setDialogState({
      open: true,
      mode: "create",
      currentDonation: null,
      formData: {
        name: "",
        phoneNo: "",
        email: "",
        medicineData: [
          {
            medicineName: "",
            expiryDate: "",
          },
        ],
      },
      formErrors: {
        name: false,
        phoneNo: false,
        email: false,
        medicineName: false,
        expiryDate: false,
      },
    });
  };

  const filteredDonations = state.donations.filter((donation) => {
    const searchTerm = state.searchTerm?.toLowerCase() || ""; // Use optional chaining and provide a default value if null
    return (
      (donation.name?.toLowerCase() || "").includes(searchTerm) || // Use optional chaining and provide a default value if null
      (donation.phoneNo?.toLowerCase() || "").includes(searchTerm) || // Use optional chaining and provide a default value if null
      (donation.email?.toLowerCase() || "").includes(searchTerm) // Use optional chaining and provide a default value if null
    );
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const columns = [
    { Header: "Name", accessor: "name" },
    { Header: "Phone No", accessor: "phone no" },
    { Header: "Email", accessor: "email" },
    // {
    //   Header: "Medicine Data",
    //   accessor: "medicineData",
    //   Cell: ({ value }) => (
    //     <Box>
    //       {value.map((medicine, index) => (
    //         <Typography key={index} variant="body2">
    //           {medicine.medicineName} - {medicine.expiryDate}
    //         </Typography>
    //       ))}
    //     </Box>
    //   ),
    // },
    // {
    //   Header: "Actions",
    //   Cell: ({ row }) => (
    //     <Box display="flex" gap={1}>
    //       <IconButton color="primary" onClick={() => handleEditDonation(row.original)}>
    //         <Edit />
    //       </IconButton>
    //       <IconButton
    //         color="error"
    //         onClick={() =>
    //           setDialogState((prev) => ({
    //             ...prev,
    //             confirmDelete: row.original.id,
    //           }))
    //         }
    //       >
    //         <Delete />
    //       </IconButton>
    //     </Box>
    //   ),
    // },
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
                    Donations
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Donations"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                      }
                      sx={{ width: 300 }}
                      size="small"
                    />
                    {/* <Button
                      variant="contained"
                      color="error"
                      startIcon={<Add />}
                      onClick={handleCreateNewDonation}
                    >
                      Add New Donation
                    </Button> */}
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {state.loading ? (
                  <MDBox p={3} display="flex" justifyContent="center">
                    <CircularProgress />
                  </MDBox>
                ) : filteredDonations.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredDonations }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching donations found" : "No donations available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogState.mode === "create" ? "Add New Donation" : "Edit Donation"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name *"
                name="name"
                value={dialogState.formData.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={dialogState.formErrors.name}
                helperText={dialogState.formErrors.name ? "Name is required" : ""}
              />
              <TextField
                label="Phone No *"
                name="phoneNo"
                value={dialogState.formData.phoneNo}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={dialogState.formErrors.phoneNo}
                helperText={dialogState.formErrors.phoneNo ? "Phone No is required" : ""}
              />
              <TextField
                label="Email *"
                name="email"
                value={dialogState.formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={dialogState.formErrors.email}
                helperText={dialogState.formErrors.email ? "Email is required" : ""}
              />
              {dialogState.formData.medicineData.map((medicine, index) => (
                <Box key={index} display="flex" flexDirection="column" gap={2} mt={2}>
                  <TextField
                    label="Medicine Name *"
                    name="medicineName"
                    value={medicine.medicineName}
                    onChange={(e) => handleMedicineInputChange(index, e)}
                    fullWidth
                    margin="normal"
                    error={dialogState.formErrors.medicineName}
                    helperText={
                      dialogState.formErrors.medicineName ? "Medicine Name is required" : ""
                    }
                  />
                  <TextField
                    label="Expiry Date *"
                    name="expiryDate"
                    value={medicine.expiryDate}
                    onChange={(e) => handleMedicineInputChange(index, e)}
                    fullWidth
                    margin="normal"
                    error={dialogState.formErrors.expiryDate}
                    helperText={dialogState.formErrors.expiryDate ? "Expiry Date is required" : ""}
                  />
                  <Button color="error" onClick={() => handleRemoveMedicine(index)}>
                    Remove Medicine
                  </Button>
                </Box>
              ))}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddMedicine}
                sx={{ mt: 2 }}
              >
                Add Medicine
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button
            onClick={dialogState.mode === "create" ? handleCreateDonation : handleUpdateDonation}
            color="error"
            variant="contained"
            disabled={
              !dialogState.formData.name ||
              !dialogState.formData.phoneNo ||
              !dialogState.formData.email ||
              !dialogState.formData.medicineData[0].medicineName ||
              !dialogState.formData.medicineData[0].expiryDate
            }
          >
            {dialogState.mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(dialogState.confirmDelete)}
        onClose={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this donation?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button onClick={() => {}} color="error" variant="contained">
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

// Define PropTypes for the Chip component used in the Status column
const MedicineDataCell = ({ value }) => (
  <Box>
    {value.map((medicine, index) => (
      <Typography key={index} variant="body2">
        {medicine.medicineName} - {medicine.expiryDate}
      </Typography>
    ))}
  </Box>
);

MedicineDataCell.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      medicineName: PropTypes.string.isRequired,
      expiryDate: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// Replace the Cell component in the columns array with the validated MedicineDataCell component
// columns[3].Cell = MedicineDataCell;

Donations.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      phoneNo: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      medicineData: PropTypes.arrayOf(
        PropTypes.shape({
          medicineName: PropTypes.string.isRequired,
          expiryDate: PropTypes.string.isRequired,
        })
      ),
    }).isRequired,
  }).isRequired,
};

export default Donations;
