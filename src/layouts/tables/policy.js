import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import InputLabel from "@mui/material/InputLabel";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Policies() {
  const theme = useTheme();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policyType, setPolicyType] = useState("");
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    policyType: "",
    description: "",
  });
  const [editPolicy, setEditPolicy] = useState(null);
  const [deletePolicy, setDeletePolicy] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      let url = `${baseUrl}/policy`;
      if (policyType) {
        url += `?policyType=${encodeURIComponent(policyType)}`;
      }

      const response = await fetch(url, {
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status && data.policies) {
        setPolicies(data.policies);
      } else {
        console.error("No policies data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching policies data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch policies",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewPolicy({
      policyType: "",
      description: "",
    });
  };

  const handleOpenEdit = (policy) => {
    setEditPolicy(policy);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditPolicy(null);
  };

  const handleOpenDelete = (policy) => {
    setDeletePolicy(policy);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPolicy({
      ...newPolicy,
      [name]: value,
    });
  };

  const handleDescriptionChange = (value) => {
    setNewPolicy({
      ...newPolicy,
      description: value,
    });
  };

  const handleEditDescriptionChange = (value) => {
    setEditPolicy({
      ...editPolicy,
      description: value,
    });
  };

  const handleCreatePolicy = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/policy`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPolicy),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Policy created successfully!",
          severity: "success",
        });
        handleClose();
        fetchPolicies();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to create policy",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating policy:", error);
      setSnackbar({
        open: true,
        message: "Error creating policy. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !editPolicy) {
        console.error("No token found or no policy selected for update");
        return;
      }

      const response = await fetch(`${baseUrl}/policy/${editPolicy.id}`, {
        method: "PUT",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: editPolicy.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Policy updated successfully!",
          severity: "success",
        });
        handleCloseEdit();
        fetchPolicies();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to update policy",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating policy:", error);
      setSnackbar({
        open: true,
        message: "Error updating policy. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !deletePolicy) {
        console.error("No token found or no policy selected for deletion");
        return;
      }

      const response = await fetch(`${baseUrl}/policy/${deletePolicy.id}`, {
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
          message: data.message || "Policy deleted successfully!",
          severity: "success",
        });
        handleCloseDelete();
        fetchPolicies();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to delete policy",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting policy:", error);
      setSnackbar({
        open: true,
        message: "Error deleting policy. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [policyType]);

  const columns = [
    { Header: "ID", accessor: "id" },
    // { Header: "Policy Type", accessor: "policyType" },
    {
      Header: "Description",
      accessor: "description",
      Cell: ({ value }) => (
        <div
          dangerouslySetInnerHTML={{ __html: value }}
          style={{ maxHeight: "100px", overflow: "hidden" }}
        />
      ),
    },
    { Header: "Created At", accessor: "createdAt" },
    // { Header: "Updated At", accessor: "updatedAt" },
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

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "link"];

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
                    Policies
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search by Policy Type"
                      type="text"
                      fullWidth
                      value={policyType}
                      onChange={(e) => setPolicyType(e.target.value)}
                      sx={{
                        mr: 2,
                        width: { xs: "100%", sm: 200 },
                        [theme.breakpoints.down("sm")]: {
                          marginBottom: 2,
                        },
                      }}
                    />
                    <Button variant="contained" color="error" onClick={handleOpen}>
                      Create Policy
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: policies }}
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

      {/* Create Policy Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create New Policy</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="policyType"
            label="Policy Type"
            type="text"
            fullWidth
            variant="standard"
            value={newPolicy.policyType}
            onChange={handleInputChange}
            name="policyType"
            sx={{ mb: 3 }}
          />
          <InputLabel>Description</InputLabel>
          <ReactQuill
            theme="snow"
            value={newPolicy.description}
            onChange={handleDescriptionChange}
            modules={modules}
            formats={formats}
            style={{ height: "200px", marginBottom: "50px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreatePolicy}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="md">
        <DialogTitle>Edit Policy</DialogTitle>
        <DialogContent>
          <MDBox mb={2}>
            <MDTypography variant="h6">Policy Type:</MDTypography>
            <MDTypography>{editPolicy?.policyType}</MDTypography>
          </MDBox>
          <InputLabel>Description</InputLabel>
          <ReactQuill
            theme="snow"
            value={editPolicy?.description || ""}
            onChange={handleEditDescriptionChange}
            modules={modules}
            formats={formats}
            style={{ height: "200px", marginBottom: "50px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleUpdatePolicy}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>
            Are you sure you want to delete this policy: <strong>{deletePolicy?.policyType}</strong>
            ?
          </MDTypography>
          <MDTypography mt={2}>
            <strong>Description:</strong>
          </MDTypography>
          <div
            dangerouslySetInnerHTML={{ __html: deletePolicy?.description || "" }}
            style={{
              maxHeight: "200px",
              overflow: "auto",
              border: "1px solid #eee",
              padding: "10px",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDeletePolicy} color="error" variant="contained">
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

Policies.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      policyType: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Policies;
