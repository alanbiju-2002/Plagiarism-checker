import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            return setError('Please enter your email address');
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/auth/forgot-password', { email });
            setMessage(response.data.message);
            setStep(2); // Move to reset password step
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!otp || !newPassword || !confirmPassword) {
            return setError('Please fill in all fields');
        }

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (newPassword.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            
            setMessage(response.data.message);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please check your OTP.');
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
          {/* Left panel – Branding (matches Login.js) */}
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
                    position: 'relative',
                  }}
                >
                  <IconButton 
                    onClick={() => navigate('/login')}
                    sx={{ position: 'absolute', top: 16, left: 16, color: 'text.secondary' }}
                    aria-label="back to login"
                  >
                    <ArrowBackIcon />
                  </IconButton>

                  <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
                    <LockResetRoundedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography component="h1" variant="h4" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                      {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email and your new password'}
                    </Typography>
                  </Box>
    
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

                  {message && (
                    <Alert
                      severity="success"
                      variant="outlined"
                      sx={{ mb: 3, borderRadius: 2 }}
                    >
                      {message}
                    </Alert>
                  )}
    
                  {step === 1 ? (
                    <Box component="form" onSubmit={handleRequestOtp}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email Address"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        InputProps={{
                          sx: { borderRadius: 2 }
                        }}
                      />
      
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 3, mb: 2, py: 1.8, fontSize: '1rem', borderRadius: 2 }}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Request OTP'}
                      </Button>
                    </Box>
                  ) : (
                    <Box component="form" onSubmit={handleResetPassword}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="OTP Received via Email"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        inputProps={{ maxLength: 6, style: { letterSpacing: '8px', textAlign: 'center', fontSize: '1.25rem' } }}
                        InputProps={{
                          sx: { borderRadius: 2, fontFamily: 'monospace' }
                        }}
                        helperText="Check your spam folder if you don't see the email"
                        FormHelperTextProps={{ sx: { textAlign: 'center' } }}
                      />

                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        inputProps={{ minLength: 6 }}
                        InputProps={{
                          sx: { borderRadius: 2 }
                        }}
                      />

                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        inputProps={{ minLength: 6 }}
                        InputProps={{
                          sx: { borderRadius: 2 }
                        }}
                        sx={{ mb: 3 }}
                      />
      
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mb: 2, py: 1.8, fontSize: '1rem', borderRadius: 2 }}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                      </Button>

                      <Box textAlign="center">
                        <Button
                          variant="text"
                          onClick={() => setStep(1)}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Try a different email
                        </Button>
                      </Box>
                    </Box>
                  )}
    
                </Paper>
              </Box>
            </Container>
          </Box>
        </Box>
      );
};

export default ForgotPassword;
