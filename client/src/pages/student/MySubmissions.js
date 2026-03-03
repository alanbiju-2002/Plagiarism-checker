import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Class as ClassIcon,
  Description as FileIcon,
  Schedule as TimeIcon,
  ChatBubbleOutline as NoteIcon,
} from '@mui/icons-material';
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
    setDetails(null);
    try {
      const response = await api.get(`/api/student/submissions/${submission.id}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Error fetching submission details:', error);
    }
  };

  const handleResubmit = async (submission) => {
    if (window.confirm('This will delete your current record and allow resubmission. Continue?')) {
      try {
        await api.delete(`/api/assignments/submissions/${submission.id}`);
        fetchSubmissions();
        alert('Ready for new submission in Assignments page.');
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Failed to process resubmission.');
      }
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
      case 'approved':
      case 'checked':
        return { color: 'success', bg: '#f0fdf4', label: 'Accepted' };
      case 'rejected':
        return { color: 'error', bg: '#fef2f2', label: 'Flagged' };
      default:
        return { color: 'info', bg: '#eff6ff', label: 'Processing' };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress thickness={5} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
          Submission Records
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review your academic integrity reports and submission history.
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', elevation: 0 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 2.5 }}><AssignmentIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} /> ASSIGNMENT</TableCell>
              <TableCell sx={{ fontWeight: 700 }}><ClassIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} /> CLASS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}><FileIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} /> FILE</TableCell>
              <TableCell sx={{ fontWeight: 700 }}><TimeIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} /> SUBMITTED</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography color="text.disabled">No records found. Start submitting your assignments!</Typography>
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => {
                const config = getStatusConfig(submission.status);
                return (
                  <TableRow key={submission.id} sx={{ '&:hover': { bgcolor: '#fcfcfe' } }}>
                    <TableCell fontWeight={700}>{submission.assignment_title}</TableCell>
                    <TableCell color="text.secondary">{submission.class_name}</TableCell>
                    <TableCell color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{submission.file_name}</TableCell>
                    <TableCell color="text.secondary">
                      {new Date(submission.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: config.bg,
                          color: `${config.color}.main`,
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="soft"
                          size="small"
                          onClick={() => handleViewDetails(submission)}
                          sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#f1f5f9' }}
                        >
                          Details
                        </Button>
                        {submission.status === 'rejected' && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleResubmit(submission)}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                          >
                            Resubmit
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Integrity Report
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
            Assignment: {selectedSubmission?.assignment_title}
          </Typography>

          {details ? (
            <Box>
              <Box sx={{
                p: 3,
                bgcolor: '#f8fafc',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Verification Status</Typography>
                  <Typography variant="h5" fontWeight={800} color={getStatusConfig(details.submission.status).color + '.main'}>
                    {details.submission.status.toUpperCase()}
                  </Typography>
                </Box>
                {details.submission.similarity_score !== undefined && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>Similarity Index</Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {parseFloat(details.submission.similarity_score).toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Box>

              {details.submission.rejection_reason && (
                <Box sx={{ p: 3, bgcolor: '#fef2f2', borderRadius: 3, border: '1px solid #fecaca' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'error.main' }}>
                    <NoteIcon fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>Faculty Feedback</Typography>
                  </Box>
                  <Typography variant="body2" color="error.dark">
                    {details.submission.rejection_reason}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={30} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading detailed report...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }} fullWidth variant="outlined">Close Report</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MySubmissions;





