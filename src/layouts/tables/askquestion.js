import React, { useEffect, useState } from "react";
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
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function AskQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openReply, setOpenReply] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
  });
  const [replyData, setReplyData] = useState({
    id: null,
    answer: "",
  });
  const [deleteQuestion, setDeleteQuestion] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/askedQuestion.getAll?page=${page}&limit=10`, {
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status && data.askedQuestions) {
        setQuestions(data.askedQuestions);
        setTotalPages(data.totalPages);
      } else {
        console.error("No questions data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching questions data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch questions",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewQuestion({ question: "" });
  };

  const handleOpenReply = (question) => {
    setReplyData({
      id: question.id,
      answer: question.answer || "",
    });
    setOpenReply(true);
  };

  const handleCloseReply = () => {
    setOpenReply(false);
    setReplyData({ id: null, answer: "" });
  };

  const handleOpenDelete = (question) => {
    setDeleteQuestion(question);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: value,
    });
  };

  const handleReplyInputChange = (e) => {
    const { value } = e.target;
    setReplyData({
      ...replyData,
      answer: value,
    });
  };

  const handleCreateQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token) {
        console.error("No token found, please login again");
        return;
      }

      const response = await fetch(`${baseUrl}/askQuestion`, {
        method: "POST",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newQuestion),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Question submitted successfully!",
          severity: "success",
        });
        handleClose();
        fetchQuestions();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to submit question",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      setSnackbar({
        open: true,
        message: "Error submitting question. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReplyQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !replyData.id) {
        console.error("No token found or no question selected for reply");
        return;
      }

      const response = await fetch(`${baseUrl}/askedQuestion.update`, {
        method: "PUT",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: replyData.id,
          answer: replyData.answer,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Reply submitted successfully!",
          severity: "success",
        });
        handleCloseReply();
        fetchQuestions();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to submit reply",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      setSnackbar({
        open: true,
        message: "Error submitting reply. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token || !deleteQuestion) {
        console.error("No token found or no question selected for deletion");
        return;
      }

      const response = await fetch(`${baseUrl}/askedQuestion.delete/${deleteQuestion.id}`, {
        method: "DELETE",
        headers: {
          "x-authorization": "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Question deleted successfully!",
          severity: "success",
        });
        handleCloseDelete();
        fetchQuestions();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to delete question",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      setSnackbar({
        open: true,
        message: "Error deleting question. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    // {
    //   Header: "User",
    //   accessor: "user",
    //   Cell: ({ value }) => (
    //     <MDTypography variant="button" fontWeight="medium">
    //       {value?.name || "N/A"} ({value?.email || "No email"})
    //     </MDTypography>
    //   ),
    // },
    { Header: "Question", accessor: "question" },
    {
      Header: "Status",
      accessor: "isReplied",
      Cell: ({ value }) => (
        <MDTypography variant="button" fontWeight="medium" color={value ? "success" : "error"}>
          {value ? "Replied" : "Pending"}
        </MDTypography>
      ),
    },
    { Header: "Answer", accessor: "answer" },
    // { Header: "Date", accessor: "createdAt" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <MDBox display="flex" gap={1}>
          <IconButton onClick={() => handleOpenReply(row.original)}>
            <ReplyIcon color="info" />
          </IconButton>
          <IconButton onClick={() => handleOpenDelete(row.original)}>
            <DeleteIcon color="error" />
          </IconButton>
        </MDBox>
      ),
    },
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
                    Questions
                  </MDTypography>
                  {/* <Button variant="contained" color="error" onClick={handleOpen}>
                    Add New Question
                  </Button> */}
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: questions }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  pagination={{
                    page,
                    totalPages,
                    onChange: (newPage) => setPage(newPage),
                  }}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Ask New Question Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ask New Question</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="question"
            label="Your Question"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={4}
            value={newQuestion.question}
            onChange={handleInputChange}
            name="question"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateQuestion}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Reply Question Dialog */}
      <Dialog open={openReply} onClose={handleCloseReply} fullWidth maxWidth="md">
        <DialogTitle>Reply to Question</DialogTitle>
        <DialogContent>
          <MDBox mb={2}>
            <MDTypography variant="h6">Question:</MDTypography>
            <MDTypography>
              {questions.find((q) => q.id === replyData.id)?.question || ""}
            </MDTypography>
          </MDBox>
          <TextField
            autoFocus
            margin="dense"
            id="answer"
            label="Your Answer"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={2}
            value={replyData.answer}
            onChange={handleReplyInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReply}>Cancel</Button>
          <Button onClick={handleReplyQuestion}>Submit Reply</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>
            Are you sure you want to delete this question:
            <strong> {deleteQuestion?.question}</strong>?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDeleteQuestion} color="error" variant="contained">
            Delete
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

AskQuestions.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string,
      isReplied: PropTypes.bool.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
      user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    PropTypes.bool,
  ]),
};

export default AskQuestions;
