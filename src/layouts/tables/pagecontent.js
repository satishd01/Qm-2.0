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

function PageContent() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [pageContents, setPageContents] = useState([]);
  console.log("page conetet", pageContents);
  console.log(pageContents, "pagecontetnt");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default page size
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPageContent, setNewPageContent] = useState({
    content_type: "",
    content: "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPageContents = async (page = 1, size = 10) => {
    try {
      const ACCESS_TOKEN = localStorage.getItem("ACCESS_TOKEN");
      if (!ACCESS_TOKEN) {
        console.error("No token found, please login again");
        return;
      }
      const response = await fetch(
        `https://kita.shellcode.shop/api/pagecontent?page=${page}&page_size=${size}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API Response:", data); // Debugging log
      if (data && data.results) {
        setPageContents(data.results);
        setTotalPages(Math.ceil(data.count / size)); // Calculate total pages based on count
      } else {
        console.error("No page content data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching page content data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContents(currentPage, pageSize);
  }, [currentPage, pageSize, searchTerm]);

  const handleCreatePageContent = async () => {
    try {
      const ACCESS_TOKEN = localStorage.getItem("ACCESS_TOKEN");
      if (!ACCESS_TOKEN) {
        console.error("No token found, please login again");
        return;
      }
      const response = await axios.post(
        "https://kita.shellcode.shop/api/pagecontent/",
        {
          content_type: newPageContent.content_type,
          content: newPageContent.content,
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response) {
        alert("Page content created successfully!");
        setOpenDialog(false);
        fetchPageContents(currentPage, pageSize); // Refresh the page content list
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error creating page content:", error);
    }
  };

  const handleUpdatePageContent = async () => {
    try {
      const ACCESS_TOKEN = localStorage.getItem("ACCESS_TOKEN");
      if (!ACCESS_TOKEN) {
        console.error("No token found, please login again");
        return;
      }
      const response = await axios.patch(
        `https://kita.shellcode.shop/api/pagecontent/${editId}/`,
        {
          content: newPageContent.content,
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response) {
        alert("Page content updated successfully!");
        setEditId(null);
        setNewPageContent({ content_type: "", content: "" });
        setOpenDialog(false);
        fetchPageContents(currentPage, pageSize); // Refresh the page content list
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error updating page content:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPageContent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPageContent({
      content_type: "",
      content: "",
    });
    setEditId(null);
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
    { Header: "Content Type", accessor: "content_type" },
    { Header: "Content", accessor: "content" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            setEditId(row.original.id);
            setNewPageContent({
              content_type: row.original.content_type,
              content: row.original.content,
            });
            setOpenDialog(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Loading Page Contents...</MDTypography>
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
                    Page Contents Table
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
                      Create Page Content
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: pageContents }}
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
        <DialogTitle>{editId ? "Edit Page Content" : "Create New Page Content"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Content Type"
            name="content_type"
            fullWidth
            margin="normal"
            value={newPageContent.content_type}
            onChange={handleInputChange}
          />
          <TextField
            label="Content"
            name="content"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={newPageContent.content}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={editId ? handleUpdatePageContent : handleCreatePageContent}
            color="secondary"
            autoFocus
          >
            {editId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

PageContent.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      content_type: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PageContent;
