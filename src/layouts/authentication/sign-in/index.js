import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/logos/logo.jpeg";
import logo from "assets/images/logos/logo.jpeg";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Custom styled components for modern look
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const HeaderBox = styled(MDBox)(({ theme }) => ({
  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  padding: "2rem",
  color: "white",
  textAlign: "center",
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    left: 0,
    right: 0,
    height: "20px",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)",
    zIndex: 1,
  },
}));

const FormBox = styled(MDBox)(({ theme }) => ({
  padding: "2rem",
  "& .MuiInputBase-root": {
    borderRadius: "12px",
    "&:before, &:after": {
      display: "none",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 2px rgba(79, 172, 254, 0.5)",
    },
  },
}));

const LoginButton = styled(MDButton)(({ theme }) => ({
  borderRadius: "12px",
  padding: "12px 0",
  fontWeight: "600",
  letterSpacing: "0.5px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  },
  "&:disabled": {
    opacity: 0.7,
  },
}));

function Basic() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  // Get base URL from environment variable
  const BASE_URL = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const X_AUTHORIZATION =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "x-authorization": X_AUTHORIZATION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.data.id);

      setSnackbarMessage("Login successful! Redirecting to admin dashboard...");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.message);
      setSnackbarMessage(error.message || "Login failed. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <ModernCard>
        <HeaderBox>
          <MDBox mb={3}>
            <img
              src={logo}
              alt="Logo"
              style={{
                maxWidth: "180px",
                marginBottom: "16px",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                borderRadius: "50%",
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          </MDBox>
          <MDTypography
            variant="h3"
            fontWeight="bold"
            color="white"
            mt={1}
            sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          >
            Admin Portal
          </MDTypography>
          <MDTypography variant="body2" color="white" opacity={0.9}>
            Sign in to continue
          </MDTypography>
        </HeaderBox>

        <FormBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={3}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={handleEmailChange}
                required
                variant="outlined"
                sx={{
                  backgroundColor: "#f8f9fa",
                  "& .MuiInputLabel-root": {
                    color: "#6c757d",
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "14px",
                  },
                }}
              />
            </MDBox>

            <MDBox mb={4}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={handlePasswordChange}
                required
                variant="outlined"
                sx={{
                  backgroundColor: "#f8f9fa",
                  "& .MuiInputLabel-root": {
                    color: "#6c757d",
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "14px",
                  },
                }}
              />
            </MDBox>

            <MDBox mt={4} mb={1}>
              <LoginButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={!email || !password}
              >
                Sign In
              </LoginButton>
            </MDBox>

            {errorMessage && (
              <MDTypography
                variant="body2"
                color="error"
                textAlign="center"
                sx={{
                  mt: 2,
                  padding: "8px",
                  backgroundColor: "rgba(220, 53, 69, 0.1)",
                  borderRadius: "8px",
                }}
              >
                {errorMessage}
              </MDTypography>
            )}
          </MDBox>
        </FormBox>
      </ModernCard>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </BasicLayout>
  );
}

export default Basic;
