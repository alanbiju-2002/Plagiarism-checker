import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Typography as MuiTypography,
} from '@mui/material';
import api from '../../utils/api';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/api/student/submissions');
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (submission) => {
    setSelectedSubmission(submission);
    setOpen(true);
    try {
      const response = await api.get(`/api/student/submissions/${submission.id}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Error fetching submission details:', error);
    }
  };

  const handleResubmit = async (submission) => {
    if (window.confirm('Are you sure you want to resubmit? This will delete your current submission.')) {
      try {
        await api.delete(`/api/assignments/submissions/${submission.id}`);
        // After deletion, refresh the list
        fetchSubmissions();
        // Optionially alert the user or redirect
        alert('Current submission deleted. You can now submit a new version from the Assignments page.');
      } catch (error) {
        console.error('Error deleting submission for resubmit:', error);
        alert('Failed to delete submission. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'checked':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Submissions
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Assignment</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Similarity Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.assignment_title}</TableCell>
                  <TableCell>{submission.class_name}</TableCell>
                  <TableCell>{submission.file_name}</TableCell>
                  <TableCell>
                    {new Date(submission.submitted_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={submission.status}
                      color={getStatusColor(submission.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {submission.similarity_score !== null
                      ? `${submission.similarity_score}%`
                      : 'Pending'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(submission)}
                      sx={{ mr: 1 }}
                    >
                      View Details
                    </Button>
                    {submission.status === 'rejected' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleResubmit(submission)}
                      >
                        Resubmit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Submission Details: {selectedSubmission?.assignment_title}
        </DialogTitle>
        <DialogContent>
          {details && (
            <Box>
              <MuiTypography variant="h6" gutterBottom>
                Status: {details.submission.status}
              </MuiTypography>
              <MuiTypography variant="body1" gutterBottom>
                Similarity Score: {details.submission.similarity_score || 0}%
              </MuiTypography>
              {details.submission.rejection_reason && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {details.submission.rejection_reason}
                </Alert>
              )}
              {details.matches && details.matches.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <MuiTypography variant="h6" gutterBottom>
                    Plagiarism Matches:
                  </MuiTypography>
                  {details.matches.map((match, index) => (
                    <Paper key={index} sx={{ p: 2, mt: 1 }}>
                      <MuiTypography variant="body2">
                        Source: {match.matched_source_type === 'external'
                          ? match.external_source_title
                          : `Submission by ${match.matched_student_name}`}
                      </MuiTypography>
                      <MuiTypography variant="body2">
                        Similarity: {match.similarity_percentage}%
                      </MuiTypography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MySubmissions;




