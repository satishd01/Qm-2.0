import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Tips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [newTip, setNewTip] = useState({
    type: "",
    deliveryType: "",
    amount: 0,
  });
  const [editTip, setEditTip] = useState(null);
  const [deleteTip, setDeleteTip] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";

  // Options for dropdowns based on API response
  const typeOptions = ["Medicine Vendor", "Lab Vendor"];
  const deliveryTypeOptions = ["Medicine Delivery Boy", "Lab Delivery Boy"];

  const fetchTips = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/tips`, {
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status && data.tips) {
        setTips(data.tips);
        setTotalPages(data.totalPages);
      } else {
        console.error("No tips data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching tips data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch tips",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, [page]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewTip({
      type: "",
      deliveryType: "",
      amount: 0,
    });
  };

  const handleOpenEdit = (tip) => {
    setEditTip(tip);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditTip(null);
  };

  const handleOpenDelete = (tip) => {
    setDeleteTip(tip);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTip({
      ...newTip,
      [name]: value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTip({
      ...editTip,
      [name]: value,
    });
  };

  const handleCreateTip = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/tips`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTip),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Tip created successfully!",
          severity: "success",
        });
        handleClose();
        fetchTips();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to create tip",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating tip:", error);
      setSnackbar({
        open: true,
        message: "Error creating tip. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTip = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !editTip) {
        console.error("No token found or no tip selected for update");
        return;
      }

      const response = await fetch(`${baseUrl}/tips/${editTip.id}`, {
        method: "PUT",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: editTip.type,
          deliveryType: editTip.deliveryType,
          amount: editTip.amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Tip updated successfully!",
          severity: "success",
        });
        handleCloseEdit();
        fetchTips();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to update tip",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating tip:", error);
      setSnackbar({
        open: true,
        message: "Error updating tip. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTip = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !deleteTip) {
        console.error("No token found or no tip selected for deletion");
        return;
      }

      const response = await fetch(`${baseUrl}/tips/${deleteTip.id}`, {
        method: "DELETE",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Tip deleted successfully!",
          severity: "success",
        });
        handleCloseDelete();
        fetchTips();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to delete tip",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting tip:", error);
      setSnackbar({
        open: true,
        message: "Error deleting tip. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Type", accessor: "type" },
    { Header: "Delivery Type", accessor: "deliveryType" },
    {
      Header: "Amount",
      accessor: "amount",
      Cell: ({ value }) => `${value}`,
    },
    { Header: "Created At", accessor: "createdAt" },
    { Header: "Updated At", accessor: "updatedAt" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <MDBox display="flex" gap={1}>
          <IconButton onClick={() => handleOpenEdit(row.original)}>
            <EditIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => handleOpenDelete(row.original)}>
            <DeleteIcon color="error" />
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
                    Tips Table
                  </MDTypography>
                  <Button variant="contained" color="error" onClick={handleOpen}>
                    Add New Tip
                  </Button>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: tips }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  pagination={{
                    page,
                    totalPages,
                    onChange: (newPage) => setPage(newPage),
                  }}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Add New Tip Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Tip</DialogTitle>
        <DialogContent>
          <InputLabel id="type-label" sx={{ mt: 1 }} width>
            Type
          </InputLabel>
          <Select
            labelId="type-label"
            id="type"
            fullWidth
            variant="standard"
            value={newTip.type}
            onChange={handleInputChange}
            name="type"
            sx={{ mb: 2 }}
          >
            <MenuItem value="">
              <em>Select Type</em>
            </MenuItem>
            {typeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>

          <InputLabel id="delivery-type-label">Delivery Type</InputLabel>
          <Select
            labelId="delivery-type-label"
            id="deliveryType"
            fullWidth
            variant="standard"
            value={newTip.deliveryType}
            onChange={handleInputChange}
            name="deliveryType"
            sx={{ mb: 2 }}
          >
            <MenuItem value="">
              <em>Select Delivery Type</em>
            </MenuItem>
            {deliveryTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>

          <TextField
            margin="dense"
            id="amount"
            label="Amount"
            type="number"
            fullWidth
            variant="standard"
            value={newTip.amount}
            onChange={handleInputChange}
            name="amount"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateTip}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tip Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Tip</DialogTitle>
        <DialogContent>
          <InputLabel id="edit-type-label" sx={{ mt: 1 }}>
            Type
          </InputLabel>
          <Select
            labelId="edit-type-label"
            id="edit-type"
            fullWidth
            variant="standard"
            value={editTip?.type || ""}
            onChange={handleEditInputChange}
            name="type"
            sx={{ mb: 2 }}
          >
            {typeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>

          <InputLabel id="edit-delivery-type-label">Delivery Type</InputLabel>
          <Select
            labelId="edit-delivery-type-label"
            id="edit-deliveryType"
            fullWidth
            variant="standard"
            value={editTip?.deliveryType || ""}
            onChange={handleEditInputChange}
            name="deliveryType"
            sx={{ mb: 2 }}
          >
            {deliveryTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>

          <TextField
            margin="dense"
            id="edit-amount"
            label="Amount ($)"
            type="number"
            fullWidth
            variant="standard"
            value={editTip?.amount || 0}
            onChange={handleEditInputChange}
            name="amount"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleUpdateTip}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>Are you sure you want to delete this tip configuration?</MDTypography>
          <MDTypography>
            <strong>Type:</strong> {deleteTip?.type}
          </MDTypography>
          <MDTypography>
            <strong>Delivery Type:</strong> {deleteTip?.deliveryType}
          </MDTypography>
          <MDTypography>
            <strong>Amount:</strong> ${deleteTip?.amount}
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDeleteTip} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

Tips.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      deliveryType: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Tips;
