import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Grid,
  Card,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
  Pagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Snackbar,
  Alert,
  OutlinedInput,
  IconButton,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const CategoryCell = ({ value }) => <Chip label={value} color="primary" size="small" />;
CategoryCell.propTypes = {
  value: PropTypes.string.isRequired,
};

const PrescriptionCell = ({ value }) => (
  <Chip
    label={value ? "Required" : "Not Required"}
    color={value ? "error" : "success"}
    size="small"
  />
);
PrescriptionCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

const ActionCell = ({ value, onEdit, onDelete }) => (
  <Box>
    <IconButton color="primary" onClick={() => onEdit(value)}>
      <EditIcon />
    </IconButton>
    <IconButton color="error" onClick={() => onDelete(value)}>
      <DeleteIcon />
    </IconButton>
  </Box>
);

ActionCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const generateSampleData = () => {
  return [
    {
      "Product Name": "Zinga vita Vitamin Amla Extract 1000mg Tablet",
      MRP: 999.99,
      "Selling Price": 399.99,
      Brand: "Sun Pharma",
      Uses: "Uses",
      "Age Group": "Any",
      "Category ID": 1,
      Category: "Tablet",
      Manufacturer: "Sun Pharma",
      "Consume Type": "Tablet",
      "Expire Date": "2025-12-06",
      "Packaging Details": "10 capsules in a stripe",
      Stock: "Available",
      Images: "/uploads/1726567726092.png,/uploads/1726567726092.png,/uploads/1726567726092.png",
      Variants: JSON.stringify([
        { units: "30 tablets", mrp: 999.99, sellingPrice: 399.99, stock: "Available" },
        { units: "60 tablets", mrp: 1999.99, sellingPrice: 1399.99, stock: "Out of Stock" },
      ]),
      Composition: "Bromelain (90mg) + Trypsin (48mg) + Rutoside (100mg)",
      "Product Introduction": "Fast&Up Charge is a completely natural Vitamin C supplement...",
      "Uses of Medication": "Fast&Up Charge is a completely natural Vitamin C supplement...",
      Benefits: "In Pain relief, In Treatment of Fever",
      Contradictions: "Fast&Up Charge is a completely natural Vitamin C supplement...",
      "Prescription Required": "1",
      "Expert Advice": JSON.stringify({
        avatar: "/uploads/1716832690805.png",
        doctorName: "Dr. Russ Mehta Chibber",
        designation: "BDS",
        advice: "Fast&Up Charge is a completely natural Vitamin C supplement...",
      }),
      "Substitute Products": JSON.stringify({
        avatar: "/uploads/1716832690805.png",
        doctorName: "Dr. Russ Mehta Chibber",
        designation: "BDS",
        advice: "Fast&Up Charge is a completely natural Vitamin C supplement...",
      }),
      "Author ID": 1,
      Specification: "Contains 1000mg of natural Amla extract with 10mg of Zinc per tablet",
      Strength: "1000mg",
      Quantity: 30,
    },
  ];
};

const exportSampleDataToExcel = () => {
  const sampleData = generateSampleData();
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Data");
  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "sample_data.xlsx");
};

function Products() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    products: [],
    loading: true,
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    categories: [],
    selectedCategory: "all",
    molecules: [],
    selectedMolecules: [],
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    currentProduct: null,
    isEdit: false,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null,
    productName: "",
  });

  const [authors, setAuthors] = useState([]);
  const [commition, Setcommition] = useState([]);
  console.log("commition", commition);
  const [uploading, setUploading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    productName: "",
    mrp: 0,
    sellingPrice: 0,
    brand: "",
    productForm: "",
    uses: "",
    age: "",
    categoryId: 1,
    category: "",
    manufacturer: "",
    consumeType: "",
    expireDate: "",
    packagingDetails: "",
    images: [],
    variants: [],
    composition: "",
    productIntroduction: "",
    usesOfMedication: "",
    benefits: "",
    contradictions: "",
    isPrescriptionRequired: false,
    expertAdvice: "",
    authorId: "",
    sub_category: "",
    direction_to_use: "",
    side_effects: "",
    precautions_while_using: "",
    descriptions: "",
    references: "",
    country_of_origin: "",
    product_molecule_id: 1,
    schedule_x_drug: false,
    get_notified: false,
    weight: "",
    discount_price_percentage: 0,
    discount_offered: false,
    pin_code: "",
    call_me_to_modify: false,
    how_to_take_medicine: false,
    specification: "",
    strength: "",
    quantity: 0,
    totalSales: 0,
    stock: "Available",
    commission: "",
    compiled_by: "",
    reviewed_by: "",
    productMg: "",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  useEffect(() => {
    if (newProduct.mrp && newProduct.discount_price_percentage) {
      const discountAmount = (newProduct.mrp * newProduct.discount_price_percentage) / 100;
      const calculatedSellingPrice = newProduct.mrp - discountAmount;
      setNewProduct((prev) => ({
        ...prev,
        sellingPrice: parseFloat(calculatedSellingPrice.toFixed(2)),
      }));
    }
  }, [newProduct.mrp, newProduct.discount_price_percentage]);

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/productCategory.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data?.categories) {
        setState((prev) => ({ ...prev, categories: data.categories }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Failed to load categories",
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  const fetchAuthors = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/authors`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data?.data) {
        setAuthors(data.data);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Failed to load authors",
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  const fetchCommition = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/commission.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data) {
        Setcommition(data.commissions);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Failed to load authors",
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  const fetchMolecules = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/molecule.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data?.data) {
        setState((prev) => ({ ...prev, molecules: data.data }));
      }
    } catch (error) {
      console.error("Error fetching molecules:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Failed to load molecules",
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  const fetchProducts = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      let url = `${baseUrl}/product.get?page=${state.currentPage}`;
      if (state.selectedCategory !== "all") {
        url = `${baseUrl}/product.categoryGet?categoryId=${state.selectedCategory}&page=${state.currentPage}`;
      }

      const response = await fetch(url, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data?.products) {
        setState((prev) => ({
          ...prev,
          products: data.products,
          totalPages: data.totalPages || 1,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        snackbar: {
          open: true,
          message: "Failed to load products",
          severity: "error",
        },
      }));
    }
  }, [state.currentPage, state.selectedCategory, baseUrl, xAuthHeader]);

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    fetchCommition();
    fetchMolecules();
  }, [fetchCategories, fetchAuthors, fetchMolecules]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooleanChange = (e) => {
    const { name, checked } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: checked }));
  };

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach((file) => {
        uploadFormData.append("files", file);
      });

      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/upload-files`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok && data?.files) {
        const uploadedUrls = data.files.map((file) => `/uploads/${file}`);
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
      } else {
        setState((prev) => ({
          ...prev,
          snackbar: {
            open: true,
            message: data?.message || "Upload failed",
            severity: "error",
          },
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Upload failed. Please try again.",
          severity: "error",
        },
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCreateProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      if (
        !newProduct.productName ||
        state.selectedMolecules?.length === 0 ||
        !newProduct.mrp ||
        !newProduct.sellingPrice ||
        !newProduct.discount_offered ||
        !newProduct.isPrescriptionRequired ||
        !newProduct.schedule_x_drug
      ) {
        setState((prev) => ({
          ...prev,
          snackbar: {
            open: true,
            message:
              "Product Name, MRP, Selling Price,Molecules, Discount, Prescription Required, and Schedule X Drug are required fields.",
            severity: "warning",
          },
        }));
        return;
      }
      const formattedVariants = newProduct.variants.map((variant) => ({
        units: variant.units || "",
        mrp: parseFloat(variant.mrp) || 0,
        sellingPrice: parseFloat(variant.sellingPrice) || 0,
        stock: variant.stock || "Available",
      }));
      const formattedExpertAdvice = {
        avatar: newProduct.expertAdvice.avatar || "",
        doctorName: newProduct.expertAdvice.doctorName || "",
        designation: newProduct.expertAdvice.designation || "",
        advice: newProduct.expertAdvice.advice || "",
      };
      const productData = {
        // addedByType: "Vendor",
        productName: newProduct.productName,
        mrp: parseFloat(newProduct.mrp),
        sellingPrice: parseFloat(newProduct.sellingPrice),
        brand: newProduct.brand,

        productForm: newProduct.productForm,
        uses: newProduct.uses,
        age: newProduct.age,
        categoryId: parseInt(newProduct.categoryId),
        // category: newProduct.category,
        manufacturer: newProduct.manufacturer,
        consumeType: newProduct.consumeType,
        expireDate: newProduct.expireDate,
        packagingDetails: newProduct.packagingDetails,
        stock: newProduct.stock,
        images: newProduct.images,
        variants: formattedVariants,
        composition: newProduct.composition,
        productIntroduction: newProduct.productIntroduction,
        usesOfMedication: newProduct.usesOfMedication,
        benefits: newProduct.benefits,
        contradictions: newProduct.contradictions,
        isPrescriptionRequired: newProduct.isPrescriptionRequired,
        expertAdvice: formattedExpertAdvice,
        substituteProducts: newProduct.substituteProducts,
        authorId: parseInt(newProduct.authorId),
        sub_category: newProduct.sub_category,
        direction_to_use: newProduct.direction_to_use,
        side_effects: newProduct.side_effects,
        precautions_while_using: newProduct.precautions_while_using,
        descriptions: newProduct.descriptions,
        references: newProduct.references,
        country_of_origin: newProduct.country_of_origin,
        product_molecule_id: state.selectedMolecules,
        schedule_x_drug: newProduct.schedule_x_drug,
        get_notified: newProduct.get_notified,
        weight: newProduct.weight,
        discount_price_percentage: newProduct.discount_price_percentage,
        discount_offered: newProduct.discount_offered,
        pin_code: newProduct.pin_code,
        call_me_to_modify: newProduct.call_me_to_modify,
        how_to_take_medicine: newProduct.how_to_take_medicine,
        specification: newProduct.specification,
        strength: newProduct.strength,
        quantity: parseInt(newProduct.quantity),
        commission: newProduct.commission,
        compiled_by: newProduct.compiled_by,
        reviewed_by: newProduct.reviewed_by,
        productMg: newProduct.productMg,
      };

      const response = await fetch(`${baseUrl}/product.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create product");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Product created successfully!",
          severity: "success",
        },
        currentPage: 1,
      }));

      setNewProduct({
        productName: "",
        mrp: 0,
        sellingPrice: 0,
        brand: "",
        vendorId: 1,
        productForm: "",
        uses: "",
        age: "",
        categoryId: 1,
        category: "",
        manufacturer: "",
        consumeType: "",
        expireDate: "",
        packagingDetails: "",
        images: [],
        variants: [],
        composition: "",
        productIntroduction: "",
        usesOfMedication: "",
        benefits: "",
        contradictions: "",
        isPrescriptionRequired: false,
        expertAdvice: "",
        substituteProducts: [],
        authorId: "",
        sub_category: "",
        direction_to_use: "",
        side_effects: "",
        precautions_while_using: "",
        descriptions: "",
        references: "",
        country_of_origin: "",
        product_molecule_id: 1,
        schedule_x_drug: false,
        get_notified: false,
        weight: "",
        discount_price_percentage: 0,
        discount_offered: false,
        pin_code: "",
        call_me_to_modify: false,
        how_to_take_medicine: false,
        specification: "",
        strength: "",
        quantity: 0,
        stock: "Available",
      });

      setDialogState((prev) => ({ ...prev, open: false }));
      await fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
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

  const handleEditProduct = (productId) => {
    const product = state.products.find((p) => p.id === productId);
    if (product) {
      setNewProduct({
        ...product,
        variants: product.variants || [],
        images: product.images || [],
      });
      setState((prev) => ({
        ...prev,
        selectedMolecules: product.product_molecule_id || [],
      }));
      setDialogState({
        open: true,
        currentProduct: product,
        isEdit: true,
      });
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const productData = {
        id: dialogState.currentProduct.id,
        productName: newProduct.productName,
        mrp: parseFloat(newProduct.mrp),
        sellingPrice: parseFloat(newProduct.sellingPrice),
        brand: newProduct.brand,
        productForm: newProduct.productForm,
        uses: newProduct.uses,
        age: newProduct.age,
        categoryId: parseInt(newProduct.categoryId),
        category: newProduct.category,
        manufacturer: newProduct.manufacturer,
        consumeType: newProduct.consumeType,
        expireDate: newProduct.expireDate,
        packagingDetails: newProduct.packagingDetails,
        stock: newProduct.stock,
        images: newProduct.images,
        variants: newProduct.variants,
        composition: newProduct.composition,
        productIntroduction: newProduct.productIntroduction,
        usesOfMedication: newProduct.usesOfMedication,
        benefits: newProduct.benefits,
        contradictions: newProduct.contradictions,
        isPrescriptionRequired: newProduct.isPrescriptionRequired,
        expertAdvice: newProduct.expertAdvice,
        substituteProducts: newProduct.substituteProducts,
        authorId: parseInt(newProduct.authorId),
        sub_category: newProduct.sub_category,
        direction_to_use: newProduct.direction_to_use,
        side_effects: newProduct.side_effects,
        precautions_while_using: newProduct.precautions_while_using,
        descriptions: newProduct.descriptions,
        references: newProduct.references,
        country_of_origin: newProduct.country_of_origin,
        product_molecule_id: state.selectedMolecules,
        schedule_x_drug: newProduct.schedule_x_drug,
        get_notified: newProduct.get_notified,
        weight: newProduct.weight,
        discount_price_percentage: newProduct.discount_price_percentage,
        discount_offered: newProduct.discount_offered,
        pin_code: newProduct.pin_code,
        call_me_to_modify: newProduct.call_me_to_modify,
        how_to_take_medicine: newProduct.how_to_take_medicine,
        specification: newProduct.specification,
        strength: newProduct.strength,
        quantity: parseInt(newProduct.quantity),
      };

      const response = await fetch(`${baseUrl}/product.updateByVendor`, {
        method: "PUT",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to update product");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Product updated successfully!",
          severity: "success",
        },
      }));

      setDialogState((prev) => ({ ...prev, open: false }));
      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
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

  const handleDeleteProduct = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/vendor/product.delete`, {
        method: "DELETE",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deleteDialog.productId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to delete product");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Product deleted successfully!",
          severity: "success",
        },
      }));

      setDeleteDialog((prev) => ({ ...prev, open: false }));
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
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

  const handleOpenDeleteDialog = (productId) => {
    const product = state.products.find((p) => p.id === productId);
    if (product) {
      setDeleteDialog({
        open: true,
        productId,
        productName: product.productName,
      });
    }
  };

  const handleCloseSnackbar = () => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        ...prev.snackbar,
        open: false,
      },
    }));
  };
  const ActionsCell = ({ value }) => (
    <ActionCell value={value} onEdit={handleEditProduct} onDelete={handleOpenDeleteDialog} />
  );
  ActionsCell.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  const columns = [
    { Header: "Product Name", accessor: "productName" },
    { Header: "MRP", accessor: "mrp" },
    { Header: "Selling Price", accessor: "sellingPrice" },
    { Header: "Brand", accessor: "brand" },
    {
      Header: "Category",
      accessor: "category",
      Cell: CategoryCell,
    },
    { Header: "Expire Date", accessor: "expireDate" },
    {
      Header: "Prescription",
      accessor: "isPrescriptionRequired",
      Cell: PrescriptionCell,
    },
    { Header: "Strength", accessor: "strength" },
    { Header: "Quantity", accessor: "quantity" },
    { Header: "Stock", accessor: "stock" },
    {
      Header: "Actions",
      accessor: "id",
      Cell: ActionsCell, // Use the component directly
    },
  ];

  columns[columns.length - 1].Cell.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  const filteredProducts = state.products.filter((product) => {
    const search = state.searchTerm.toLowerCase();
    return (
      (product.productName || "").toLowerCase().includes(search) ||
      (product.brand || "").toLowerCase().includes(search) ||
      (product.category || "").toLowerCase().includes(search)
    );
  });

  const exportToExcel = () => {
    const excelData = state.products.map((product) => {
      return {
        "Product Name": product.productName,
        MRP: product.mrp,
        "Selling Price": product.sellingPrice,
        Brand: product.brand,
        "Product Form": product.productForm,
        Uses: product.uses,
        "Age Group": product.age,
        "Category ID": product.categoryId,
        Category: product.category,
        Manufacturer: product.manufacturer,
        "Consume Type": product.consumeType,
        "Expire Date": product.expireDate,
        "Packaging Details": product.packagingDetails,
        Stock: product.stock,
        Images: product.images ? product.images.join(", ") : "",
        Variants: product.variants ? JSON.stringify(product.variants) : "",
        Composition: product.composition,
        "Product Introduction": product.productIntroduction,
        "Uses of Medication": product.usesOfMedication,
        Benefits: product.benefits,
        Contradictions: product.contradictions,
        "Prescription Required": product.isPrescriptionRequired ? "1" : "0",
        "Expert Advice": product.expertAdvice ? JSON.stringify(product.expertAdvice) : "",
        "Substitute Products": product.substituteProducts
          ? JSON.stringify(product.substituteProducts)
          : "",
        "Author ID": product.authorId,
        "Sub Category": product.sub_category,
        "Direction to Use": product.direction_to_use,
        "Side Effects": product.side_effects,
        "Precautions While Using": product.precautions_while_using,
        Descriptions: product.descriptions,
        References: product.references,
        "Country of Origin": product.country_of_origin,
        Discount: product.discount || "0%",
        Specification: product.specification,
        Strength: product.strength,
        Quantity: product.quantity,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const wscols = [
      { wch: 30 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
      { wch: 60 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 20 },
      { wch: 60 },
      { wch: 60 },
      { wch: 10 },
      { wch: 20 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 40 },
      { wch: 30 },
      { wch: 20 },
      { wch: 10 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet["!cols"] = wscols;

    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "products_export.xlsx");
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const products = jsonData.map((row) => {
        let variants = [];
        try {
          if (row["Variants"]) {
            variants =
              typeof row["Variants"] === "string" ? JSON.parse(row["Variants"]) : row["Variants"];
          }
        } catch (e) {
          console.error("Error parsing variants:", e);
        }

        let expertAdvice = {};
        try {
          if (row["Expert Advice"]) {
            expertAdvice =
              typeof row["Expert Advice"] === "string"
                ? JSON.parse(row["Expert Advice"])
                : row["Expert Advice"];
          }
        } catch (e) {
          console.error("Error parsing expert advice:", e);
        }

        let substituteProducts = {};
        try {
          if (row["Substitute Products"]) {
            substituteProducts =
              typeof row["Substitute Products"] === "string"
                ? JSON.parse(row["Substitute Products"])
                : row["Substitute Products"];
          }
        } catch (e) {
          console.error("Error parsing substitute products:", e);
        }

        let images = [];
        if (row["Images"]) {
          images =
            typeof row["Images"] === "string"
              ? row["Images"].split(",").map((img) => img.trim())
              : Array.isArray(row["Images"])
                ? row["Images"]
                : [];
        }

        return {
          addedByType: "Admin",
          productName: row["Product Name"] || "",
          mrp: parseFloat(row["MRP"] || 0),
          sellingPrice: parseFloat(row["Selling Price"] || 0),
          brand: row["Brand"] || "",
          productForm: row["Product Form"] || "",
          uses: row["Uses"] || "",
          age: row["Age Group"] || "Any",
          categoryId: parseInt(row["Category ID"] || 1),
          category: row["Category"] || "",
          manufacturer: row["Manufacturer"] || "",
          consumeType: row["Consume Type"] || "",
          expireDate: row["Expire Date"] || "",
          packagingDetails: row["Packaging Details"] || "",
          stock: row["Stock"] || "Available",
          images: images,
          variants: variants,
          composition: row["Composition"] || "",
          productIntroduction: row["Product Introduction"] || "",
          usesOfMedication: row["Uses of Medication"] || "",
          benefits: row["Benefits"] || "",
          contradictions: row["Contradictions"] || "",
          isPrescriptionRequired: row["Prescription Required"] === "1" ? "1" : "0",
          expertAdvice: expertAdvice,
          substituteProducts: substituteProducts,
          authorId: parseInt(row["Author ID"] || 1),
          sub_category: row["Sub Category"] || "",
          direction_to_use: row["Direction to Use"] || "",
          side_effects: row["Side Effects"] || "",
          precautions_while_using: row["Precautions While Using"] || "",
          descriptions: row["Descriptions"] || "",
          references: row["References"] || "",
          country_of_origin: row["Country of Origin"] || "",
          specification: row["Specification"] || "",
          strength: row["Strength"] || "",
          quantity: parseInt(row["Quantity"] || 0),
        };
      });

      const token = localStorage.getItem("token");
      fetch(`${baseUrl}/product.addmultiple`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(products),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.message || "Failed to import products");
            });
          }
          return response.json();
        })
        .then((data) => {
          setState((prev) => ({
            ...prev,
            snackbar: {
              open: true,
              message: "Products imported successfully!",
              severity: "success",
            },
          }));
          fetchProducts();
        })
        .catch((error) => {
          console.error("Error importing products:", error);
          setState((prev) => ({
            ...prev,
            snackbar: {
              open: true,
              message: error.message,
              severity: "error",
            },
          }));
        });
    };
    reader.readAsBinaryString(file);
  };

  if (state.loading && state.products.length === 0) {
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
                    Products
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <FormControl sx={{ minWidth: 200 }} size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={state.selectedCategory}
                        label="Category"
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            selectedCategory: e.target.value,
                            currentPage: 1,
                          }));
                        }}
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        {state.categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Search Products"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                        }))
                      }
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() =>
                        setDialogState({ open: true, currentProduct: null, isEdit: false })
                      }
                    >
                      Add New Product
                    </Button>
                    <Button variant="contained" color="error" onClick={exportToExcel}>
                      Export to Excel
                    </Button>
                    <input
                      type="file"
                      id="excelFile"
                      onChange={handleExcelUpload}
                      style={{ display: "none" }}
                      accept=".xlsx"
                    />
                    <label htmlFor="excelFile">
                      <Button component="span" variant="contained" color="error">
                        Import from Excel
                      </Button>
                    </label>
                    <Button variant="contained" color="error" onClick={exportSampleDataToExcel}>
                      Download Sample Excel
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredProducts.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredProducts }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching products found" : "No products available"}
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
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>{dialogState.isEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Product Name *"
                name="productName"
                value={newProduct.productName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              {/* <TextField
                label="Brand *"
                name="brand"
                value={newProduct.brand}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
              {/* <TextField
                label="Product Form *"
                name="productForm"
                value={newProduct.productForm}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Category *</InputLabel>
                <Select
                  name="categoryId"
                  value={newProduct.categoryId}
                  onChange={handleInputChange}
                  label="Category *"
                  sx={{ width: 350, height: 40 }}
                >
                  {state.categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Sub Category"
                name="sub_category"
                value={newProduct.sub_category}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              {/* <FormControl fullWidth margin="normal">
                <InputLabel>Vendor Commition *</InputLabel>
                <Select
                  name="commission"
                  value={newProduct.commission}
                  onChange={handleInputChange}
                  label="Commition *"
                  sx={{ width: 350, height: 40 }}
                >
                  {commition.map((commission) => (
                    <MenuItem key={commission.id} value={commission.id}>
                      {commission.type} — {commission.commission}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}
              <TextField
                label="Vendor commission"
                name="commission"
                value={newProduct.commission}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Manufacturer"
                name="manufacturer"
                value={newProduct.manufacturer}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              {/* <TextField
                label="Consume Type"
                name="consumeType"
                value={newProduct.consumeType}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
              <TextField
                label="Specification"
                name="specification"
                value={newProduct.specification}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="MRP *"
                name="mrp"
                type="number"
                value={newProduct.mrp}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Discount Price Percentage"
                name="discount_price_percentage"
                type="number"
                value={newProduct.discount_price_percentage}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Selling Price *"
                name="sellingPrice"
                type="number"
                value={newProduct.sellingPrice}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              {/* <TextField
                label="Expire Date"
                name="expireDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newProduct.expireDate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
              <TextField
                label="Packaging Details"
                name="packagingDetails"
                value={newProduct.packagingDetails}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              {/* <TextField
                label="Age Group"
                name="age"
                value={newProduct.age}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
              <TextField
                label="Country of Origin"
                name="country_of_origin"
                value={newProduct.country_of_origin}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Strength"
                name="strength"
                value={newProduct.strength}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              {/* <TextField
                label="Product MG"
                name="productMg"
                value={newProduct.productMg}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
              {/* <TextField
                label="Total Sale"
                name="totalSales"
                type="number"
                value={newProduct.totalSales}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
              <TextField
                label="Quantity Cap"
                name="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="isPrescriptionRequired"
                    checked={newProduct.isPrescriptionRequired}
                    onChange={handleBooleanChange}
                  />
                }
                label="Prescription Required"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="file"
                  id="productImages"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  accept="image/*"
                  multiple
                />
                <label htmlFor="productImages">
                  <Button
                    component="span"
                    variant="contained"
                    color="error"
                    startIcon={<CloudUploadIcon />}
                    disabled={uploading}
                    required
                  >
                    {uploading ? "Uploading..." : "Upload Product Images"}
                  </Button>
                </label>
                {uploading && <CircularProgress size={24} />}
              </Box>
              <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {newProduct.images.map((image, index) => (
                  <Chip
                    key={index}
                    label={image.split("/").pop()}
                    onDelete={() => handleRemoveImage(index)}
                    sx={{ maxWidth: 200 }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid item xs={12}>
                <MDTypography variant="h6">Variants</MDTypography>
                {newProduct.variants.map((variant, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <TextField
                      label={`Variant ${index + 1} Units`}
                      value={variant.units}
                      onChange={(e) => {
                        const newVariants = [...newProduct.variants];
                        newVariants[index].units = e.target.value;
                        setNewProduct((prev) => ({ ...prev, variants: newVariants }));
                      }}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label={`Variant ${index + 1} MRP`}
                      type="number"
                      value={variant.mrp}
                      onChange={(e) => {
                        const newVariants = [...newProduct.variants];
                        newVariants[index].mrp = parseFloat(e.target.value);
                        setNewProduct((prev) => ({ ...prev, variants: newVariants }));
                      }}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label={`Variant ${index + 1} Selling Price`}
                      type="number"
                      value={variant.sellingPrice}
                      onChange={(e) => {
                        const newVariants = [...newProduct.variants];
                        newVariants[index].sellingPrice = parseFloat(e.target.value);
                        setNewProduct((prev) => ({ ...prev, variants: newVariants }));
                      }}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label={`Variant ${index + 1} Stock`}
                      value={variant.stock}
                      onChange={(e) => {
                        const newVariants = [...newProduct.variants];
                        newVariants[index].stock = e.target.value;
                        setNewProduct((prev) => ({ ...prev, variants: newVariants }));
                      }}
                      fullWidth
                      margin="normal"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        const newVariants = [...newProduct.variants];
                        newVariants.splice(index, 1);
                        setNewProduct((prev) => ({ ...prev, variants: newVariants }));
                      }}
                    >
                      Remove Variant
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="error"
                  onClick={() =>
                    setNewProduct((prev) => ({
                      ...prev,
                      variants: [
                        ...prev.variants,
                        { units: "", mrp: 0, sellingPrice: 0, stock: "Available" },
                      ],
                    }))
                  }
                >
                  Add Variant
                </Button>
              </Grid>
              <TextField
                label="Composition"
                name="composition"
                value={newProduct.composition}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Direction to Use"
                name="direction_to_use"
                value={newProduct.direction_to_use}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Uses"
                name="uses"
                value={newProduct.uses}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Benefits"
                name="benefits"
                value={newProduct.benefits}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Side Effects"
                name="side_effects"
                value={newProduct.side_effects}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Precautions While Using"
                name="precautions_while_using"
                value={newProduct.precautions_while_using}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Product Introduction"
                name="productIntroduction"
                value={newProduct.productIntroduction}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                label="Uses of Medication"
                name="usesOfMedication"
                value={newProduct.usesOfMedication}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                label="Contradictions"
                name="contradictions"
                value={newProduct.contradictions}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <Grid item xs={12}>
                <MDTypography variant="h6">Expert Advice</MDTypography>
                <TextField
                  label="Doctor Name"
                  value={newProduct.expertAdvice.doctorName}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      expertAdvice: { ...prev.expertAdvice, doctorName: e.target.value },
                    }))
                  }
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Designation"
                  value={newProduct.expertAdvice.designation}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      expertAdvice: { ...prev.expertAdvice, designation: e.target.value },
                    }))
                  }
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Advice"
                  value={newProduct.expertAdvice.advice}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      expertAdvice: { ...prev.expertAdvice, advice: e.target.value },
                    }))
                  }
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />
                {/* <TextField
                  label="Avatar URL"
                  value={newProduct.expertAdvice.avatar}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      expertAdvice: { ...prev.expertAdvice, avatar: e.target.value },
                    }))
                  }
                  fullWidth
                  margin="normal"
                /> */}
              </Grid>
              <TextField
                label="Descriptions"
                name="descriptions"
                value={newProduct.descriptions}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                label="References"
                name="references"
                value={newProduct.references}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Molecule/Composition</InputLabel>
                <Select
                  multiple
                  required
                  value={Array.isArray(state.selectedMolecules) ? state.selectedMolecules : []}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      selectedMolecules: Array.isArray(e.target.value) ? e.target.value : [],
                    }))
                  }
                  input={<OutlinedInput label="Molecules" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(Array.isArray(selected) ? selected : []).map((value) => {
                        const molecule = state.molecules.find((m) => m.id === value);
                        return (
                          <Chip key={value} label={molecule ? molecule.molecule_name : value} />
                        );
                      })}
                    </Box>
                  )}
                  sx={{ width: 350, height: 40 }}
                >
                  {state.molecules.map((molecule) => (
                    <MenuItem key={molecule.id} value={molecule.id}>
                      {molecule.molecule_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Weight In Grams"
                name="weight"
                value={newProduct.weight}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              {/* <TextField
                label="Pin Code"
                name="pin_code"
                value={newProduct.pin_code}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
              {/* <FormControl fullWidth margin="normal">
                <InputLabel>No Stock</InputLabel>
                <Select
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  label="Stock Status"
                  sx={{ width: 350, height: 40 }}
                >
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Out of Stock">Not Available</MenuItem>
                </Select>
              </FormControl> */}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Compiled By</InputLabel>
                <Select
                  name="compiled_by"
                  value={newProduct.compiled_by}
                  onChange={handleInputChange}
                  label="Compiled By"
                  sx={{ width: 350, height: 40 }}
                >
                  {authors.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Reviewed By</InputLabel>
                <Select
                  name="reviewed_by"
                  value={newProduct.reviewed_by}
                  onChange={handleInputChange}
                  label="Reviewed By"
                  sx={{ width: 350, height: 40 }}
                >
                  {authors.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="schedule_x_drug"
                    checked={newProduct.schedule_x_drug}
                    onChange={handleBooleanChange}
                  />
                }
                label="Schedule X Drug"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="get_notified"
                    checked={newProduct.get_notified}
                    onChange={handleBooleanChange}
                  />
                }
                label="Get Notified"
              />
              {/* <FormControlLabel
                control={
                  <Switch
                    name="discount_offered"
                    checked={newProduct.discount_offered}
                    onChange={handleBooleanChange}
                  />
                }
                label="Discount Offered"
              /> */}
              {/* <FormControlLabel
                control={
                  <Switch
                    name="call_me_to_modify"
                    checked={newProduct.call_me_to_modify}
                    onChange={handleBooleanChange}
                  />
                }
                label="Call Me to Modify"
              /> */}
              {/* <FormControlLabel
                control={
                  <Switch
                    name="how_to_take_medicine"
                    checked={newProduct.how_to_take_medicine}
                    onChange={handleBooleanChange}
                  />
                }
                label="How to Take Medicine"
              /> */}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button
            onClick={dialogState.isEdit ? handleUpdateProduct : handleCreateProduct}
            color="error"
            variant="contained"
          >
            {dialogState.isEdit ? "Update Product" : "Create Product"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>
            Are you sure you want to delete the product &quot;{deleteDialog.productName}&quot;?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={state.snackbar.severity}
          sx={{ width: "100%" }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

Products.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      productName: PropTypes.string.isRequired,
      mrp: PropTypes.number.isRequired,
      sellingPrice: PropTypes.number.isRequired,
      brand: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      expireDate: PropTypes.string,
      isPrescriptionRequired: PropTypes.bool,
      strength: PropTypes.string,
      quantity: PropTypes.number,
      stock: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Products;
