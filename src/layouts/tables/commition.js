import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import InputLabel from "@mui/material/InputLabel";
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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Commissions() {
  const theme = useTheme();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [newCommission, setNewCommission] = useState({
    type: "Medicine vendor",
    commission: 0,
  });
  const [editCommission, setEditCommission] = useState(null);
  const [deleteCommission, setDeleteCommission] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";

  const fetchCommissions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      let url = `${baseUrl}/commission.get`;
      if (filterType) {
        url += `?type=${encodeURIComponent(filterType)}`;
      }

      const response = await fetch(url, {
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status && data.commissions) {
        setCommissions(data.commissions);
      } else {
        console.error("No commissions data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching commissions data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch commissions",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [filterType]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenEdit = (commission) => {
    setEditCommission(commission);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => setOpenEdit(false);

  const handleOpenDelete = (commission) => {
    setDeleteCommission(commission);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCommission({
      ...newCommission,
      [name]: value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCommission({
      ...editCommission,
      [name]: value,
    });
  };

  const handleCreateCommission = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/commission.add`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCommission),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Commission created successfully!",
          severity: "success",
        });
        handleClose();
        fetchCommissions();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to create commission",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating commission:", error);
      setSnackbar({
        open: true,
        message: "Error creating commission. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommission = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !editCommission) {
        console.error("No token found or no commission selected for update");
        return;
      }

      const response = await fetch(`${baseUrl}/commission.update`, {
        method: "PUT",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editCommission),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Commission updated successfully!",
          severity: "success",
        });
        handleCloseEdit();
        fetchCommissions();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to update commission",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating commission:", error);
      setSnackbar({
        open: true,
        message: "Error updating commission. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCommission = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !deleteCommission) {
        console.error("No token found or no commission selected for deletion");
        return;
      }

      const response = await fetch(`${baseUrl}/commission.delete/${deleteCommission.id}`, {
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
          message: data.message || "Commission deleted successfully!",
          severity: "success",
        });
        handleCloseDelete();
        fetchCommissions();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to delete commission",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting commission:", error);
      setSnackbar({
        open: true,
        message: "Error deleting commission. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Type", accessor: "type" },
    { Header: "Commission", accessor: "commission" },
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
                    Commissions
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <Select
                      labelId="filter-type-label"
                      id="filter-type"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      sx={{ width: 200 }}
                      displayEmpty
                      renderValue={(value) => (value ? value : "Filter by Type")}
                    >
                      <MenuItem value="">
                        <em>Filter by Type</em>
                      </MenuItem>
                      <MenuItem value="Medicine vendor">Medicine Vendor</MenuItem>
                      <MenuItem value="Lab vendor">Lab Vendor</MenuItem>
                    </Select>
                    <Button variant="contained" color="error" onClick={handleOpen}>
                      Create Commission
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: commissions }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Commission</DialogTitle>
        <DialogContent>
          <Select
            margin="dense"
            id="type"
            label="Type"
            fullWidth
            variant="standard"
            value={newCommission.type}
            onChange={handleInputChange}
            name="type"
          >
            <MenuItem value="Medicine vendor">Medicine Vendor</MenuItem>
            <MenuItem value="Lab vendor">Lab Vendor</MenuItem>
          </Select>
          <TextField
            margin="dense"
            id="commission"
            label="Commission"
            type="number"
            fullWidth
            variant="standard"
            value={newCommission.commission}
            onChange={handleInputChange}
            name="commission"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateCommission}>Create</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Commission</DialogTitle>
        <DialogContent>
          <Select
            margin="dense"
            id="type"
            label="Type"
            fullWidth
            variant="standard"
            value={editCommission?.type}
            onChange={handleEditInputChange}
            name="type"
          >
            <MenuItem value="Medicine vendor">Medicine Vendor</MenuItem>
            <MenuItem value="Lab vendor">Lab Vendor</MenuItem>
          </Select>
          <TextField
            margin="dense"
            id="commission"
            label="Commission"
            type="number"
            fullWidth
            variant="standard"
            value={editCommission?.commission}
            onChange={handleEditInputChange}
            name="commission"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleUpdateCommission}>Update</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>
            Are you sure you want to delete this commission:{" "}
            <strong>{deleteCommission?.type}</strong>?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDeleteCommission} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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

Commissions.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      commission: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Commissions;
