import React, { useEffect, useState } from "react";
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
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function NotificationManagement() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState({
    module: "User",
    content: "",
    isPush: true,
    isDefault: false,
    page: "Home",
    link: "",
    dateFrom: "",
    dateTo: "",
    notificationFrequency: "daily",
    frequency: 1,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotification({
      ...notification,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSendNotification = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/notification.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        setSnackbar({
          open: true,
          message: data.message || "Notification sent successfully!",
          severity: "success",
        });
        handleClose();
        fetchNotifications(); // Refresh the notifications list
      } else {
        setSnackbar({
          open: true,
          message: data?.message || "Failed to send notification",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      setSnackbar({
        open: true,
        message: "Error sending notification",
        severity: "error",
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/notification.getAll`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch notifications",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Module", accessor: "module" },
    { Header: "Content", accessor: "content" },
    { Header: "Link", accessor: "link" },
    { Header: "Date From", accessor: "dateFrom" },
    { Header: "Date To", accessor: "dateTo" },
    { Header: "Page", accessor: "page" },
    { Header: "Frequency", accessor: "frequency" },
    { Header: "Created At", accessor: "createdAt" },
    { Header: "Updated At", accessor: "updatedAt" },
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
                    Notifications
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <Button variant="contained" color="error" onClick={handleOpen}>
                      Send Notification
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: notifications }}
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

      {/* Send Notification Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Module"
            name="module"
            type="text"
            fullWidth
            variant="outlined"
            value={notification.module}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Content"
            name="content"
            type="text"
            fullWidth
            variant="outlined"
            value={notification.content}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Link"
            name="link"
            type="text"
            fullWidth
            variant="outlined"
            value={notification.link}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Date From"
            name="dateFrom"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={notification.dateFrom}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Date To"
            name="dateTo"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={notification.dateTo}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Notification Frequency"
            name="notificationFrequency"
            type="text"
            fullWidth
            variant="outlined"
            value={notification.notificationFrequency}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Frequency"
            name="frequency"
            type="number"
            fullWidth
            variant="outlined"
            value={notification.frequency}
            onChange={handleInputChange}
          />
          <MDBox display="flex" gap={2} flexWrap="wrap">
            <MDTypography>
              Is Push:
              <input
                type="checkbox"
                name="isPush"
                checked={notification.isPush}
                onChange={handleInputChange}
              />
            </MDTypography>
            <MDTypography>
              Is Default:
              <input
                type="checkbox"
                name="isDefault"
                checked={notification.isDefault}
                onChange={handleInputChange}
              />
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSendNotification} color="error" variant="contained">
            Send
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

NotificationManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      module: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      link: PropTypes.string,
      dateFrom: PropTypes.string,
      dateTo: PropTypes.string,
      page: PropTypes.string,
      notificationFrequency: PropTypes.string,
      frequency: PropTypes.number,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default NotificationManagement;
