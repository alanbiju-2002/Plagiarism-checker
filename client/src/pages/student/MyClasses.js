import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Class as ClassIcon,
  Person as PersonIcon,
  Key as KeyIcon,
  Add as AddIcon,
  School as SchoolIcon,
  ExitToApp as LeaveIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/student/classes');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async () => {
    setError('');
    setSuccess('');
    try {
      await api.post('/api/student/classes/join', { class_code: classCode });
      setSuccess('Successfully joined class!');
      setOpen(false);
      setClassCode('');
      fetchClasses();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join class');
    }
  };

  const handleLeaveClass = async (classItem) => {
    if (window.confirm(`Are you sure you want to leave the class "${classItem.class_name}"?`)) {
      try {
        await api.delete(`/api/student/classes/${classItem.id}/leave`);
        setSuccess('Successfully left the class');
        fetchClasses();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to leave class');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress thickness={5} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.025em' }}>
            My Enrolled Classes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your current academic courses.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 3, px: 3, py: 1.5, fontSize: '0.95rem' }}
        >
          Join New Class
        </Button>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" variant="filled" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {classes.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 4,
              border: '2px dashed #e2e8f0',
              bgcolor: 'transparent'
            }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                No active classes
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                You haven't joined any classes yet. Join code from your faculty is needed.
              </Typography>
              <Button variant="outlined" color="primary" onClick={() => setOpen(true)} sx={{ borderRadius: 10 }}>
                Enter Join Code
              </Button>
            </Paper>
          </Grid>
        ) : (
          classes.map((classItem) => (
            <Grid item xs={12} md={6} lg={4} key={classItem.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
                  }
                }}
              >
                <Box sx={{ p: 2, bgcolor: 'primary.light', height: 12 }} />
                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                    {classItem.class_name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <KeyIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Code: {classItem.class_code}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Faculty: {classItem.teacher_name}
                    </Typography>
                  </Box>

                  {classItem.description && (
                    <Typography variant="body2" sx={{
                      color: 'text.primary',
                      mt: 2,
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      "{classItem.description}"
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="soft"
                    href={`/student/assignments?classId=${classItem.id}`}
                    sx={{
                      bgcolor: '#eef2ff',
                      color: '#4f46e5',
                      fontWeight: 700,
                      borderRadius: 2,
                      py: 1,
                      '&:hover': { bgcolor: '#e0e7ff' }
                    }}
                  >
                    Enter Classroom
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<LeaveIcon fontSize="small" />}
                    onClick={() => handleLeaveClass(classItem)}
                    sx={{
                      mt: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      py: 1,
                      borderStyle: 'dashed'
                    }}
                  >
                    Leave Class
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, p: 2, maxWidth: 400 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
          Enroll via Code
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please enter the unique class code provided by your teacher to join the classroom.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Class Join Code"
            fullWidth
            variant="outlined"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            placeholder="e.g. ENG101-ABCD"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button
            onClick={handleJoinClass}
            variant="contained"
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            Enroll Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyClasses;





