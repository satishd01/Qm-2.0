import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
import Pagination from "@mui/material/Pagination";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";
import DeleteIcon from "@mui/icons-material/Delete";

function Molecules() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [molecules, setMolecules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [newMolecule, setNewMolecule] = useState({
    molecule_name: "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moleculeToDelete, setMoleculeToDelete] = useState(null);

  const API_BASE_URL = "https://quickmeds.sndktech.online";
  const ACCESS_TOKEN = localStorage.getItem("token");
  const X_AUTHORIZATION = "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const fetchMolecules = async (page = 1, size = 10) => {
    try {
      if (!ACCESS_TOKEN) {
        console.error("No token found, please login again");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/molecule.get?page=${page}&page_size=${size}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "x-authorization": X_AUTHORIZATION,
          },
        }
      );

      if (response.data && response.data.status) {
        setMolecules(response.data.data);
        setTotalPages(Math.ceil(response.data.count / size));
      } else {
        console.error("No molecule data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching molecule data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMolecules(currentPage, pageSize);
  }, [currentPage, pageSize, searchTerm]);

  const handleCreateMolecule = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/molecule.add`,
        {
          molecule_name: newMolecule.molecule_name,
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "x-authorization": X_AUTHORIZATION,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status) {
        alert("Molecule created successfully!");
        setOpenDialog(false);
        fetchMolecules(currentPage, pageSize);
      } else {
        alert("Error: Unexpected response format");
      }
    } catch (error) {
      console.error("Error creating molecule:", error);
      alert(`Error creating molecule: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateMolecule = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/molecule.update/${editId}`,
        {
          molecule_name: newMolecule.molecule_name,
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "x-authorization": X_AUTHORIZATION,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status) {
        alert("Molecule updated successfully!");
        setEditId(null);
        setNewMolecule({ molecule_name: "" });
        setOpenDialog(false);
        fetchMolecules(currentPage, pageSize);
      } else {
        alert("Error: Unexpected response format");
      }
    } catch (error) {
      console.error("Error updating molecule:", error);
      alert(`Error updating molecule: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteMolecule = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/molecule.delete/${id}`, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "x-authorization": X_AUTHORIZATION,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.status) {
        alert("Molecule deleted successfully!");
        setDeleteConfirmOpen(false);
        fetchMolecules(currentPage, pageSize);
      } else {
        alert("Error: Unexpected response format");
      }
    } catch (error) {
      console.error("Error deleting molecule:", error);
      alert(`Error deleting molecule: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMolecule((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewMolecule({ molecule_name: "" });
    setEditId(null);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = event.target.value;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    {
      Header: "ID",
      accessor: "id",
      width: "10%",
    },
    {
      Header: "Molecule Name",
      accessor: "molecule_name",
      Cell: ({ value }) => (
        <Tooltip title={value || ""} placement="top">
          <div
            style={{
              maxWidth: "300px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value || "N/A"}
          </div>
        </Tooltip>
      ),
      width: "60%",
    },
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: ({ value }) => formatDate(value),
      width: "15%",
    },
    {
      Header: "Updated At",
      accessor: "updatedAt",
      Cell: ({ value }) => formatDate(value),
      width: "15%",
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              setEditId(row.original.id);
              setNewMolecule({
                molecule_name: row.original.molecule_name,
              });
              setOpenDialog(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setMoleculeToDelete(row.original.id);
              setDeleteConfirmOpen(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
      width: "20%",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Loading Molecules...</MDTypography>
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
                    Molecules
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search"
                      type="text"
                      fullWidth
                      value={searchTerm}
                      onChange={handleSearchChange}
                      sx={{
                        mr: 2,
                        width: { xs: "100%", sm: 200 },
                        [theme.breakpoints.down("sm")]: {
                          marginBottom: 2,
                        },
                      }}
                    />
                    <Button variant="contained" color="error" onClick={handleOpenDialog}>
                      Create Molecule
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: molecules }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
              <MDBox
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
              ></MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            width: "600px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>{editId ? "Edit Molecule" : "Create New Molecule"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Molecule Name"
            name="molecule_name"
            fullWidth
            margin="normal"
            value={newMolecule.molecule_name}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={editId ? handleUpdateMolecule : handleCreateMolecule}
            color="secondary"
            autoFocus
          >
            {editId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>Are you sure you want to delete this molecule?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteMolecule(moleculeToDelete);
              setMoleculeToDelete(null);
            }}
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

Molecules.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      molecule_name: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    }).isRequired,
  }).isRequired,
  value: PropTypes.string,
};

export default Molecules;
