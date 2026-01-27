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
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../../utils/api';

const ScoreReports = () => {
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = scores.filter(
        (score) =>
          score.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          score.assignment_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          score.class_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredScores(filtered);
    } else {
      setFilteredScores(scores);
    }
  }, [searchTerm, scores]);

  const fetchScores = async () => {
    try {
      const response = await api.get('/api/admin/scores');
      setScores(response.data.scores);
      setFilteredScores(response.data.scores);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status, similarityScore) => {
    if (status === 'rejected' || similarityScore > 50) return 'error';
    if (status === 'checked') return 'success';
    return 'default';
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
        Score Reports
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by student name, assignment, or class..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mt: 3, mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Student Email</TableCell>
              <TableCell>Assignment</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Similarity Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Checked At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No scores found
                </TableCell>
              </TableRow>
            ) : (
              filteredScores.map((score) => (
                <TableRow key={score.id}>
                  <TableCell>{score.student_name}</TableCell>
                  <TableCell>{score.student_email}</TableCell>
                  <TableCell>{score.assignment_title}</TableCell>
                  <TableCell>{score.class_name}</TableCell>
                  <TableCell>
                    {score.similarity_score !== null
                      ? `${score.similarity_score}%`
                      : 'Pending'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={score.status}
                      color={getStatusColor(score.status, score.similarity_score)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(score.submitted_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {score.checked_at
                      ? new Date(score.checked_at).toLocaleString()
                      : '-'}
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

export default ScoreReports;




