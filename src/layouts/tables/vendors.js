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
    vendor_type: "Medicine Vendor",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVendorType, setSelectedVendorType] = useState("Medicine Vendor");
  const [vendorCounts, setVendorCounts] = useState({
    medicine: 0,
    lab: 0,
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Fetch vendor counts for both types
  const fetchVendorCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [medicineRes, labRes] = await Promise.all([
        fetch(`${baseUrl}/vendor.get1?vendor_type=Medicine Vendor&page=1&page_size=1`, {
          headers: {
            "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${baseUrl}/vendor.get1?vendor_type=Lab Vendor&page=1&page_size=1`, {
          headers: {
            "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const medicineData = await medicineRes.json();
      const labData = await labRes.json();

      setVendorCounts({
        medicine: medicineData.total || 0,
        lab: labData.total || 0,
      });
    } catch (error) {
      console.error("Error fetching vendor counts:", error);
    }
  };

  // Fetch vendors based on selected type
  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const encodedVendorType = encodeURIComponent(selectedVendorType);
      const response = await fetch(
        `${baseUrl}/vendor.get1?vendor_type=${encodedVendorType}&page=${currentPage}&page_size=${pageSize}&search=${searchTerm}`,
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
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("No vendor data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorCounts();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [currentPage, pageSize, searchTerm, selectedVendorType]);

  const handleCreateVendor = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

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

      if (response.ok) {
        window.alert("Vendor created successfully!");
        handleClose();
        setCurrentPage(1);
        await fetchVendors();
        await fetchVendorCounts();
        setNewVendor({
          phoneNumber: "",
          deviceToken: "",
          name: "",
          email: "",
          vendor_type: "Medicine Vendor",
        });
      } else {
        window.alert("Error: " + (data.message || "Failed to create vendor"));
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      window.alert("Error creating vendor. Please try again.");
    } finally {
      setLoading(false);
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
          {/* Vendor Count Cards */}
          <Grid item xs={12} md={6}>
            <Card
              onClick={() => setSelectedVendorType("Medicine Vendor")}
              sx={{ cursor: "pointer" }}
            >
              <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">Medicine Vendors</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.medicine}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card onClick={() => setSelectedVendorType("Lab Vendor")} sx={{ cursor: "pointer" }}>
              <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6">Lab Vendors</MDTypography>
                <MDTypography variant="h4" color="primary">
                  {vendorCounts.lab}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          {/* Main Table */}
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
                    {selectedVendorType === "Medicine Vendor" ? "Medicine" : "Lab"} Vendors
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    {/* <FormControl sx={{ minWidth: 200 }} size="small">
                      <InputLabel>Page Size</InputLabel>
                      <Select
                        value={pageSize}
                        label="Page Size"
                        onChange={(e) => {
                          setPageSize(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <MenuItem value={5}>5 per page</MenuItem>
                        <MenuItem value={10}>10 per page</MenuItem>
                        <MenuItem value={25}>25 per page</MenuItem>
                        <MenuItem value={50}>50 per page</MenuItem>
                      </Select>
                    </FormControl> */}
                    <TextField
                      label="Search by Vendor Name or Email"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ width: 300 }}
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

      {/* Create Vendor Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Vendor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newVendor.name}
            onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="text"
            fullWidth
            variant="outlined"
            value={newVendor.phoneNumber}
            onChange={(e) => setNewVendor({ ...newVendor, phoneNumber: e.target.value })}
            sx={{ mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newVendor.email}
            onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
            sx={{ mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Device Token"
            type="text"
            fullWidth
            variant="outlined"
            value={newVendor.deviceToken}
            onChange={(e) => setNewVendor({ ...newVendor, deviceToken: e.target.value })}
            sx={{ mt: 1 }}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Vendor Type</InputLabel>
            <Select
              value={newVendor.vendor_type}
              label="Vendor Type"
              onChange={(e) => setNewVendor({ ...newVendor, vendor_type: e.target.value })}
            >
              <MenuItem value="Medicine Vendor">Medicine Vendor</MenuItem>
              <MenuItem value="Lab Vendor">Lab Vendor</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreateVendor}
            color="error"
            variant="contained"
            disabled={!newVendor.name || !newVendor.phoneNumber || !newVendor.email}
          >
            Create Vendor
          </Button>
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
