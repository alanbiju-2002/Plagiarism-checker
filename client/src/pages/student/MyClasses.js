import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
} from '@mui/material';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Classes</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Join Class
        </Button>
      </Box>

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

      <Grid container spacing={3}>
        {classes.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No classes found. Join a class to get started!
              </Typography>
            </Paper>
          </Grid>
        ) : (
          classes.map((classItem) => (
            <Grid item xs={12} md={6} lg={4} key={classItem.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {classItem.class_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Code: {classItem.class_code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Teacher: {classItem.teacher_name}
                  </Typography>
                  {classItem.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {classItem.description}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" href={`/student/assignments?classId=${classItem.id}`}>
                    View Assignments
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Join Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Code"
            fullWidth
            variant="outlined"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleJoinClass} variant="contained">
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyClasses;




