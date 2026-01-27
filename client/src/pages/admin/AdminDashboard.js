import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import PendingUsers from './PendingUsers';
import AllUsers from './AllUsers';
import ScoreReports from './ScoreReports';
import Statistics from './Statistics';

const drawerWidth = 240;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { text: 'Statistics', icon: <DashboardIcon />, path: '/admin/statistics' },
    { text: 'Pending Users', icon: <PeopleIcon />, path: '/admin/pending-users' },
    { text: 'All Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Score Reports', icon: <AssessmentIcon />, path: '/admin/scores' },
  ];

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    handleClose();
    navigate('/edit-profile');
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard - {user?.full_name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
              >
                {user?.profile_picture ? (
                  <Avatar
                    src={`http://localhost:5000/uploads/${user.profile_picture}`}
                    sx={{ width: 40, height: 40, border: '2px solid #fff' }}
                  />
                ) : (
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main', border: '2px solid #fff' }}>
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleEditProfile}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Edit Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => {
                    setSelectedIndex(index);
                    navigate(item.path);
                  }}
                  component={Link}
                  to={item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Routes>
            <Route path="statistics" element={<Statistics />} />
            <Route path="pending-users" element={<PendingUsers />} />
            <Route path="users" element={<AllUsers />} />
            <Route path="scores" element={<ScoreReports />} />
            <Route path="*" element={<Statistics />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;




