import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
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
      setMessage({ type: 'success', text: 'User approved successfully' });
      fetchPendingUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to approve user' });
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.post(`/api/admin/reject-user/${userId}`);
      setMessage({ type: 'success', text: 'User rejected successfully' });
      fetchPendingUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reject user' });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pending User Approvals
      </Typography>

      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Registered At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No pending users
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleApprove(user.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleReject(user.id)}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PendingUsers;




