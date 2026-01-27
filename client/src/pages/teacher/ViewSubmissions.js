import React, { useState, useEffect, useCallback } from 'react';
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
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip as MuiTooltip
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import api from '../../utils/api';

const ViewSubmissions = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [details, setDetails] = useState(null);
  const [score, setScore] = useState('');
  const [grading, setGrading] = useState(false);
  const [autoAssignOpen, setAutoAssignOpen] = useState(false);
  const [rollPrefix, setRollPrefix] = useState('MCA_');
  const [assigning, setAssigning] = useState(false);
  const [editingRoll, setEditingRoll] = useState(null);
  const [newRoll, setNewRoll] = useState('');

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/api/teacher/classes');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await api.get(`/api/teacher/classes/${selectedClass}/assignments`);
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  }, [selectedClass]);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/teacher/assignments/${selectedAssignment}/submissions`);
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedAssignment]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchAssignments();
    }
  }, [selectedClass, fetchAssignments]);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions();
    }
  }, [selectedAssignment, fetchSubmissions]);

  const handleViewDetails = async (submission) => {
    setSelectedSubmission(submission);
    setOpen(true);
    try {
      const response = await api.get(`/api/teacher/submissions/${submission.id}`);
      setDetails(response.data);
      setScore(response.data.submission.score || '');
    } catch (error) {
      console.error('Error fetching submission details:', error);
    }
  };

  const handleUpdateScore = async () => {
    setGrading(true);
    try {
      await api.post(`/api/teacher/submissions/${selectedSubmission.id}/score`, { score });
      fetchSubmissions();
      setDetails({
        ...details,
        submission: { ...details.submission, score }
      });
    } catch (error) {
      console.error('Error updating score:', error);
    } finally {
      setGrading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get(`/api/teacher/assignments/${selectedAssignment}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const assignment = assignments.find(a => a.id === selectedAssignment);
      link.setAttribute('download', `Scores_${assignment?.title.replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  };

  const handleAutoAssign = async () => {
    setAssigning(true);
    try {
      await api.post(`/api/teacher/classes/${selectedClass}/auto-assign-rolls`, { prefix: rollPrefix });
      setAutoAssignOpen(false);
      fetchSubmissions();
    } catch (error) {
      console.error('Error auto-assigning rolls:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Failed to auto-assign roll numbers');
    } finally {
      setAssigning(false);
    }
  };

  const handleStartEditRoll = (submission) => {
    setEditingRoll(submission.student_id);
    setNewRoll(submission.student_roll_number || '');
  };

  const handleSaveRoll = async (studentId) => {
    try {
      await api.put(`/api/teacher/students/${studentId}/roll-number`, { roll_number: newRoll });
      setEditingRoll(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating roll number:', error);
      alert(error.response?.data?.message || 'Failed to update roll number');
    }
  };

  const getStatusColor = (status, similarityScore) => {
    if (status === 'rejected' || similarityScore > 50) return 'error';
    if (status === 'checked') return 'success';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        View Submissions
      </Typography>

      <Box sx={{ mt: 3, mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Select Class"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedAssignment('');
            setSubmissions([]);
          }}
          sx={{ minWidth: 200 }}
        >
          {classes.map((classItem) => (
            <MenuItem key={classItem.id} value={classItem.id}>
              {classItem.class_name}
            </MenuItem>
          ))}
        </TextField>

        {selectedClass && (
          <TextField
            select
            label="Select Assignment"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {assignments.map((assignment) => (
              <MenuItem key={assignment.id} value={assignment.id}>
                {assignment.title}
              </MenuItem>
            ))}
          </TextField>
        )}

        {selectedAssignment && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleDownloadExcel}
              sx={{ height: 56 }}
            >
              Download Excel Report
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setAutoAssignOpen(true)}
              sx={{ height: 56 }}
            >
              Auto-assign Rolls
            </Button>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roll Number</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Student Email</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Similarity Score</TableCell>
                <TableCell>Marks/Score</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {selectedAssignment
                      ? 'No submissions found'
                      : 'Please select a class and assignment'}
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {editingRoll === submission.student_id ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            value={newRoll}
                            onChange={(e) => setNewRoll(e.target.value)}
                            sx={{ width: 100 }}
                          />
                          <Button size="small" onClick={() => handleSaveRoll(submission.student_id)}>Save</Button>
                          <Button size="small" color="error" onClick={() => setEditingRoll(null)}>X</Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {submission.student_roll_number || 'N/A'}
                          <Button size="small" onClick={() => handleStartEditRoll(submission)} sx={{ minWidth: 'auto' }}>
                            Edit
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{submission.student_name}</TableCell>
                    <TableCell>{submission.student_email}</TableCell>
                    <TableCell>{submission.file_name}</TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status}
                        color={getStatusColor(
                          submission.status,
                          submission.similarity_score
                        )}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {submission.similarity_score !== null
                        ? `${submission.similarity_score}%`
                        : 'Pending'}
                    </TableCell>
                    <TableCell>
                      {submission.score !== null ? submission.score : 'Not Graded'}
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
                      {submission.file_path && (
                        <Button
                          variant="contained"
                          size="small"
                          color="info"
                          startIcon={<Visibility />}
                          onClick={() => {
                            // Normalize path: replace backslashes with forward slashes
                            const normalizedPath = submission.file_path.replace(/\\/g, '/');
                            const url = `http://localhost:5000/${normalizedPath}`;
                            window.open(url, '_blank');
                          }}
                        >
                          View File
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Submission Details: {selectedSubmission?.file_name}
        </DialogTitle>
        <DialogContent>
          {details && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Student: {details.submission.student_name || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Status: {details.submission.status}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Similarity Score: {details.submission.similarity_score || 0}%
              </Typography>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Grade Submission
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Score"
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleUpdateScore}
                    disabled={grading}
                  >
                    {grading ? <CircularProgress size={24} /> : 'Save Score'}
                  </Button>
                </Box>
              </Box>

              {details.submission.rejection_reason && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {details.submission.rejection_reason}
                </Alert>
              )}
              {details.matches && details.matches.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Plagiarism Matches:
                  </Typography>
                  {details.matches.map((match, index) => (
                    <Paper key={index} sx={{ p: 2, mt: 1 }}>
                      <Typography variant="body2">
                        Source: {match.matched_source_type === 'external'
                          ? match.external_source_title
                          : `Submission by ${match.matched_student_name}`}
                      </Typography>
                      <Typography variant="body2">
                        Similarity: {match.similarity_percentage}%
                      </Typography>
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

      <Dialog open={autoAssignOpen} onClose={() => setAutoAssignOpen(false)}>
        <DialogTitle>Auto-assign Roll Numbers</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will assign roll numbers to ALL students in this class based on their alphabetical name order.
          </Typography>
          <TextField
            fullWidth
            label="Roll Number Prefix"
            value={rollPrefix}
            onChange={(e) => setRollPrefix(e.target.value)}
            helperText="Example: MCA_ (will generate MCA_001, MCA_002, etc.)"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoAssignOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAutoAssign}
            disabled={assigning}
          >
            {assigning ? <CircularProgress size={24} /> : 'Assign Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewSubmissions;




