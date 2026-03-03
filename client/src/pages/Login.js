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
  CircularProgress,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (!result.success) {
        setError(result.message || 'Login failed');
        return;
      }

      const role = result.user?.role;

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher');
      } else if (role === 'student') {
        navigate('/student');
      } else {
        setError('User role not assigned. Contact admin.');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      {/* Left panel – Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: { md: '45%', lg: '40%' },
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: 'white',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <SchoolRoundedIcon sx={{ fontSize: 80, mb: 3, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }} />
          <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: '-0.05em' }}>
            Campus Guard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 320, lineHeight: 1.6 }}>
            The most advanced plagiarism detection and assignment management system for modern campuses.
          </Typography>
        </Box>
      </Box>

      {/* Right panel – form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Container component="main" maxWidth="xs" disableGutters>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Mobile branding */}
            <Box sx={{ display: { md: 'none' }, textAlign: 'center', mb: 4 }}>
              <SchoolRoundedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={800} color="primary.main">
                Campus Guard
              </Typography>
            </Box>

            <Paper
              className="glass-morphism"
              elevation={0}
              sx={{
                padding: { xs: 4, sm: 5 },
                width: '100%',
                borderRadius: 4,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.8)',
              }}
            >
              <Typography component="h1" variant="h4" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                Welcome back
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Enter your credentials to access your dashboard.
              </Typography>

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

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username or Email"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / teacher / student"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 1 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
                    Forgot password?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 1, mb: 3, py: 1.8, fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In Now'}
                </Button>

                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                      <Typography component="span" variant="body2" color="primary" fontWeight={700}>
                        Join the community
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </Box>

  );
};

export default Login;
