import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip
} from '@mui/material';
import {
  AssessmentOutlined as ReportIcon,
  Search as SearchIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Percent as PercentIcon,
  History as HistoryIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
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

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text.disabled';
    if (score > 50) return 'error.main';
    if (score > 20) return 'warning.main';
    return 'success.main';
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 1, color: 'secondary.dark' }}>
            Integrity Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive audit of student performance and authenticity metrics across all departments.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="soft" startIcon={<ChartIcon />} sx={{ borderRadius: 2, fontWeight: 700 }}>Export Data</Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        placeholder="Filter by identities, assignments, or faculty codes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            bgcolor: 'white',
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: 'primary.main' }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}><PersonIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> ENTITY</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}><AssignmentIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> ASSIGNMENT</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}><ClassIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> CLASS</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', textAlign: 'center' }}><PercentIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> SIMILARITY</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', textAlign: 'center' }}>ORIGINALITY</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}><HistoryIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> AUDIT LOG</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <ReportIcon sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={700}>Log Empty</Typography>
                  <Typography variant="body2" color="text.disabled">No matching telemetry data found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredScores.map((score) => (
                <TableRow key={score.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800}>{score.student_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{score.student_email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary.main">{score.assignment_title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={score.class_name} size="small" sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: '#f1f5f9' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={900} sx={{ color: getScoreColor(score.similarity_score) }}>
                      {score.similarity_score != null ? `${score.similarity_score}%` : '---'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={900} sx={{ color: (score.similarity_score != null ? Math.max(0, 100 - score.similarity_score) : score.originality_score) > 80 ? 'success.main' : 'text.primary' }}>
                      {score.similarity_score != null ? `${Math.max(0, 100 - score.similarity_score)}%` : (score.originality_score != null ? `${score.originality_score}%` : '---')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        <b>Submitted:</b> {new Date(score.submitted_at).toLocaleDateString()}
                      </Typography>
                      {score.checked_at && (
                        <Typography variant="caption" display="block" color="success.main" fontWeight={600}>
                          <b>Verified:</b> {new Date(score.checked_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
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





