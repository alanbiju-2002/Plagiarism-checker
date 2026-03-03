import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  Person as PersonIcon,
  Shield as AdminIcon,
  School as TeacherIcon,
  Face as StudentIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/admin/users/${userToDelete.id}`);
      setMessage({ type: 'success', text: 'Identity purged from system' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Purge failed' });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', color: 'error', icon: <AdminIcon sx={{ fontSize: 16 }} />, bg: '#fff1f2' };
      case 'teacher': return { label: 'Faculty', color: 'primary', icon: <TeacherIcon sx={{ fontSize: 16 }} />, bg: '#eff6ff' };
      case 'student': return { label: 'Student', color: 'success', icon: <StudentIcon sx={{ fontSize: 16 }} />, bg: '#f0fdf4' };
      default: return { label: role, color: 'default', icon: <PersonIcon sx={{ fontSize: 16 }} />, bg: '#f8fafc' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { color: 'success', label: 'Verified', bg: '#f0fdf4' };
      case 'pending': return { color: 'warning', label: 'Awaiting', bg: '#fffbeb' };
      case 'rejected': return { color: 'error', label: 'Suspended', bg: '#fef2f2' };
      default: return { color: 'default', label: status, bg: '#f8fafc' };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress thickness={5} size={50} sx={{ color: 'secondary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 1, color: 'secondary.dark' }}>
            Identity Repository
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Oversee all registered entities and manage system access permissions.
          </Typography>
        </Box>
        <Button
          variant="soft"
          startIcon={<SearchIcon />}
          sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#f1f5f9' }}
        >
          Registry Search
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>NAME / IDENTITY</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>ROLE</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>JOINED ON</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', textAlign: 'right' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const statusInfo = getStatusColor(user.status);
              return (
                <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={user.profile_picture ? `http://localhost:5000/uploads/${user.profile_picture}` : ''}
                        sx={{ width: 40, height: 40, border: '2px solid #e2e8f0' }}
                      >
                        {user.full_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>{user.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">@{user.username} • {user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={roleInfo.icon}
                      label={roleInfo.label.toUpperCase()}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: roleInfo.bg,
                        color: `${roleInfo.color}.main`,
                        borderRadius: 1.5,
                        '& .MuiChip-icon': { color: 'inherit' }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusInfo.label}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: statusInfo.bg,
                        color: `${statusInfo.color}.main`,
                        borderRadius: 1
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleDeleteClick(user)} sx={{ color: 'error.light', '&:hover': { bgcolor: '#fef2f2', color: 'error.main' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small"><MoreIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 3 }}>
          Revoke Access
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you certain about removing <b>{userToDelete?.full_name}</b>?
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 3, border: '1px solid #fecaca' }}>
            <Typography variant="caption" color="error.main" fontWeight={700}>
              CRITICAL: This will terminate all associated class data, assignments, and audit records.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>Retain User</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}>
            Purge Identity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllUsers;



