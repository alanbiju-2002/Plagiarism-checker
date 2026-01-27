import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import api from '../../utils/api';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/api/admin/statistics');
      setStats(response.data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats?.total_students || 0, color: '#1976d2' },
    { title: 'Total Teachers', value: stats?.total_teachers || 0, color: '#9c27b0' },
    { title: 'Total Classes', value: stats?.total_classes || 0, color: '#2e7d32' },
    { title: 'Total Assignments', value: stats?.total_assignments || 0, color: '#ed6c02' },
    { title: 'Total Submissions', value: stats?.total_submissions || 0, color: '#0288d1' },
    { title: 'Rejected Submissions', value: stats?.rejected_submissions || 0, color: '#d32f2f' },
    {
      title: 'Average Similarity',
      value: stats?.avg_similarity ? `${parseFloat(stats.avg_similarity).toFixed(2)}%` : '0%',
      color: '#7b1fa2',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Statistics Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h3" sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Statistics;




