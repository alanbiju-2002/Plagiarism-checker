import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Upload as UploadIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Description as FileIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as CheckIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const DeadlineBadge = ({ dueDate, extensionDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState({ label: '', color: '' });

  const calculateStatus = useCallback(() => {
    const now = new Date();
    const deadline = extensionDate ? new Date(extensionDate) : (dueDate ? new Date(dueDate) : null);
    
    if (!deadline) return;

    const diff = deadline - now;
    
    if (diff <= 0) {
      setStatus({ label: 'Closed', color: 'error' });
      setTimeLeft('Submission period over');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      setStatus({ label: 'Open', color: 'success' });
      setTimeLeft(`Closes in ${days}d ${hours % 24}h`);
    } else {
      setStatus({ label: 'Due Today', color: 'warning' });
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`Closes in ${hours}h ${mins}m`);
    }
  }, [dueDate, extensionDate]);

  useEffect(() => {
    calculateStatus();
    const timer = setInterval(calculateStatus, 60000);
    return () => clearInterval(timer);
  }, [calculateStatus]);

  if (!status.label) return null;

  return (
    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
      <Chip 
        label={status.label} 
        size="small" 
        color={status.color} 
        sx={{ fontWeight: 800, borderRadius: 1 }} 
      />
      <Typography variant="caption" fontWeight={700} color={`${status.color}.main`}>
        {extensionDate ? `Extended - ${timeLeft}` : timeLeft}
      </Typography>
      {extensionDate && (
        <Typography variant="caption" sx={{ width: '100%', color: 'warning.main', fontWeight: 800 }}>
          New Deadline: {new Date(extensionDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </Typography>
      )}
    </Box>
  );
};

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
    if (window.confirm('Submission was flagged. Resubmitting will clear the previous record. Proceed?')) {
      try {
        const res = await api.get('/api/student/submissions');
        const submission = res.data.submissions.find(s => s.assignment_id === assignment.id);
        if (submission) {
          await api.delete(`/api/assignments/submissions/${submission.id}`);
        }
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Work submitted successfully!');
      setOpen(false);
      fetchAssignments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  const getStatusInfo = (status) => {
    if (status === 'accepted') return { color: 'success', label: 'Accepted', icon: <CheckIcon fontSize="small" />, bg: '#f0fdf4', border: '#bcf0da' };
    if (status === 'rejected') return { color: 'error', label: 'Flagged', icon: <ErrorIcon fontSize="small" />, bg: '#fef2f2', border: '#fecaca' };
    if (status === 'submitted') return { color: 'info', label: 'Processing', icon: <RefreshIcon fontSize="small" className="spin-animation" />, bg: '#eff6ff', border: '#bfdbfe' };
    return { color: 'secondary', label: 'Pending', icon: <EventIcon fontSize="small" />, bg: '#f8fafc', border: '#e2e8f0' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress thickness={5} size={60} />
      </Box>
    );
  }

  if (!classId) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #e2e8f0' }}>
        <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} color="text.secondary">
          No Classroom Selected
        </Typography>
        <Button href="/student/classes" variant="outlined" sx={{ mt: 2, borderRadius: 10 }}>
          Go to My Classes
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
          Course Assignments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track deadlines and submit your original work for verification.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

      <Grid container spacing={4}>
        {assignments.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h6" color="text.secondary">No assignments posted yet.</Typography>
            </Paper>
          </Grid>
        ) : (
          assignments.map((assignment) => {
            const status = getStatusInfo(assignment.submission_status);
            return (
              <Grid item xs={12} md={6} key={assignment.id}>
                <Card sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&:hover': { boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Typography variant="h5" fontWeight={800} sx={{ flexGrow: 1, mr: 2 }}>
                        {assignment.title}
                      </Typography>
                      <Chip
                        icon={status.icon}
                        label={status.label}
                        sx={{
                          bgcolor: status.bg,
                          color: `${status.color}.main`,
                          fontWeight: 700,
                          border: `1px solid ${status.border}`
                        }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                      {assignment.description || 'No additional instructions provided.'}
                    </Typography>

                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EventIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                              DUE: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'No Due Date'}
                            </Typography>
                          </Box>
                          <DeadlineBadge dueDate={assignment.due_date} extensionDate={assignment.extended_until} />
                        </Box>
                        {assignment.submission_status && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckIcon sx={{ color: 'success.main', fontSize: 18 }} />
                            <Typography variant="caption" fontWeight={600} color="success.main">
                              ALREADY SUBMITTED
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      {(() => {
                        const isPast = (() => {
                          const now = new Date();
                          const deadline = assignment.extended_until ? new Date(assignment.extended_until) : (assignment.due_date ? new Date(assignment.due_date) : null);
                          return deadline && now > deadline;
                        })();

                        if (!assignment.submission_status) {
                          return (
                            <Button
                              variant="contained"
                              disabled={isPast}
                              startIcon={<UploadIcon />}
                              onClick={() => handleFileSelect(assignment)}
                              sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                            >
                              {isPast ? 'Submission Closed' : 'Submit Work'}
                            </Button>
                          );
                        }

                        if (assignment.submission_status === 'rejected') {
                          return (
                            <Button
                              variant="outlined"
                              color="error"
                              disabled={isPast}
                              startIcon={<RefreshIcon />}
                              onClick={() => handleResubmit(assignment)}
                              sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                              {isPast ? 'Deadline Passed (Flagged)' : 'Resubmit Version'}
                            </Button>
                          );
                        }

                        return (
                          <Button
                            variant="soft"
                            disabled
                            sx={{ borderRadius: 2, bgcolor: '#f1f5f9', color: 'text.disabled' }}
                          >
                            View Receipt
                          </Button>
                        );
                      })()}
                    </Box>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
          Final Submission
        </DialogTitle>
        <DialogContent>
          <Box sx={{
            mt: 2,
            border: '2px dashed #e2e8f0',
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            bgcolor: '#f8fafc',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: '#f1f5f9', borderColor: 'primary.main' }
          }}>
            <FileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.8 }} />
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
              {file ? file.name : 'Select your file'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              PDF, DOCX, or TXT (Max 10MB)
            </Typography>
            <Button
              component="label"
              variant="outlined"
              size="small"
              sx={{ borderRadius: 10, px: 3 }}
            >
              Choose File
              <input type="file" hidden accept=".pdf,.docx,.doc,.txt" onChange={(e) => setFile(e.target.files[0])} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploading || !file}
            sx={{ borderRadius: 2, px: 4, fontWeight: 800 }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Begin Audit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAssignments;





