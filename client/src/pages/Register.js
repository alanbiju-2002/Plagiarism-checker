import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    roll_number: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('full_name', formData.full_name);
    data.append('role', formData.role);
    if (formData.role === 'student') {
      data.append('roll_number', formData.roll_number);
    }
    if (profilePic) {
      data.append('profile_picture', profilePic);
    }

    const result = await register(data);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Register
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Registration successful! Redirecting to login...
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>

            {/* Profile Picture Upload Area */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  bgcolor: 'grey.200',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #6366f1' // Secondary color
                }}
              >
                {preview ? (
                  <img src={preview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Typography variant="caption" color="text.secondary">No Image</Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                component="label"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            {formData.role === 'student' && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Roll Number"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Box textAlign="center">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;




