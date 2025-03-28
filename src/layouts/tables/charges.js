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
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
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

function Charges() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    charges: [],
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
    deleteOpen: false,
    createOpen: false,
    currentCharge: null,
  });
  const [newCharge, setNewCharge] = useState({
    chargesType: "",
    amount: 0,
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const fetchCharges = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${baseUrl}/charges?page=${state.currentPage}&page_size=${DEFAULT_PAGE_SIZE}`,
        {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch charges");

      if (data?.status && data.data) {
        setState((prev) => ({
          ...prev,
          charges: data.data,
          totalPages: Math.ceil(data.data.length / DEFAULT_PAGE_SIZE),
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
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
  }, [state.currentPage, baseUrl, xAuthHeader]);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  const handleCreateCharge = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(`${baseUrl}/charges`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCharge),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Create failed");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Charge created successfully!",
          severity: "success",
        },
        currentPage: 1, // Reset to first page
      }));
      setNewCharge({ chargesType: "", amount: 0 });
      setDialogState((prev) => ({ ...prev, createOpen: false }));
      await fetchCharges(); // Refresh the list
    } catch (error) {
      console.error("Error creating charge:", error);
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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(`${baseUrl}/charges/${dialogState.currentCharge.id}`, {
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

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Charge deleted successfully!",
          severity: "success",
        },
        currentPage: 1, // Reset to first page
      }));
      setDialogState((prev) => ({ ...prev, deleteOpen: false, currentCharge: null }));
      await fetchCharges(); // Refresh the list
    } catch (error) {
      console.error("Error deleting charge:", error);
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
    { Header: "Charge Type", accessor: "chargesType" },
    { Header: "Amount", accessor: "amount" },
    { Header: "Created At", accessor: "createdAt" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <IconButton
          onClick={() => setDialogState({ deleteOpen: true, currentCharge: row.original })}
        >
          <DeleteIcon color="error" />
        </IconButton>
      ),
    },
  ];

  const filteredCharges = state.charges.filter((charge) => {
    if (!charge) return false;
    const search = state.searchTerm.toLowerCase();
    return (
      (charge.chargesType || "").toLowerCase().includes(search) ||
      (charge.amount?.toString() || "").includes(search)
    );
  });

  if (state.loading && state.charges.length === 0) {
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
                    Charges
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Charges"
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
                      onClick={() => setDialogState((prev) => ({ ...prev, createOpen: true }))}
                    >
                      Create Charge
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredCharges.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredCharges }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching charges found" : "No charges available"}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogState.deleteOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, deleteOpen: false }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>
            Are you sure you want to delete this charge:{" "}
            <strong>{dialogState.currentCharge?.chargesType}</strong>?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, deleteOpen: false }))}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Charge Dialog */}
      <Dialog
        open={dialogState.createOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, createOpen: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Charge</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="chargesType"
            label="Charge Type"
            fullWidth
            variant="outlined"
            value={newCharge.chargesType}
            onChange={(e) => setNewCharge((prev) => ({ ...prev, chargesType: e.target.value }))}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            name="amount"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={newCharge.amount}
            onChange={(e) =>
              setNewCharge((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, createOpen: false }))}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCharge}
            color="error"
            variant="contained"
            disabled={!newCharge.chargesType || newCharge.amount <= 0}
          >
            Create
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

Charges.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      chargesType: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Charges;
