import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  Description as FileIcon,
  ErrorOutline as ErrorIcon,
  Insights as InsightsIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress thickness={5} size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.total_students || 0,
      color: '#6366f1',
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      bg: '#eef2ff'
    },
    {
      title: 'Total Teachers',
      value: stats?.total_teachers || 0,
      color: '#ec4899',
      icon: <GroupsIcon sx={{ fontSize: 32 }} />,
      bg: '#fdf2f8'
    },
    {
      title: 'Total Classes',
      value: stats?.total_classes || 0,
      color: '#10b981',
      icon: <ClassIcon sx={{ fontSize: 32 }} />,
      bg: '#ecfdf5'
    },
    {
      title: 'Total Assignments',
      value: stats?.total_assignments || 0,
      color: '#f59e0b',
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      bg: '#fffbeb'
    },
    {
      title: 'Total Submissions',
      value: stats?.total_submissions || 0,
      color: '#3b82f6',
      icon: <FileIcon sx={{ fontSize: 32 }} />,
      bg: '#eff6ff'
    },
    {
      title: 'Flagged Reports',
      value: stats?.rejected_submissions || 0,
      color: '#ef4444',
      icon: <ErrorIcon sx={{ fontSize: 32 }} />,
      bg: '#fef2f2'
    },
    {
      title: 'Avg. Similarity',
      value: stats?.avg_similarity ? `${parseFloat(stats.avg_similarity).toFixed(1)}%` : '0%',
      color: '#8b5cf6',
      icon: <InsightsIcon sx={{ fontSize: 32 }} />,
      bg: '#f5f3ff'
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
          System Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time metrics and platform engagement statistics.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    bgcolor: card.bg,
                    color: card.color,
                    mb: 4
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
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





