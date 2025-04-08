import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  CircularProgress,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DEFAULT_PAGE_SIZE = 10;

function ProductCategories() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    categories: [],
    loading: true,
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });
  const [dialogState, setDialogState] = useState({
    open: false,
    isEdit: false,
    currentCategory: null,
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const fetchCategories = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/productCategory.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch categories");

      if (data?.status && data.categories) {
        setState((prev) => ({
          ...prev,
          categories: data.categories,
          totalPages: Math.ceil(data.categories.length / DEFAULT_PAGE_SIZE),
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      if (!newCategory.name) {
        throw new Error("Category name is required");
      }

      const response = await fetch(`${baseUrl}/productCategory.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Create failed");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Category created successfully!",
          severity: "success",
        },
        currentPage: 1,
      }));
      setNewCategory({
        name: "",
      });
      setDialogState((prev) => ({ ...prev, open: false }));
      await fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      if (!dialogState.currentCategory?.name) {
        throw new Error("Category name is required");
      }

      const response = await fetch(`${baseUrl}/productCategory.update`, {
        method: "PUT",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: dialogState.currentCategory.id,
          name: dialogState.currentCategory.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Update failed");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Category updated successfully!",
          severity: "success",
        },
      }));
      setDialogState((prev) => ({ ...prev, open: false }));
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(`${baseUrl}/productCategory.delete/${categoryId}`, {
        method: "DELETE",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Delete failed");
      }

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Category deleted successfully!",
          severity: "success",
        },
      }));
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Name", accessor: "name" },
    { Header: "Products Count", accessor: (row) => row.products?.length || 0 },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box>
          <IconButton
            onClick={() =>
              setDialogState({
                open: true,
                isEdit: true,
                currentCategory: row.original,
              })
            }
            size="small"
          >
            <EditIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => handleDeleteCategory(row.original.id)} size="small">
            <DeleteIcon color="error" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredCategories = state.categories.filter((category) => {
    if (!category) return false;
    const search = state.searchTerm.toLowerCase();
    return (
      (category.name || "").toLowerCase().includes(search) ||
      (category.id?.toString() || "").includes(search)
    );
  });

  if (state.loading && state.categories.length === 0) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} display="flex" justifyContent="center">
          <CircularProgress />
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
                    Product Categories
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Categories"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                          currentPage: 1,
                        }))
                      }
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        setDialogState({
                          open: true,
                          isEdit: false,
                          currentCategory: null,
                        })
                      }
                    >
                      Add Category
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredCategories.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredCategories }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm
                        ? "No matching categories found"
                        : "No categories available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
              {state.totalPages > 1 && (
                <MDBox p={2} display="flex" justifyContent="center">
                  <Pagination
                    count={state.totalPages}
                    page={state.currentPage}
                    onChange={(_, page) => setState((prev) => ({ ...prev, currentPage: page }))}
                    color="primary"
                  />
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialogState.isEdit ? "Edit Category" : "Create New Category"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={dialogState.isEdit ? dialogState.currentCategory?.name || "" : newCategory.name}
            onChange={(e) => {
              if (dialogState.isEdit) {
                setDialogState((prev) => ({
                  ...prev,
                  currentCategory: {
                    ...prev.currentCategory,
                    name: e.target.value,
                  },
                }));
              } else {
                setNewCategory({ name: e.target.value });
              }
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button
            onClick={dialogState.isEdit ? handleUpdateCategory : handleCreateCategory}
            color="error"
            variant="contained"
            disabled={dialogState.isEdit ? !dialogState.currentCategory?.name : !newCategory.name}
          >
            {dialogState.isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            snackbar: { ...prev.snackbar, open: false },
          }))
        }
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() =>
            setState((prev) => ({
              ...prev,
              snackbar: { ...prev.snackbar, open: false },
            }))
          }
          severity={state.snackbar.severity}
          sx={{ width: "100%" }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

ProductCategories.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      products: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          name: PropTypes.string,
        })
      ),
    }).isRequired,
  }),
};

export default ProductCategories;
