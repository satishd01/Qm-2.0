import React, { useEffect, useState, useCallback } from "react";
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
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
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

const CHARGE_TYPES = ["LOCAL", "ROI"];

function Charges() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    chargeRules: [],
    loading: true,
    searchTerm: "",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [dialogState, setDialogState] = useState({
    deleteOpen: false,
    createOpen: false,
    editOpen: false,
    detailsOpen: false,
    currentCharge: null,
  });

  const [newCharge, setNewCharge] = useState({
    chargesType: "",
    rules: {
      cartValueRanges: [
        { minValue: 0, maxValue: 499, charge: 0, message: "" },
        { minValue: 500, maxValue: 749, charge: 0, message: "" },
        { minValue: 750, maxValue: 999, charge: 0, message: "" },
        { minValue: 1000, maxValue: null, charge: 0, message: "" },
      ],
      distanceConfig: { baseDistance: 0, additionalKmCharge: 0 },
      packagingCharge: 0,
      handlingFee: 0,
      platformFee: 0,
      codCharge: 0,
      fastServiceCharge: 0,
      emergencyDeliverySurcharge: 0,
      deliveryPartnerFee: 0,
      longDistanceFee: 0,
      convenienceCharge: 0,
    },
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const fetchChargeRules = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/charge-rules`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch charge rules");

      if (data?.status && data.data) {
        const processedRules = data.data.map((rule) => ({
          ...rule,
          rules: {
            ...rule.rules,
            distanceConfig: rule.rules.distanceConfig || { baseDistance: 0, additionalKmCharge: 0 },
          },
        }));

        setState((prev) => ({
          ...prev,
          chargeRules: processedRules,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching charge rules:", error);
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
    fetchChargeRules();
  }, [fetchChargeRules]);

  const handleCreateCharge = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(`${baseUrl}/charge-rules`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCharge),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Create failed");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Charge rule created successfully!",
          severity: "success",
        },
      }));
      setNewCharge({
        chargesType: "",
        rules: {
          cartValueRanges: [
            { minValue: 0, maxValue: 499, charge: 0, message: "" },
            { minValue: 500, maxValue: 749, charge: 0, message: "" },
            { minValue: 750, maxValue: 999, charge: 0, message: "" },
            { minValue: 1000, maxValue: null, charge: 0, message: "" },
          ],
          distanceConfig: { baseDistance: 0, additionalKmCharge: 0 },
          packagingCharge: 0,
          handlingFee: 0,
          platformFee: 0,
          codCharge: 0,
          fastServiceCharge: 0,
          emergencyDeliverySurcharge: 0,
          deliveryPartnerFee: 0,
          longDistanceFee: 0,
          convenienceCharge: 0,
        },
      });
      setDialogState((prev) => ({ ...prev, createOpen: false }));
      await fetchChargeRules();
    } catch (error) {
      console.error("Error creating charge rule:", error);
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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(
        `${baseUrl}/charge-rules/${dialogState.currentCharge.chargesType}`,
        {
          method: "DELETE",
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Delete failed");
      }

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Charge rule deleted successfully!",
          severity: "success",
        },
      }));
      setDialogState((prev) => ({ ...prev, deleteOpen: false, currentCharge: null }));
      await fetchChargeRules();
    } catch (error) {
      console.error("Error deleting charge rule:", error);
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

  const handleRuleChange = (field, value, index = null) => {
    if (index !== null) {
      const updatedRanges = [...newCharge.rules.cartValueRanges];
      updatedRanges[index] = { ...updatedRanges[index], [field]: value };
      setNewCharge((prev) => ({
        ...prev,
        rules: { ...prev.rules, cartValueRanges: updatedRanges },
      }));
    } else if (field.includes("distanceConfig.")) {
      const configField = field.split(".")[1];
      setNewCharge((prev) => ({
        ...prev,
        rules: {
          ...prev.rules,
          distanceConfig: {
            ...(prev.rules.distanceConfig || { baseDistance: 0, additionalKmCharge: 0 }),
            [configField]: value,
          },
        },
      }));
    } else {
      setNewCharge((prev) => ({
        ...prev,
        rules: { ...prev.rules, [field]: value },
      }));
    }
  };

  const handleEditClick = (charge) => {
    setNewCharge({
      chargesType: charge.chargesType,
      rules: {
        ...charge.rules,
        distanceConfig: charge.rules.distanceConfig || { baseDistance: 0, additionalKmCharge: 0 },
      },
    });
    setDialogState({
      editOpen: true,
      currentCharge: charge,
    });
  };

  const handleViewDetails = (charge) => {
    setDialogState({
      detailsOpen: true,
      currentCharge: charge,
    });
  };

  const handleUpdateCharge = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(
        `${baseUrl}/charge-rules/${dialogState.currentCharge.chargesType}`,
        {
          method: "PUT",
          headers: {
            "x-authorization": xAuthHeader,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCharge),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Update failed");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Charge rule updated successfully!",
          severity: "success",
        },
      }));
      setNewCharge({
        chargesType: "",
        rules: {
          cartValueRanges: [
            { minValue: 0, maxValue: 499, charge: 0, message: "" },
            { minValue: 500, maxValue: 749, charge: 0, message: "" },
            { minValue: 750, maxValue: 999, charge: 0, message: "" },
            { minValue: 1000, maxValue: null, charge: 0, message: "" },
          ],
          distanceConfig: { baseDistance: 0, additionalKmCharge: 0 },
          packagingCharge: 0,
          handlingFee: 0,
          platformFee: 0,
          codCharge: 0,
          fastServiceCharge: 0,
          emergencyDeliverySurcharge: 0,
          deliveryPartnerFee: 0,
          longDistanceFee: 0,
          convenienceCharge: 0,
        },
      });
      setDialogState((prev) => ({ ...prev, editOpen: false, currentCharge: null }));
      await fetchChargeRules();
    } catch (error) {
      console.error("Error updating charge rule:", error);
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

  const filteredChargeRules = state.chargeRules.filter((rule) => {
    if (!rule) return false;
    const search = state.searchTerm.toLowerCase();
    return rule.chargesType.toLowerCase().includes(search);
  });

  const renderRulesDetails = (rules) => {
    return (
      <Box sx={{ mt: 2 }}>
        <MDTypography variant="h6" gutterBottom>
          Cart Value Ranges
        </MDTypography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Min Value</TableCell>
                <TableCell>Max Value</TableCell>
                <TableCell>Charge (₹)</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.cartValueRanges?.map((range, idx) => (
                <TableRow key={idx}>
                  <TableCell>{range.minValue}</TableCell>
                  <TableCell>{range.maxValue === null ? "∞" : range.maxValue}</TableCell>
                  <TableCell>{range.charge}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>{range.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <MDBox mt={3}>
          <MDTypography variant="h6" gutterBottom>
            Distance Configuration
          </MDTypography>
          <MDTypography>
            Base Distance: {rules.distanceConfig?.baseDistance || 0} km, Additional KM Charge: ₹
            {rules.distanceConfig?.additionalKmCharge || 0}
          </MDTypography>
        </MDBox>

        <MDBox mt={3}>
          <MDTypography variant="h6" gutterBottom>
            Other Charges
          </MDTypography>
          <Grid container spacing={2}>
            {Object.entries(rules).map(([key, value]) => {
              if (
                key !== "cartValueRanges" &&
                key !== "distanceConfig" &&
                key !== "weightRanges" &&
                typeof value === "number"
              ) {
                return (
                  <Grid item xs={6} sm={4} key={key}>
                    <MDTypography>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}: ₹
                      {value}
                    </MDTypography>
                  </Grid>
                );
              }
              return null;
            })}
          </Grid>
        </MDBox>

        {rules.weightRanges && (
          <MDBox mt={3}>
            <MDTypography variant="h6" gutterBottom>
              Weight Ranges
            </MDTypography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Min Weight (g)</TableCell>
                    <TableCell>Max Weight (g)</TableCell>
                    <TableCell>Charge (₹)</TableCell>
                    <TableCell>Additional per 250g</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.weightRanges.map((range, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{range.minWeight}</TableCell>
                      <TableCell>{range.maxWeight === null ? "∞" : range.maxWeight}</TableCell>
                      <TableCell>{range.charge}</TableCell>
                      <TableCell>{range.additionalPer250g || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MDBox>
        )}
      </Box>
    );
  };

  // Prepare data for DataTable
  const tableData = {
    columns: [
      { Header: "Charge Type", accessor: "chargesType", width: "30%" },
      { Header: "Base Distance", accessor: "baseDistance", width: "20%" },
      { Header: "Additional KM Charge", accessor: "additionalKmCharge", width: "20%" },
      { Header: "Actions", accessor: "actions", width: "30%" },
    ],
    rows: filteredChargeRules.map((rule) => ({
      chargesType: rule.chargesType,
      baseDistance: `${rule.rules.distanceConfig?.baseDistance || 0} km`,
      additionalKmCharge: `₹${rule.rules.distanceConfig?.additionalKmCharge || 0}`,
      actions: (
        <Box>
          <IconButton
            color="error"
            onClick={() =>
              setDialogState({
                deleteOpen: true,
                currentCharge: rule,
              })
            }
          >
            {/* <DeleteIcon /> */}
          </IconButton>
          <IconButton color="dark" onClick={() => handleEditClick(rule)} sx={{ ml: 1 }}>
            <EditIcon />
          </IconButton>
          <IconButton color="info" onClick={() => handleViewDetails(rule)} sx={{ ml: 1 }}>
            <VisibilityIcon />
          </IconButton>
        </Box>
      ),
    })),
  };

  if (state.loading && state.chargeRules.length === 0) {
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
                    Charges
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Charge Rules"
                      variant="outlined"
                      size="small"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                        }))
                      }
                      sx={{
                        width: 300,
                        backgroundColor: "white",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "transparent",
                          },
                          "&:hover fieldset": {
                            borderColor: "transparent",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "transparent",
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState((prev) => ({ ...prev, createOpen: true }))}
                    >
                      Create New Rule
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredChargeRules.length > 0 ? (
                  <DataTable
                    table={tableData}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm
                        ? "No matching charge rules found"
                        : "No charge rules available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogState.deleteOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, deleteOpen: false }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>
            Are you sure you want to delete this charge rule:{" "}
            <strong>{dialogState.currentCharge?.chargesType}</strong>?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, deleteOpen: false }))}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Charge Rule Dialog */}
      <Dialog
        open={dialogState.createOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, createOpen: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create New Charge Rule</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Charge Type</InputLabel>
            <Select
              value={newCharge.chargesType}
              label="Charge Type"
              onChange={(e) => setNewCharge((prev) => ({ ...prev, chargesType: e.target.value }))}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.palette.grey[400],
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.grey[600],
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              {CHARGE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <MDTypography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Cart Value Ranges
          </MDTypography>
          {newCharge.rules.cartValueRanges.map((range, index) => (
            <MDBox key={index} sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: 1 }}>
              <MDTypography variant="subtitle1">Range {index + 1}</MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Min Value"
                    type="number"
                    value={range.minValue}
                    onChange={(e) =>
                      handleRuleChange("minValue", parseInt(e.target.value) || 0, index)
                    }
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Max Value"
                    type="number"
                    value={range.maxValue === null ? "" : range.maxValue}
                    onChange={(e) =>
                      handleRuleChange(
                        "maxValue",
                        e.target.value === "" ? null : parseInt(e.target.value) || 0,
                        index
                      )
                    }
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Charge"
                    type="number"
                    value={range.charge}
                    onChange={(e) =>
                      handleRuleChange("charge", parseInt(e.target.value) || 0, index)
                    }
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Message"
                    value={range.message}
                    onChange={(e) => handleRuleChange("message", e.target.value, index)}
                  />
                </Grid>
              </Grid>
            </MDBox>
          ))}

          <MDTypography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Distance Configuration
          </MDTypography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base Distance (km)"
                type="number"
                value={newCharge.rules.distanceConfig.baseDistance}
                onChange={(e) =>
                  handleRuleChange("distanceConfig.baseDistance", parseInt(e.target.value) || 0)
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Additional KM Charge"
                type="number"
                value={newCharge.rules.distanceConfig.additionalKmCharge}
                onChange={(e) =>
                  handleRuleChange(
                    "distanceConfig.additionalKmCharge",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </Grid>
          </Grid>

          <MDTypography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Other Charges
          </MDTypography>
          <Grid container spacing={2}>
            {[
              "packagingCharge",
              "handlingFee",
              "platformFee",
              "codCharge",
              "fastServiceCharge",
              "emergencyDeliverySurcharge",
              "deliveryPartnerFee",
              "longDistanceFee",
              "convenienceCharge",
            ].map((field) => (
              <Grid item xs={6} sm={4} key={field}>
                <TextField
                  fullWidth
                  label={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  type="number"
                  value={newCharge.rules[field] || 0}
                  onChange={(e) => handleRuleChange(field, parseInt(e.target.value) || 0)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, createOpen: false }))}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCharge}
            color="error"
            variant="contained"
            disabled={!newCharge.chargesType}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Charge Rule Dialog */}
      <Dialog
        open={dialogState.editOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, editOpen: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Charge Rule</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Charge Type</InputLabel>
            <Select
              value={newCharge.chargesType}
              label="Charge Type"
              onChange={(e) => setNewCharge((prev) => ({ ...prev, chargesType: e.target.value }))}
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.palette.grey[400],
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.grey[600],
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              {CHARGE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <MDTypography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Cart Value Ranges
          </MDTypography>
          {newCharge.rules.cartValueRanges.map((range, index) => (
            <MDBox key={index} sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: 1 }}>
              <MDTypography variant="subtitle1">Range {index + 1}</MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Min Value"
                    type="number"
                    value={range.minValue}
                    onChange={(e) =>
                      handleRuleChange("minValue", parseInt(e.target.value) || 0, index)
                    }
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Max Value"
                    type="number"
                    value={range.maxValue === null ? "" : range.maxValue}
                    onChange={(e) =>
                      handleRuleChange(
                        "maxValue",
                        e.target.value === "" ? null : parseInt(e.target.value) || 0,
                        index
                      )
                    }
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Charge"
                    type="number"
                    value={range.charge}
                    onChange={(e) =>
                      handleRuleChange("charge", parseInt(e.target.value) || 0, index)
                    }
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Message"
                    value={range.message}
                    onChange={(e) => handleRuleChange("message", e.target.value, index)}
                  />
                </Grid>
              </Grid>
            </MDBox>
          ))}

          <MDTypography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Distance Configuration
          </MDTypography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base Distance (km)"
                type="number"
                value={newCharge.rules.distanceConfig.baseDistance}
                onChange={(e) =>
                  handleRuleChange("distanceConfig.baseDistance", parseInt(e.target.value) || 0)
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Additional KM Charge"
                type="number"
                value={newCharge.rules.distanceConfig.additionalKmCharge}
                onChange={(e) =>
                  handleRuleChange(
                    "distanceConfig.additionalKmCharge",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </Grid>
          </Grid>

          <MDTypography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Other Charges
          </MDTypography>
          <Grid container spacing={2}>
            {[
              "packagingCharge",
              "handlingFee",
              "platformFee",
              "codCharge",
              "fastServiceCharge",
              "emergencyDeliverySurcharge",
              "deliveryPartnerFee",
              "longDistanceFee",
              "convenienceCharge",
            ].map((field) => (
              <Grid item xs={6} sm={4} key={field}>
                <TextField
                  fullWidth
                  label={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  type="number"
                  value={newCharge.rules[field] || 0}
                  onChange={(e) => handleRuleChange(field, parseInt(e.target.value) || 0)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, editOpen: false }))}>
            Cancel
          </Button>
          <Button onClick={handleUpdateCharge} color="error" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={dialogState.detailsOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, detailsOpen: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Charge Rule Details: {dialogState.currentCharge?.chargesType}</DialogTitle>
        <DialogContent>
          {dialogState.currentCharge && renderRulesDetails(dialogState.currentCharge.rules)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, detailsOpen: false }))}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default Charges;
