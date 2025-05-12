import { react, useEffect, useState } from "react";
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
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import React from "react";
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Users() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    countryCode: "",
    phone: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openRefill, setOpenRefill] = useState(false);
  const [refillData, setRefillData] = useState({
    month: 1,
    userId: null,
    productId: 1,
    refill: true,
  });
  const [userRefills, setUserRefills] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenRefill = (userId) => {
    setRefillData({ ...refillData, userId });
    setOpenRefill(true);
  };

  const handleCloseRefill = () => setOpenRefill(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleRefillInputChange = (e) => {
    const { name, value } = e.target;
    setRefillData({
      ...refillData,
      [name]: value,
    });
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token) {
        window.alert("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/users.reg`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        window.alert("User created successfully!");
        handleClose();
        setCurrentPage(1);

        const refreshResponse = await fetch(`${baseUrl}/users.getAllUser?page=1&page_size=10`, {
          headers: {
            "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
            Authorization: `Bearer ${token}`,
          },
        });
        const refreshData = await refreshResponse.json();
        if (refreshData && refreshData.users) {
          setUsers(refreshData.users);
          setTotalPages(refreshData.totalPages);
        }
      } else {
        window.alert("Error: " + (data.message || "Failed to create user"));
      }
    } catch (error) {
      console.error("Error creating user:", error);
      window.alert("Error creating user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRefill = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token) {
        window.alert("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/refill.add`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(refillData),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Refill added successfully!",
          severity: "success",
        });
        handleCloseRefill();
        fetchUserRefills(refillData.userId);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to add refill",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding refill:", error);
      setSnackbar({
        open: true,
        message: "Error adding refill. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRefills = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/refill?userId=${userId}`, {
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status && data.refills) {
        setUserRefills(data.refills);
      }
    } catch (error) {
      console.error("Error fetching refills:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch refills",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, please login again");
          return;
        }
        const response = await fetch(
          `${baseUrl}/users.getAllUser?page=${currentPage}&page_size=10&search=${searchTerm}`,
          {
            headers: {
              "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data && data.users) {
          setUsers(data.users);
          setTotalPages(data.totalPages);
        } else {
          console.error("No user data found in the response.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm]);

  const columns = [
    { Header: "User Name", accessor: "name" },
    { Header: "Age", accessor: "age" || "N/A" },
    { Header: "Gender", accessor: "gendre" || "N/A" },
    { Header: "Phone", accessor: "phone" },
    { Header: "Email", accessor: "email" },
    { Header: "User Type", accessor: "userType" },
    { Header: "Joined Date", accessor: "joinedAt" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Button variant="contained" color="error" onClick={() => handleOpenRefill(row.original.id)}>
          Refill
        </Button>
      ),
    },
  ];

  const filteredUsers = users.filter((user) => {
    const name = user.name || "";
    const phone = user.phone || "";
    const email = user.email || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Loading Users...</MDTypography>
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
                    Users
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search by Username or Email"
                      type="text"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{
                        mr: 2,
                        width: { xs: "100%", sm: 200 },
                        [theme.breakpoints.down("sm")]: {
                          marginBottom: 2,
                        },
                      }}
                    />
                    <Button variant="contained" color="error" onClick={handleOpen}>
                      Create User
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: filteredUsers }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
              <MDBox p={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, page) => setCurrentPage(page)}
                  color="primary"
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            margin="dense"
            id="countryCode"
            label="Country Code"
            type="text"
            fullWidth
            variant="standard"
            value={newUser.countryCode}
            onChange={(e) => setNewUser({ ...newUser, countryCode: e.target.value })}
          />
          <TextField
            margin="dense"
            id="phone"
            label="Phone"
            type="text"
            fullWidth
            variant="standard"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateUser}>Create</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openRefill} onClose={handleCloseRefill}>
        <DialogTitle>Add Refill</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="month"
            label="Month"
            type="number"
            fullWidth
            variant="standard"
            value={refillData.month}
            onChange={(e) => handleRefillInputChange(e)}
          />
          <TextField
            margin="dense"
            id="productId"
            label="Product ID"
            type="number"
            fullWidth
            variant="standard"
            value={refillData.productId}
            onChange={(e) => handleRefillInputChange(e)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefill}>Cancel</Button>
          <Button onClick={handleAddRefill}>Add</Button>
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

Users.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      email: PropTypes.string,
      userType: PropTypes.string.isRequired,
      joinedAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Users;
