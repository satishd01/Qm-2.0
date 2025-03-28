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

function FAQs() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default page size
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
    is_visible: true,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCharges = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${baseUrl}/charges?page=${page}&page_size=${size}&search=${searchTerm}`,
        {
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data?.status && data.data) {
        setCharges(data.data);
        setTotalPages(Math.ceil(data.count / size)); // Assuming your API returns a count
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch charges",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges(currentPage, pageSize);
  }, [currentPage, pageSize, searchTerm]);

  const handleCreateCharge = async () => {
    try {
      const token = localStorage.getItem("token");

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
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Charge created successfully!",
          severity: "success",
        });
        setNewCharge({
          chargesType: "",
          amount: 0,
        });
        handleCloseCreateCharge();
        fetchCharges(currentPage, pageSize); // Refresh the charges list
      } else {
        setSnackbar({
          open: true,
          message: data?.message || "Create failed",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating charge:", error);
      setSnackbar({
        open: true,
        message: "Error creating charge",
        severity: "error",
      });
    }
  };
  ss;
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFaq((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewFaq({
      question: "",
      answer: "",
      is_visible: true,
    });
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = event.target.value;
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to the first page when page size changes
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when search term changes
  };

  const columns = [
    { Header: "Question", accessor: "question" },
    { Header: "Answer", accessor: "answer" },
    {
      Header: "Visible",
      accessor: "is_visible",
      Cell: ({ row }) => (
        <Button variant="contained" color={row.original.is_visible ? "success" : "error"}>
          {row.original.is_visible ? "Yes" : "No"}
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Loading FAQs...</MDTypography>
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
                    FAQs Table
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
                      Create FAQ
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: faqs }}
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
                  onChange={handlePageChange}
                  color="primary"
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Create New FAQ</DialogTitle>
        <DialogContent>
          <TextField
            label="Question"
            name="question"
            fullWidth
            margin="normal"
            value={newFaq.question}
            onChange={handleInputChange}
          />
          <TextField
            label="Answer"
            name="answer"
            fullWidth
            margin="normal"
            value={newFaq.answer}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Visible</InputLabel>
            <Select
              name="is_visible"
              value={newFaq.is_visible ? "true" : "false"}
              onChange={handleInputChange}
              label="Visible"
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateFaq} color="secondary" autoFocus>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

FAQs.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
      is_visible: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

export default FAQs;
