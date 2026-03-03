import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Class as ClassIcon,
  Code as CodeIcon,
  Description as DescIcon,
  Add as AddIcon,
  ChevronLeft as BackIcon
} from '@mui/icons-material';
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
      setSuccess('Educational space initialized!');
      setTimeout(() => {
        navigate('/teacher/classes');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to initialize class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pt: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/teacher/classes')}
        sx={{ mb: 4, fontWeight: 700, color: 'text.secondary' }}
      >
        Back to Faculty Suite
      </Button>

      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.03em', color: 'primary.dark', mb: 1 }}>
          Establish New Class
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Create a digital repository for your student's research and submissions.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 6,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <TextField
              required
              fullWidth
              label="Course Nomenclature"
              name="class_name"
              placeholder="e.g. Advanced Cryptography"
              value={formData.class_name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ClassIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField
              required
              fullWidth
              label="Authorization Code"
              name="class_code"
              placeholder="UNIQUE-CODE"
              value={formData.class_code}
              onChange={handleChange}
              helperText="Students will use this to join your class"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CodeIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Box>

          <TextField
            fullWidth
            label="Syllabus & Synopsis"
            name="description"
            multiline
            rows={5}
            placeholder="Outline the learning objectives and expectations..."
            value={formData.description}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <DescIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 5, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? null : <AddIcon />}
            sx={{
              py: 2,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 800,
              boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)',
              '&:hover': {
                boxShadow: '0 15px 30px rgba(79, 70, 229, 0.3)',
              }
            }}
          >
            {loading ? <CircularProgress size={28} color="inherit" /> : 'Deploy Class Repository'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateClass;





