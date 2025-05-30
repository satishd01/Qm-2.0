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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Avatar from "@mui/material/Avatar";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Authors() {
  const theme = useTheme();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    photo: "",
    degree: "",
    experience: 0,
    currentPosition: "",
    additionalInfo: "",
    type: "reviewed by",
  });
  const [editAuthor, setEditAuthor] = useState(null);
  const [deleteAuthor, setDeleteAuthor] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";

  const fetchAuthors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      let url = `${baseUrl}/authors`;
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

      if (data.status && data.data) {
        setAuthors(data.data);
      } else {
        console.error("No authors data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching authors data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch authors",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, [filterType]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewAuthor({
      name: "",
      photo: "",
      degree: "",
      experience: 0,
      currentPosition: "",
      additionalInfo: "",
      type: "reviewed by",
    });
    setSelectedFile(null);
  };

  const handleOpenEdit = (author) => {
    setEditAuthor(author);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedFile(null);
  };

  const handleOpenDelete = (author) => {
    setDeleteAuthor(author);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor({
      ...newAuthor,
      [name]: value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditAuthor({
      ...editAuthor,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const formData = new FormData();
      formData.append("files", selectedFile);

      const response = await fetch(`${baseUrl}/upload-files`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.files && data.files.length > 0) {
        const fileUrl = `${baseUrl}/uploads/${data.files[0]}`;
        if (openEdit && editAuthor) {
          setEditAuthor({ ...editAuthor, photo: fileUrl });
        } else {
          setNewAuthor({ ...newAuthor, photo: fileUrl });
        }
        setSnackbar({
          open: true,
          message: "File uploaded successfully!",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbar({
        open: true,
        message: "Error uploading file. Please try again.",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAuthor = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/authors`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAuthor),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Author created successfully!",
          severity: "success",
        });
        handleClose();
        fetchAuthors();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to create author",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating author:", error);
      setSnackbar({
        open: true,
        message: "Error creating author. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAuthor = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !editAuthor) {
        console.error("No token found or no author selected for update");
        return;
      }

      const response = await fetch(`${baseUrl}/authors/${editAuthor.id}`, {
        method: "PUT",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editAuthor),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Author updated successfully!",
          severity: "success",
        });
        handleCloseEdit();
        fetchAuthors();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to update author",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating author:", error);
      setSnackbar({
        open: true,
        message: "Error updating author. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !deleteAuthor) {
        console.error("No token found or no author selected for deletion");
        return;
      }

      const response = await fetch(`${baseUrl}/authors/${deleteAuthor.id}`, {
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
          message: data.message || "Author deleted successfully!",
          severity: "success",
        });
        handleCloseDelete();
        fetchAuthors();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to delete author",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting author:", error);
      setSnackbar({
        open: true,
        message: "Error deleting author. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    {
      Header: "Photo",
      accessor: "photo",
      Cell: ({ value }) => <Avatar alt="Author" src={value} sx={{ width: 56, height: 56 }} />,
    },
    { Header: "Name", accessor: "name" },
    { Header: "Degree", accessor: "degree" },
    { Header: "Experience", accessor: "experience" },
    { Header: "Current Position", accessor: "currentPosition" },
    { Header: "Additional Info", accessor: "additionalInfo" },
    { Header: "Type", accessor: "type" },
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
                    Author
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
                      <MenuItem value="reviewed by">Reviewed By</MenuItem>
                      <MenuItem value="compiled by">Compiled By</MenuItem>
                    </Select>
                    <Button variant="contained" color="error" onClick={handleOpen}>
                      Create Author
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: authors }}
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

      {/* Create Author Dialog - Maintained original design */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Author</DialogTitle>
        <DialogContent>
          <MDBox display="flex" alignItems="center" mb={2}>
            <Button
              color="error"
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
            >
              Upload Photo
              <input type="file" hidden onChange={handleFileChange} accept="image/*" />
            </Button>
            {selectedFile && (
              <Button
                variant="contained"
                color="error"
                onClick={handleUploadFile}
                disabled={uploading}
                sx={{ ml: 2 }}
              >
                {uploading ? "Uploading..." : "Confirm Upload"}
              </Button>
            )}
          </MDBox>
          {newAuthor.photo && (
            <MDBox display="flex" justifyContent="center" mb={2}>
              <Avatar alt="Author Preview" src={newAuthor.photo} sx={{ width: 100, height: 100 }} />
            </MDBox>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={newAuthor.name}
            onChange={handleInputChange}
            name="name"
          />
          <TextField
            margin="dense"
            id="degree"
            label="Degree"
            type="text"
            fullWidth
            variant="standard"
            value={newAuthor.degree}
            onChange={handleInputChange}
            name="degree"
          />
          <TextField
            margin="dense"
            id="experience"
            label="Experience"
            type="number"
            fullWidth
            variant="standard"
            value={newAuthor.experience}
            onChange={handleInputChange}
            name="experience"
          />
          <TextField
            margin="dense"
            id="currentPosition"
            label="Current Position"
            type="text"
            fullWidth
            variant="standard"
            value={newAuthor.currentPosition}
            onChange={handleInputChange}
            name="currentPosition"
          />
          <TextField
            margin="dense"
            id="additionalInfo"
            label="Additional Info"
            type="text"
            fullWidth
            variant="standard"
            value={newAuthor.additionalInfo}
            onChange={handleInputChange}
            name="additionalInfo"
          />
          <InputLabel id="type-label" sx={{ mt: 2 }}>
            Type
          </InputLabel>
          <Select
            labelId="type-label"
            id="type"
            fullWidth
            variant="standard"
            value={newAuthor.type}
            onChange={handleInputChange}
            name="type"
          >
            <MenuItem value="reviewed by">Reviewed By</MenuItem>
            <MenuItem value="compiled by">Compiled By</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateAuthor}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Author Dialog - Maintained original design */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Author</DialogTitle>
        <DialogContent>
          <MDBox display="flex" alignItems="center" mb={2}>
            <Button
              color="error"
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
            >
              Upload Photo
              <input type="file" hidden onChange={handleFileChange} accept="image/*" />
            </Button>
            {selectedFile && (
              <Button
                variant="contained"
                color="error"
                onClick={handleUploadFile}
                disabled={uploading}
                sx={{ ml: 2 }}
              >
                {uploading ? "Uploading..." : "Confirm Upload"}
              </Button>
            )}
          </MDBox>
          {editAuthor?.photo && (
            <MDBox display="flex" justifyContent="center" mb={2}>
              <Avatar
                alt="Author Preview"
                src={editAuthor.photo}
                sx={{ width: 100, height: 100 }}
              />
            </MDBox>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={editAuthor?.name || ""}
            onChange={handleEditInputChange}
            name="name"
          />
          <TextField
            margin="dense"
            id="degree"
            label="Degree"
            type="text"
            fullWidth
            variant="standard"
            value={editAuthor?.degree || ""}
            onChange={handleEditInputChange}
            name="degree"
          />
          <TextField
            margin="dense"
            id="experience"
            label="Experience"
            type="number"
            fullWidth
            variant="standard"
            value={editAuthor?.experience || 0}
            onChange={handleEditInputChange}
            name="experience"
          />
          <TextField
            margin="dense"
            id="currentPosition"
            label="Current Position"
            type="text"
            fullWidth
            variant="standard"
            value={editAuthor?.currentPosition || ""}
            onChange={handleEditInputChange}
            name="currentPosition"
          />
          <TextField
            margin="dense"
            id="additionalInfo"
            label="Additional Info"
            type="text"
            fullWidth
            variant="standard"
            value={editAuthor?.additionalInfo || ""}
            onChange={handleEditInputChange}
            name="additionalInfo"
          />
          <InputLabel id="edit-type-label" sx={{ mt: 2 }}>
            Type
          </InputLabel>
          <Select
            labelId="edit-type-label"
            id="edit-type"
            fullWidth
            variant="standard"
            value={editAuthor?.type || "reviewed by"}
            onChange={handleEditInputChange}
            name="type"
          >
            <MenuItem value="reviewed by">Reviewed By</MenuItem>
            <MenuItem value="compiled by">Compiled By</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleUpdateAuthor}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>
            Are you sure you want to delete this author: <strong>{deleteAuthor?.name}</strong>?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDeleteAuthor} color="error" variant="contained">
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

// Fixed prop-types validation
Authors.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      photo: PropTypes.string,
      degree: PropTypes.string.isRequired,
      experience: PropTypes.number.isRequired,
      currentPosition: PropTypes.string.isRequired,
      additionalInfo: PropTypes.string,
      type: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  value: PropTypes.string, // Added value prop validation
};

export default Authors;
