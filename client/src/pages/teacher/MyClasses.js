import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress
} from '@mui/material';
import {
  Class as ClassIcon,
  People as PeopleIcon,
  AddCircle as AddIcon,
  DeleteSweep as ClearIcon,
  PersonAdd as AddUserIcon,
  Assignment as AssignIcon,
  HistoryEdu as HistoryIcon,
  DeleteForever as DeleteIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/teacher/classes');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async (classItem) => {
    setSelectedClass(classItem);
    setOpen(true);
    try {
      const response = await api.get(`/api/teacher/classes/${classItem.id}/students`);
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddStudent = async () => {
    if (!studentId) return;
    try {
      await api.post(`/api/teacher/classes/${selectedClass.id}/students`, {
        student_id: parseInt(studentId),
      });
      setStudentId('');
      handleViewStudents(selectedClass);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleClearClassSubmissions = async (classItem) => {
    if (window.confirm(`Are you sure you want to clear ALL submissions for class ${classItem.class_name}? This cannot be undone.`)) {
      try {
        const response = await api.delete(`/api/teacher/classes/${classItem.id}/submissions/clear`);
        alert(response.data.message);
        fetchClasses();
      } catch (error) {
        console.error('Error clearing class submissions:', error);
        alert(error.response?.data?.message || 'Failed to clear submissions');
      }
    }
  };

  const handleDeleteClass = async (classItem) => {
    if (window.confirm(`Are you sure you want to delete the class "${classItem.class_name}"? This will permanently delete all assignments, submissions, and enrollment data. This action cannot be undone.`)) {
      try {
        const response = await api.delete(`/api/teacher/classes/${classItem.id}`);
        alert(response.data.message);
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        alert(error.response?.data?.message || 'Failed to delete class');
      }
    }
  };

  const handleClearAllSubmissions = async () => {
    if (window.confirm('Are you sure you want to clear ALL submissions across ALL your classes? This cannot be undone.')) {
      try {
        const response = await api.delete('/api/teacher/submissions/all/clear');
        alert(response.data.message);
        fetchClasses();
      } catch (error) {
        console.error('Error clearing all submissions:', error);
        alert(error.response?.data?.message || 'Failed to clear submissions');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress thickness={5} sx={{ color: 'secondary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.025em' }}>
            Faculty Classrooms
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your courses, student enrollments, and submissions.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={handleClearAllSubmissions}
            disabled={classes.length === 0}
            sx={{ borderRadius: 3, fontWeight: 700 }}
          >
            Clear Global Data
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            href="/teacher/create-class"
            sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
          >
            New Classroom
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {classes.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 4,
              border: '2px dashed #e2e8f0',
              bgcolor: 'transparent'
            }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                No classes created
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Start by creating your first digital classroom for students.
              </Typography>
              <Button href="/teacher/create-class" variant="contained" sx={{ borderRadius: 10 }}>
                Initial Setup
              </Button>
            </Paper>
          </Grid>
        ) : (
          classes.map((classItem) => (
            <Grid item xs={12} md={6} lg={4} key={classItem.id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)',
                }
              }}>
                <Box sx={{ p: 2, bgcolor: 'secondary.light', height: 10 }} />
                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                    {classItem.class_name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                      JOIN CODE:
                    </Typography>
                    <Typography variant="body1" fontWeight={800} color="primary.main" sx={{ letterSpacing: '0.1em' }}>
                      {classItem.class_code}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                    <PeopleIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {classItem.student_count || 0} Students Enrolled
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 3, pt: 0 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="soft"
                        startIcon={<PeopleIcon fontSize="small" />}
                        onClick={() => handleViewStudents(classItem)}
                        sx={{ fontSize: '0.8rem', fontWeight: 700, borderRadius: 2, bgcolor: '#f1f5f9' }}
                      >
                        Students
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="soft"
                        startIcon={<AssignIcon fontSize="small" />}
                        href={`/teacher/create-assignment?classId=${classItem.id}`}
                        sx={{ fontSize: '0.8rem', fontWeight: 700, borderRadius: 2, bgcolor: '#f1f5f9' }}
                      >
                        Assign
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<ClearIcon fontSize="small" />}
                        onClick={() => handleClearClassSubmissions(classItem)}
                        sx={{ mt: 1, borderRadius: 2, borderStyle: 'dashed' }}
                      >
                        Clear Class Logic
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="soft"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => handleDeleteClass(classItem)}
                        sx={{ mt: 1, borderRadius: 2, fontWeight: 700, bgcolor: '#fee2e2', color: '#dc2626' }}
                      >
                        Delete Class
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 2 }}>
          <PeopleIcon color="primary" /> {selectedClass?.class_name} Enrollment
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', gap: 2, bgcolor: '#f8fafc', p: 3, borderRadius: 3 }}>
            <TextField
              placeholder="Enter Student Database ID"
              type="number"
              fullWidth
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              InputProps={{
                startAdornment: <AddUserIcon sx={{ color: 'text.disabled', mr: 1 }} />
              }}
            />
            <Button variant="contained" onClick={handleAddStudent} sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}>
              Add
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>STUDENT NAME</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>EMAIL ADDRESS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ENROLLMENT DATE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} sx={{ '&:hover': { bgcolor: '#fcfcfe' } }}>
                    <TableCell fontWeight={600}>{student.full_name}</TableCell>
                    <TableCell color="text.secondary">{student.email}</TableCell>
                    <TableCell color="text.secondary">
                      {new Date(student.joined_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                      No students enrolled in this classroom.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>Close Roster</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyClasses;





