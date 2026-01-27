import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  // TextField removed (unused)
  Alert,
  CircularProgress,
  Input,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import api from '../../utils/api';

const MyAssignments = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await api.get(`/api/student/classes/${classId}/assignments`);
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      fetchAssignments();
    }
  }, [classId, fetchAssignments]);



  const handleFileSelect = (assignment) => {
    setSelectedAssignment(assignment);
    setOpen(true);
    setFile(null);
    setError('');
    setSuccess('');
  };

  const handleResubmit = async (assignment) => {
    if (window.confirm('Your previous submission was rejected. Resubmitting will delete it. Continue?')) {
      try {
        // Find the submission ID. We need to fetch it if not present in the assignment object.
        // Actually, the assignment object from student/classes/:id/assignments doesn't have submission ID.
        // Let's first delete by fetching all submissions for this user and finding the one for this assignment.
        const res = await api.get('/api/student/submissions');
        const submission = res.data.submissions.find(s => s.assignment_id === assignment.id);

        if (submission) {
          await api.delete(`/api/assignments/submissions/${submission.id}`);
        }

        // Now open the upload dialog
        handleFileSelect(assignment);
      } catch (error) {
        console.error('Error handling resubmit:', error);
        setError('Failed to prepare for resubmission');
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/api/assignments/${selectedAssignment.id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Assignment submitted successfully! Plagiarism check in progress.');
      setOpen(false);
      fetchAssignments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status, similarityScore) => {
    if (status === 'rejected') return 'error';
    if (status === 'checked' && similarityScore > 50) return 'error';
    if (status === 'checked') return 'success';
    return 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!classId) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a class to view assignments
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Assignments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Similarity Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.description || '-'}</TableCell>
                  <TableCell>
                    {assignment.due_date
                      ? new Date(assignment.due_date).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.submission_status || 'Not Submitted'}
                      color={getStatusColor(
                        assignment.submission_status,
                        assignment.similarity_score
                      )}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {assignment.similarity_score !== null
                      ? `${assignment.similarity_score}%`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {!assignment.submission_status ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UploadIcon />}
                        onClick={() => handleFileSelect(assignment)}
                      >
                        Submit
                      </Button>
                    ) : assignment.submission_status === 'rejected' ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<UploadIcon />}
                        onClick={() => handleResubmit(assignment)}
                      >
                        Resubmit
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Assignment: {selectedAssignment?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Input
              type="file"
              inputProps={{ accept: '.pdf,.docx,.doc,.txt' }}
              onChange={(e) => setFile(e.target.files[0])}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Accepted formats: PDF, DOCX, DOC, TXT (Max 10MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={uploading || !file}>
            {uploading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAssignments;




