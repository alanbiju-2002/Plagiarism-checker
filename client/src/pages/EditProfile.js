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
    Avatar
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '', // Empty means no change
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
        // Email is editable, but check backend logic
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
            setSuccess('Profile updated successfully!');
            // Optional: Redirect back to dashboard after short delay
            // setTimeout(() => navigate(-1), 1500); 
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                        Edit Profile
                    </Typography>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>

                        {/* Profile Picture Upload Area */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={preview}
                                    alt="Profile"
                                    sx={{ width: 120, height: 120, border: '4px solid #f0f0f0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                                >
                                    {!preview && user?.full_name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="secondary"
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: -10,
                                        minWidth: 'auto',
                                        padding: '6px',
                                        borderRadius: '50%'
                                    }}
                                >
                                    <PhotoCamera fontSize="small" />
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Click icon to change photo
                            </Typography>
                        </Box>

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Username"
                            value={formData.username}
                            disabled
                            helperText="Username cannot be changed"
                        />

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
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        {user?.role === 'student' && (
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Roll Number"
                                name="roll_number"
                                value={formData.roll_number}
                                onChange={handleChange}
                            />
                        )}

                        <TextField
                            margin="normal"
                            fullWidth
                            label="New Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            helperText="Leave blank to keep current password"
                        />

                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="inherit"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default EditProfile;
