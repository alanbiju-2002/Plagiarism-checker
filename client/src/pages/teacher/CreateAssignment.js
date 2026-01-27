import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import api from '../../utils/api';

const CreateAssignment = () => {
  const [searchParams] = useSearchParams();
  const classIdParam = searchParams.get('classId');
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: classIdParam || '',
    due_date: '',
    max_score: 100,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/teacher/classes');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/teacher/assignments', formData);
      setSuccess('Assignment created successfully!');
      setTimeout(() => {
        navigate('/teacher/classes');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  if (loadingClasses) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create Assignment
      </Typography>

      <Paper sx={{ p: 3, mt: 3, maxWidth: 600 }}>
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

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            select
            label="Class"
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
          >
            {classes.map((classItem) => (
              <MenuItem key={classItem.id} value={classItem.id}>
                {classItem.class_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Due Date"
            name="due_date"
            type="datetime-local"
            value={formData.due_date}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Max Score"
            name="max_score"
            type="number"
            value={formData.max_score}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Assignment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateAssignment;




