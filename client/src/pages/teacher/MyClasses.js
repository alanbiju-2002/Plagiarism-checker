import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
// PeopleIcon removed (unused)
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
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          My Classes
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearAllSubmissions}
          disabled={classes.length === 0}
        >
          Clear All My Submissions
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {classes.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No classes found. Create a class to get started!
              </Typography>
            </Paper>
          </Grid>
        ) : (
          classes.map((classItem) => (
            <Grid item xs={12} md={6} lg={4} key={classItem.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {classItem.class_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Code: {classItem.class_code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students: {classItem.student_count || 0}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewStudents(classItem)}>
                    Manage Students
                  </Button>
                  <Button
                    size="small"
                    href={`/teacher/create-assignment?classId=${classItem.id}`}
                  >
                    Create Assignment
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleClearClassSubmissions(classItem)}
                  >
                    Clear Submissions
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Students in {selectedClass?.class_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Student ID"
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              size="small"
              sx={{ mr: 2 }}
            />
            <Button variant="contained" onClick={handleAddStudent}>
              Add Student
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Joined At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {new Date(student.joined_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyClasses;




