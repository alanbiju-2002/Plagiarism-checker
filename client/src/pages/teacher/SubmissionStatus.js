import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    MenuItem,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    CircularProgress,
    Container,
    Breadcrumbs,
    Link as MuiLink,
    Grid
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const SubmissionStatus = () => {
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);

    const fetchClasses = useCallback(async () => {
        try {
            const response = await api.get('/api/teacher/classes');
            setClasses(response.data.classes);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    }, []);

    const fetchAssignments = useCallback(async () => {
        if (!selectedClass) return;
        try {
            const response = await api.get(`/api/teacher/classes/${selectedClass}/assignments`);
            setAssignments(response.data.assignments);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    }, [selectedClass]);

    const fetchStatusList = useCallback(async () => {
        if (!selectedAssignment) return;
        setListLoading(true);
        try {
            const response = await api.get(`/api/teacher/assignments/${selectedAssignment}/status-list`);
            setStatusList(response.data.statusList);
        } catch (error) {
            console.error('Error fetching status list:', error);
        } finally {
            setListLoading(false);
        }
    }, [selectedAssignment]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    useEffect(() => {
        fetchAssignments();
        setSelectedAssignment('');
        setStatusList([]);
    }, [selectedClass, fetchAssignments]);

    useEffect(() => {
        fetchStatusList();
    }, [selectedAssignment, fetchStatusList]);

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                        Submission Tracking
                    </Typography>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                        <MuiLink color="inherit" sx={{ fontWeight: 600, textDecoration: 'none' }}>Faculty Portal</MuiLink>
                        <Typography color="text.primary" sx={{ fontWeight: 700 }}>Submission Status</Typography>
                    </Breadcrumbs>
                </Box>
            </Box>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Select Classroom"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            variant="outlined"
                        >
                            {classes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.class_name} ({c.class_code})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Select Assignment"
                            value={selectedAssignment}
                            onChange={(e) => setSelectedAssignment(e.target.value)}
                            disabled={!selectedClass}
                            variant="outlined"
                        >
                            {assignments.map((a) => (
                                <MenuItem key={a.id} value={a.id}>
                                    {a.title}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {listLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress color="secondary" />
                </Box>
            ) : selectedAssignment && statusList.length > 0 ? (
                <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ROLL #</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>STUDENT NAME</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>EMAIL</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>STATUS</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>SUBMITTED AT</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {statusList.map((row) => (
                                <TableRow key={row.student_id} hover>
                                    <TableCell sx={{ fontWeight: 800 }}>{row.roll_number || 'N/A'}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.full_name}</TableCell>
                                    <TableCell color="text.secondary">{row.email}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            icon={row.status === 'Submitted' ? <CheckCircleIcon /> : <PendingIcon />}
                                            label={row.status.toUpperCase()}
                                            size="small"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: '0.7rem',
                                                bgcolor: row.status === 'Submitted' ? '#ecfdf5' : '#f1f5f9',
                                                color: row.status === 'Submitted' ? '#059669' : '#64748b',
                                                border: `1px solid ${row.status === 'Submitted' ? '#a7f3d0' : '#e2e8f0'}`
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                        {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : selectedAssignment ? (
                <Box sx={{ textAlign: 'center', p: 8, bgcolor: 'white', borderRadius: 4 }}>
                    <Typography color="text.secondary" fontWeight={600}>No students found in this classroom.</Typography>
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', p: 8, bgcolor: 'white', borderRadius: 4 }}>
                    <AssessmentIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                    <Typography color="text.secondary" fontWeight={600}>Please select a class and an assignment to view status.</Typography>
                </Box>
            )}
        </Box>
    );
};


export default SubmissionStatus;
