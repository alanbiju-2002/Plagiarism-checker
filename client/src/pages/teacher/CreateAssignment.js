import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Assignment as AssignIcon,
  Class as ClassIcon,
  Event as DateIcon,
  Score as ScoreIcon,
  Description as DescIcon,
  Add as AddIcon,
  ChevronLeft as BackIcon
} from '@mui/icons-material';
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
      setSuccess('Academic challenge published!');
      setTimeout(() => {
        navigate('/teacher/classes');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to publish assignment');
    } finally {
      setLoading(false);
    }
  };

  if (loadingClasses) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress thickness={5} size={50} sx={{ color: 'secondary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pt: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/teacher/classes')}
        sx={{ mb: 4, fontWeight: 700, color: 'text.secondary' }}
      >
        Faculty Dashboard
      </Button>

      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.03em', color: 'primary.dark', mb: 1 }}>
          Create Assignment
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Define researchers' objectives, set key milestones, and establish evaluation criteria.
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.5fr 1fr' }, gap: 4, mb: 4 }}>
            <Box>
              <TextField
                required
                fullWidth
                label="Assignment Title"
                name="title"
                placeholder="e.g. Final Research Thesis"
                value={formData.title}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                fullWidth
                label="Instructions & Requirements"
                name="description"
                multiline
                rows={8}
                placeholder="Detail the scope of work and citation requirements..."
                value={formData.description}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                required
                fullWidth
                select
                label="Target Class"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ClassIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              >
                {classes.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id} sx={{ fontWeight: 600 }}>
                    {classItem.class_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Submission Deadline"
                name="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />

              <TextField
                fullWidth
                label="Maximum Points"
                name="max_score"
                type="number"
                value={formData.max_score}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScoreIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Box>
          </Box>

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
            {loading ? <CircularProgress size={28} color="inherit" /> : 'Publish Assignment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateAssignment;





