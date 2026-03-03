import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Avatar,
    InputAdornment
} from '@mui/material';
import {
    PhotoCamera,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Badge as BadgeIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        roll_number: '',
    });
    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                password: '',
                full_name: user.full_name || '',
                roll_number: user.roll_number || '',
            });
            if (user.profile_picture) {
                setPreview(`http://localhost:5000/uploads/${user.profile_picture}`);
            }
        }
    }, [user]);

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
        setSuccess('');
        setLoading(true);

        const data = new FormData();
        data.append('full_name', formData.full_name);
        data.append('email', formData.email);

        if (formData.password) {
            data.append('password', formData.password);
        }

        if (user.role === 'student') {
            data.append('roll_number', formData.roll_number);
        }

        if (profilePic) {
            data.append('profile_picture', profilePic);
        }

        const result = await updateProfile(data);

        if (result.success) {
            setSuccess('Profile configuration updated.');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 2
        }}>
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        borderRadius: 6,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'
                    }}
                >
                    <Typography variant="h4" align="center" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 1, color: 'primary.dark' }}>
                        Identity Management
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
                        Keep your professional profile data accurate and verified.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={preview}
                                    sx={{
                                        width: 130,
                                        height: 130,
                                        border: '6px solid white',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        fontSize: '3rem',
                                        fontWeight: 800,
                                        bgcolor: 'primary.light'
                                    }}
                                >
                                    {!preview && user?.full_name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="primary"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 5,
                                        right: 5,
                                        minWidth: 'auto',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '12px',
                                        boxShadow: '0 5px 15px rgba(99, 102, 241, 0.4)'
                                    }}
                                >
                                    <PhotoCamera fontSize="small" />
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                fullWidth
                                label="System ID (Read-only)"
                                value={formData.username}
                                disabled
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } }}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Full Legal Name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment>,
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Verified Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><EmailIcon color="primary" /></InputAdornment>,
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />

                            {user?.role === 'student' && (
                                <TextField
                                    fullWidth
                                    label="Academic Roll Number"
                                    name="roll_number"
                                    value={formData.roll_number}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><BadgeIcon color="primary" /></InputAdornment>,
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            )}

                            <TextField
                                fullWidth
                                label="Security Credential (New)"
                                name="password"
                                type="password"
                                placeholder="Leave blank to retain current"
                                value={formData.password}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><LockIcon color="primary" /></InputAdornment>,
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mt: 5 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="inherit"
                                startIcon={<CancelIcon />}
                                onClick={() => navigate(-1)}
                                sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                startIcon={loading ? null : <SaveIcon />}
                                sx={{
                                    borderRadius: 3,
                                    py: 1.5,
                                    fontWeight: 800,
                                    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Apply Sync'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default EditProfile;
