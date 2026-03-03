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
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SchoolRoundedIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Join Campus Guard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account to start managing assignments.
            </Typography>
          </Box>

          <Paper
            className="glass-morphism"
            elevation={0}
            sx={{
              padding: { xs: 4, sm: 6 },
              width: '100%',
              borderRadius: 4,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          >
            {error && (
              <Alert
                severity="error"
                variant="outlined"
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity="success"
                variant="filled"
                sx={{ mb: 3, borderRadius: 2 }}
              >
                Welcome aboard! Redirecting you to login...
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    bgcolor: 'white',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid',
                    borderColor: 'primary.light',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    position: 'relative',
                  }}
                >
                  {preview ? (
                    <img src={preview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      No Photo
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{ borderRadius: 8, px: 3 }}
                >
                  Change Profile Picture
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
                <TextField
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <TextField
                  required
                  fullWidth
                  select
                  label="I am a..."
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  
                </TextField>

                {formData.role === 'student' && (
                  <TextField
                    required
                    fullWidth
                    label="Roll Number"
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleChange}
                    sx={{ gridColumn: { sm: 'span 2' } }}
                  />
                )}

                <TextField
                  required
                  fullWidth
                  label="Secure Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{ gridColumn: { sm: 'span 2' } }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 4, mb: 3, py: 1.8, fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create My Account'}
              </Button>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography component="span" variant="body2" color="primary" fontWeight={700}>
                      Sign in here
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>

  );
};

export default Register;





