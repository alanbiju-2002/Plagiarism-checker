import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  FileDownload as DownloadIcon,
  AutoFixHigh as AutoIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AssignmentTurnedIn as GradIcon,
  Assessment as StatIcon,
  Groups as ClassIcon,
  Description as ReportIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import ComparisonModal from '../../components/teacher/ComparisonModal';

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
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [comparisonOpen, setComparisonOpen] = useState(false);

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
    setDetails(null);
    try {
      const response = await api.get(`/api/teacher/submissions/${submission.id}`);
      setDetails(response.data);
      setScore(response.data.submission.score || '');
    } catch (error) {
      console.error('Error fetching submission details:', error);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'rejected') {
      setRejectionDialogOpen(true);
      setRejectionReason('');
      return;
    }

    try {
      await api.post(`/api/teacher/submissions/${selectedSubmission.id}/status`, {
        status: newStatus,
        rejection_reason: null
      });
      fetchSubmissions();
      if (details) {
        setDetails({
          ...details,
          submission: { ...details.submission, status: newStatus, rejection_reason: null }
        });
      }
      alert(`Submission ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleConfirmReject = async () => {
    try {
      await api.post(`/api/teacher/submissions/${selectedSubmission.id}/status`, {
        status: 'rejected',
        rejection_reason: rejectionReason
      });
      setRejectionDialogOpen(false);
      fetchSubmissions();
      if (details) {
        setDetails({
          ...details,
          submission: { ...details.submission, status: 'rejected', rejection_reason: rejectionReason }
        });
      }
      alert('Submission rejected successfully');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Failed to reject submission');
    }
  };

  const handleUpdateScore = async () => {
    setGrading(true);
    try {
      await api.post(`/api/teacher/submissions/${selectedSubmission.id}/score`, { score });
      fetchSubmissions();
      if (details) {
        setDetails({
          ...details,
          submission: { ...details.submission, score }
        });
      }
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

  const getStatusColor = (status, submission) => {
    if (status === 'accepted' || status === 'checked') return { color: 'success', bg: '#f0fdf4' };
    const similarity = submission?.similarity_score ?? 0;
    if (status === 'rejected' || similarity > 50) return { color: 'error', bg: '#fef2f2' };
    return { color: 'info', bg: '#eff6ff' };
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
            Submission Audit
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyze academic integrity and manage student evaluations.
          </Typography>
        </Box>
        {selectedAssignment && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AutoIcon />}
              onClick={() => setAutoAssignOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Auto-Roll Config
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadExcel}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
            >
              Export Scores
            </Button>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, display: 'flex', gap: 3, alignItems: 'center', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <TextField
          select
          label="Select Classroom"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedAssignment('');
            setSubmissions([]);
          }}
          sx={{ minWidth: 260, bgcolor: 'white' }}
          size="small"
          InputProps={{ startAdornment: <ClassIcon sx={{ mr: 1, color: 'text.disabled' }} /> }}
        >
          {classes.map((classItem) => (
            <MenuItem key={classItem.id} value={classItem.id}>{classItem.class_name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Select Module/Assignment"
          value={selectedAssignment}
          onChange={(e) => setSelectedAssignment(e.target.value)}
          sx={{ minWidth: 260, bgcolor: 'white' }}
          disabled={!selectedClass}
          size="small"
          InputProps={{ startAdornment: <ReportIcon sx={{ mr: 1, color: 'text.disabled' }} /> }}
        >
          {assignments.map((assignment) => (
            <MenuItem key={assignment.id} value={assignment.id}>{assignment.title}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {loading ? (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={12}>
          <CircularProgress thickness={5} size={60} />
          <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>Gathering submissions...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f5f9' }}>ROLL #</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f5f9' }}>STUDENT</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f5f9' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f5f9', textAlign: 'center' }}>SIMILARITY</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f5f9', textAlign: 'center' }}>SCORE</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f5f9', textAlign: 'right' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <StatIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      {selectedAssignment ? 'No submissions yet for this assignment.' : 'Please choose a module to start the audit.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => {
                  const statusInfo = getStatusColor(submission.status, submission);
                  return (
                    <TableRow key={submission.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell>
                        {editingRoll === submission.student_id ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField size="small" value={newRoll} onChange={(e) => setNewRoll(e.target.value)} sx={{ width: 100 }} />
                            <IconButton color="primary" onClick={() => handleSaveRoll(submission.student_id)}><CheckIcon /></IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={700} color="primary.main">{submission.student_roll_number || '---'}</Typography>
                            <IconButton size="small" onClick={() => handleStartEditRoll(submission)} sx={{ opacity: 0.3, '&:hover': { opacity: 1 } }}>
                              <EditIcon fontSize="inherit" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>{submission.student_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{submission.student_email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.status.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: statusInfo.bg,
                            color: `${statusInfo.color}.main`,
                            borderRadius: 1
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {submission.similarity_score != null ? (
                          <Typography fontWeight={800} color={submission.similarity_score > 30 ? 'error.main' : 'success.main'}>
                            {submission.similarity_score}%
                          </Typography>
                        ) : '---'}
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={800} sx={{ bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: 2, display: 'inline-block' }}>
                          {submission.score !== null ? submission.score : '--'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            variant="soft"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewDetails(submission)}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          >
                            Review
                          </Button>
                          {submission.file_path && (
                            <IconButton
                              color="primary"
                              onClick={() => {
                                const url = `http://localhost:5000/${submission.file_path.replace(/\\/g, '/')}`;
                                window.open(url, '_blank');
                              }}
                            >
                              <ReportIcon />
                            </IconButton>
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
      )}

      {/* Details Report Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssessmentIcon />
            <Typography variant="h6" fontWeight={800}>Integrity Audit Report</Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}><CancelIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {details ? (
            <Box>
              <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
                <Box sx={{ flex: 1, p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={800}>STUDENT INFO</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{details.submission.student_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{details.submission.student_email}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Roll: <b>{details.submission.student_roll_number || 'N/A'}</b></Typography>
                </Box>
                <Box sx={{ flex: 1, p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={800}>MATCH INDEX</Typography>
                  <Typography variant="h3" fontWeight={900} color={details.submission.similarity_score > 30 ? 'error.main' : 'success.main'} sx={{ mt: 1 }}>
                    {details.submission.similarity_score ?? 0}%
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>Duplicate Content Detected</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2, borderBottom: '2px solid #f1f5f9', pb: 1 }}>
                  Hybrid Analysis Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2, textAlign: 'center', border: '1px solid #bae6fd' }}>
                      <Typography variant="caption" fontWeight={800} color="primary">SHINGLES</Typography>
                      <Typography variant="h5" fontWeight={900}>{details.submission.shingle_score ?? 0}%</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Direct Copy</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ p: 2, bgcolor: '#f5f3ff', borderRadius: 2, textAlign: 'center', border: '1px solid #ddd6fe' }}>
                      <Typography variant="caption" fontWeight={800} color="secondary">COSINE</Typography>
                      <Typography variant="h5" fontWeight={900}>{details.submission.cosine_score ?? 0}%</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Paraphrase</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ p: 2, bgcolor: '#ecfdf5', borderRadius: 2, textAlign: 'center', border: '1px solid #a7f3d0' }}>
                      <Typography variant="caption" fontWeight={800} color="success.main">BERT</Typography>
                      <Typography variant="h5" fontWeight={900}>{details.submission.semantic_score ?? 0}%</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Semantic</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ p: 2, bgcolor: '#fff7ed', borderRadius: 2, textAlign: 'center', border: '1px solid #ffedd5' }}>
                      <Typography variant="caption" fontWeight={800} color="warning.main">HYBRID</Typography>
                      <Typography variant="h5" fontWeight={900} color="warning.dark">{details.submission.hybrid_score ?? 0}%</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Final Weighted</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 4, p: 2.5, bgcolor: '#fdf2f8', borderRadius: 3, border: '1px solid #fce7f3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#9d174d" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PsychologyIcon fontSize="small" /> AI CONTENT DETECTION
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Probability of machine-generated text</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight={900} color="#be185d">{details.submission.ai_score ?? 0}%</Typography>
                  <Chip label={details.submission.ai_score > 50 ? "High Risk" : "Low Risk"} size="small" color={details.submission.ai_score > 50 ? "error" : "success"} sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CompareIcon />}
                onClick={() => setComparisonOpen(true)}
                sx={{
                  mb: 4,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 900,
                  fontSize: '1rem',
                  background: 'linear-gradient(45deg, #1e293b 30%, #334155 90%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0f172a 30%, #1e293b 90%)',
                  }
                }}
              >
                VIEW VISUAL HIGHLIGHTING & COMPARISON
              </Button>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">WRITING QUALITY ISSUE</Typography>
                    <Typography variant="h6" fontWeight={800}>{details.submission.plagiarism_score ?? 0}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">ORIGINALITY</Typography>
                    <Typography variant="h6" fontWeight={800}>{details.submission.originality_score ?? 100}%</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 4, p: 3, bgcolor: '#f1f5f9', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GradIcon fontSize="small" /> Evaluation & Grading
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Assigned Marks"
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    size="small"
                    sx={{ bgcolor: 'white', width: 200 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleUpdateScore}
                    disabled={grading}
                    sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}
                  >
                    {grading ? <CircularProgress size={24} color="inherit" /> : 'Apply Grade'}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={details.submission.status === 'accepted'}
                  sx={{ flex: 1, borderRadius: 2, py: 1.5, fontWeight: 800 }}
                >
                  Confirm Acceptance
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={details.submission.status === 'rejected'}
                  sx={{ flex: 1, borderRadius: 2, py: 1.5, fontWeight: 800 }}
                >
                  Flag Submission
                </Button>
              </Box>

              {details.matches?.length > 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom sx={{ borderBottom: '2px solid #f1f5f9', pb: 1 }}>
                    Plagiarism Breakdown
                  </Typography>
                  {details.matches.map((match, idx) => (
                    <Paper key={idx} sx={{ p: 2, mt: 2, bgcolor: '#fff6f6', borderLeft: '4px solid #ef4444' }}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {match.matched_source_type === 'external' ? 'Web Source Found' : `Match with student: ${match.matched_student_name}`}
                      </Typography>
                      {match.external_source_url && (
                        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Source URL: {match.external_source_url}</Typography>
                      )}
                      <Typography variant="h6" fontWeight={900} color="error.main">{match.similarity_percentage}% MATCH</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={40} />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Synthesizing audit data...</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection/Flag Reason Dialog */}
      <Dialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Reason for Flagging Submission</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Provide feedback to the student about why this submission was flagged. This will appear on their dashboard.
          </Typography>
          <TextField
            fullWidth multiline rows={4}
            label="Audit Feedback"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Excessive similarity detected. Please rework the section on..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRejectionDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmReject} sx={{ fontWeight: 800, borderRadius: 2 }}>Confirm Flag</Button>
        </DialogActions>
      </Dialog>

      {/* Roll Configuration Dialog */}
      <Dialog
        open={autoAssignOpen}
        onClose={() => setAutoAssignOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Sequence configuration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Roll ID Prefix"
            value={rollPrefix}
            onChange={(e) => setRollPrefix(e.target.value)}
            helperText="Applies alphabetical sequencing (001, 002, etc.)"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAutoAssignOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAutoAssign} disabled={assigning} sx={{ fontWeight: 800, borderRadius: 2 }}>
            {assigning ? <CircularProgress size={24} /> : 'Process Roll IDs'}
          </Button>
        </DialogActions>
      </Dialog>

      <ComparisonModal
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        submission={details?.submission}
      />
    </Box>
  );
};

export default ViewSubmissions;





