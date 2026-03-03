import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Avatar
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  HowToReg as ApprovalIcon,
  PersonOutline as UserIcon,
  EmailOutlined as EmailIcon,
  Schedule as TimeIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/api/admin/pending-users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/api/admin/approve-user/${userId}`);
      setMessage({ type: 'success', text: 'Credentials verified successfully' });
      fetchPendingUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Approval failed' });
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.post(`/api/admin/reject-user/${userId}`);
      setMessage({ type: 'success', text: 'Application declined' });
      fetchPendingUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Rejection failed' });
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case 'admin': return { color: 'error', label: 'Admin', bg: '#fff1f2' };
      case 'teacher': return { color: 'primary', label: 'Faculty', bg: '#eff6ff' };
      case 'student': return { color: 'success', label: 'Student', bg: '#f0fdf4' };
      default: return { color: 'default', label: role, bg: '#f8fafc' };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress thickness={5} sx={{ color: 'secondary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 1, color: 'secondary.dark' }}>
          Verification Queue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and authorize pending enrollment applications for the platform.
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}><UserIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} /> APPLICATION</TableCell>
              <TableCell sx={{ fontWeight: 800 }}><EmailIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} /> EMAIL</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>ROLE</TableCell>
              <TableCell sx={{ fontWeight: 800 }}><TimeIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} /> REGISTERED</TableCell>
              <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>AUTHORIZATION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <VerifiedIcon sx={{ fontSize: 64, color: 'success.light', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={700}>
                    Registry is Balanced
                  </Typography>
                  <Typography variant="body2" color="text.disabled">No pending applications at this time.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const roleConfig = getRoleConfig(user.role);
                return (
                  <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', fontWeight: 800 }}>{user.full_name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>{user.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">@{user.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell color="text.secondary">{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={roleConfig.label.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: roleConfig.bg,
                          color: `${roleConfig.color}.main`,
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell color="text.secondary">
                      {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => handleApprove(user.id)}
                          sx={{ borderRadius: 2, fontWeight: 800, px: 2 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          onClick={() => handleReject(user.id)}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Decline
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PendingUsers;





