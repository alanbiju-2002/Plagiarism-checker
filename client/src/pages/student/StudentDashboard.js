import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
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
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  ExitToApp as LogoutIcon,
  AccountCircle,
  SchoolRounded as SchoolIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import MyClasses from './MyClasses';
import MyAssignments from './MyAssignments';
import MySubmissions from './MySubmissions';

const drawerWidth = 260;

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { text: 'My Classes', icon: <ClassIcon />, path: '/student/classes' },
    { text: 'Assignments', icon: <AssignmentIcon />, path: '/student/assignments' },
    { text: 'My Submissions', icon: <DashboardIcon />, path: '/student/submissions' },
  ];
  const selectedIndex = menuItems.findIndex((item) => location.pathname === item.path);

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { sx: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <SchoolIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
              Campus Guard
            </Typography>
            <Chip
              label="Student"
              size="small"
              color="primary"
              variant="soft"
              sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: '#eef2ff', color: '#4f46e5' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }}>
              {user?.full_name}
            </Typography>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                size="small"
                sx={{
                  p: 0.5,
                  border: '2px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.light' }
                }}
              >
                {user?.profile_picture ? (
                  <Avatar
                    src={`http://localhost:5000/uploads/${user.profile_picture}`}
                    sx={{ width: 40, height: 40 }}
                  />
                ) : (
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 700 }}>
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  borderRadius: 3,
                  minWidth: 180,
                  p: 1,
                  border: '1px solid #f1f5f9',
                }
              }}
            >
              <MenuItem onClick={handleEditProfile} sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Edit Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
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
            bgcolor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            pt: { xs: 8, sm: 9 },
          },
        }}
      >
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List sx={{ px: 1.5 }}>
            <Typography variant="overline" sx={{ px: 2, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em' }}>
              Navigation
            </Typography>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => navigate(item.path)}
                  component={Link}
                  to={item.path}
                >
                  <ListItemIcon sx={{ minWidth: 42, color: selectedIndex === index ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: selectedIndex === index ? 700 : 500
                    }}
                  />
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
          p: { xs: 2.5, sm: 4 },
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ mb: 2 }} />
        <Container maxWidth="xl" disableGutters>
          <Routes>
            <Route path="classes" element={<MyClasses />} />
            <Route path="assignments" element={<MyAssignments />} />
            <Route path="submissions" element={<MySubmissions />} />
            <Route path="*" element={<MyClasses />} />
          </Routes>
        </Container>
      </Box>
    </Box>

  );
};

export default StudentDashboard;





