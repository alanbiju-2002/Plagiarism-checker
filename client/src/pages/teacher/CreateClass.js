import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import api from '../../utils/api';

const CreateClass = () => {
  const [formData, setFormData] = useState({
    class_name: '',
    class_code: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/teacher/classes', formData);
      setSuccess('Class created successfully!');
      setTimeout(() => {
        navigate('/teacher/classes');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Class
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
            label="Class Name"
            name="class_name"
            value={formData.class_name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Class Code"
            name="class_code"
            value={formData.class_code}
            onChange={handleChange}
            helperText="Unique code for students to join"
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Class'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateClass;




