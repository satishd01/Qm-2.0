import { useEffect, useState } from "react";
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

function Vendors() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    phoneNumber: "",
    deviceToken: "",
    name: "",
    email: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default page size
  const [totalPages, setTotalPages] = useState(1);

  // Get the base URL from the environment variable or use a default value
  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";

  // Define handleOpen and handleClose functions
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, please login again");
          return;
        }
        const response = await fetch(
          `${baseUrl}/vendor.get1?vendor_type=Medicine%20Vendor&page=${currentPage}&page_size=${pageSize}&search=${searchTerm}`,
          {
            headers: {
              "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data && data.vendors) {
          setVendors(data.vendors);
          setTotalPages(data.totalPages);
        } else {
          console.error("No vendor data found in the response.");
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [currentPage, pageSize, searchTerm]);

  const handleCreateVendor = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true); // Set loading state

      if (!token) {
        window.alert("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/vendor.add`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newVendor),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        window.alert("Vendor created successfully!");
        handleClose();
        setCurrentPage(1); // Reset to first page

        // Refresh the vendor list
        const refreshResponse = await fetch(
          `${baseUrl}/vendor.get1?vendor_type=Medicine%20Vendor&page=1&page_size=${pageSize}`,
          {
            headers: {
              "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const refreshData = await refreshResponse.json();
        if (refreshData && refreshData.vendors) {
          setVendors(refreshData.vendors);
          setTotalPages(refreshData.totalPages);
        }
      } else {
        window.alert("Error: " + (data.message || "Failed to create vendor"));
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      window.alert("Error creating vendor. Please try again.");
    } finally {
      setLoading(false); // Clear loading state
    }
  };

  const columns = [
    { Header: "Vendor Name", accessor: "shop_name" },
    { Header: "Phone Number", accessor: "phoneNumber" },
    { Header: "Email", accessor: "email" },
    { Header: "Vendor Type", accessor: "vendor_type" },
    { Header: "Working Status", accessor: "working_status" },
    { Header: "Joined At", accessor: "createdAt" },
  ];

  const filteredVendors = vendors.filter((vendor) => {
    const name = vendor.shop_name || "";
    const phone = vendor.phoneNumber || "";
    const email = vendor.email || "";
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
          <MDTypography>Loading Vendors...</MDTypography>
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
                    Vendors Table
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search by Vendor Name or Email"
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
                      Create Vendor
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: filteredVendors }}
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
        <DialogTitle>Create New Vendor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={newVendor.name}
            onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
          />
          <TextField
            margin="dense"
            id="phoneNumber"
            label="Phone Number"
            type="text"
            fullWidth
            variant="standard"
            value={newVendor.phoneNumber}
            onChange={(e) => setNewVendor({ ...newVendor, phoneNumber: e.target.value })}
          />
          <TextField
            margin="dense"
            id="email"
            label="Email"
            type="text"
            fullWidth
            variant="standard"
            value={newVendor.email}
            onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
          />
          <TextField
            margin="dense"
            id="deviceToken"
            label="Device Token"
            type="text"
            fullWidth
            variant="standard"
            value={newVendor.deviceToken}
            onChange={(e) => setNewVendor({ ...newVendor, deviceToken: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateVendor}>Create</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

Vendors.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      shop_name: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string.isRequired,
      email: PropTypes.string,
      vendor_type: PropTypes.string.isRequired,
      working_status: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Vendors;
