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
    Breadcrumbs,
    Link as MuiLink,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    NavigateNext as NavigateNextIcon,
    Cancel as CancelIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const SubmissionStatus = () => {
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const [extensions, setExtensions] = useState([]);
    
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState('');
    
    const [listLoading, setListLoading] = useState(false);
    
    // Extension Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [extensionDate, setExtensionDate] = useState('');
    const [extensionReason, setExtensionReason] = useState('');
    const [granting, setGranting] = useState(false);

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

    const fetchExtensions = useCallback(async () => {
        if (!selectedAssignment) return;
        try {
            const response = await api.get(`/api/teacher/assignments/${selectedAssignment}/extensions`);
            setExtensions(response.data.extensions);
        } catch (error) {
            console.error('Error fetching extensions:', error);
        }
    }, [selectedAssignment]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    useEffect(() => {
        fetchAssignments();
        setSelectedAssignment('');
        setStatusList([]);
        setExtensions([]);
    }, [selectedClass, fetchAssignments]);

    useEffect(() => {
        fetchStatusList();
        fetchExtensions();
    }, [selectedAssignment, fetchStatusList, fetchExtensions]);

    const handleOpenExtensionModal = (student) => {
        setSelectedStudent(student);
        setExtensionDate('');
        setExtensionReason('');
        setModalOpen(true);
    };

    const handleGrantExtension = async () => {
        if (!extensionDate) return alert('Please select a valid date/time');
        
        setGranting(true);
        try {
            // Format to standard ISO string or MySQL datetime compatible
            const isoString = new Date(extensionDate).toISOString().slice(0, 19).replace('T', ' ');
            
            await api.post(`/api/teacher/assignments/${selectedAssignment}/extensions`, {
                student_id: selectedStudent.student_id,
                extended_until: isoString,
                reason: extensionReason
            });
            
            setModalOpen(false);
            fetchExtensions(); // Refresh extensions list
        } catch (error) {
            console.error('Error granting extension:', error);
            alert('Failed to grant extension');
        } finally {
            setGranting(false);
        }
    };

    const handleRevokeExtension = async (extensionId) => {
        if (!window.confirm('Are you sure you want to revoke this extension?')) return;
        
        try {
            await api.delete(`/api/teacher/extensions/${extensionId}`);
            fetchExtensions();
        } catch (error) {
            console.error('Error revoking extension:', error);
            alert('Failed to revoke extension');
        }
    };

    const assignment = assignments.find(a => a.id === selectedAssignment);

    const getStudentStatusInfo = (row) => {
        const extension = extensions.find(e => e.student_id === row.student_id);
    
        if (row.status === 'Submitted') {
            const isLate = assignment?.due_date && new Date(row.submitted_at) > new Date(assignment.due_date);
            const validExtension = extension && new Date(row.submitted_at) <= new Date(extension.extended_until);
            
            return {
                label: 'SUBMITTED',
                color: (isLate && !validExtension) ? 'error' : (isLate && validExtension ? 'warning' : 'success'),
                icon: <CheckCircleIcon />
            };
        }
        
        if (!assignment?.due_date) return { label: 'PENDING', color: 'default', icon: <PendingIcon /> };
        
        const effectiveDeadline = extension ? new Date(extension.extended_until) : new Date(assignment.due_date);
        
        if (new Date() > effectiveDeadline) {
            return { label: 'DEADLINE PASSED', color: 'error', icon: <CancelIcon /> };
        }
        return { label: 'PENDING', color: 'default', icon: <PendingIcon /> };
    };

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
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>STATUS</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>SUBMITTED AT</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'right' }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {statusList.map((row) => {
                                const statusInfo = getStudentStatusInfo(row);
                                const extension = extensions.find(e => e.student_id === row.student_id);
                                
                                return (
                                    <TableRow key={row.student_id} hover>
                                        <TableCell sx={{ fontWeight: 800 }}>{row.roll_number || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>{row.full_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Chip
                                                icon={statusInfo.icon}
                                                label={statusInfo.label}
                                                size="small"
                                                color={statusInfo.color !== 'default' ? statusInfo.color : 'default'}
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                            {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            {statusInfo.label === 'DEADLINE PASSED' && !extension && (
                                                <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenExtensionModal(row)}>
                                                    Grant Ext.
                                                </Button>
                                            )}
                                            {extension && row.status !== 'Submitted' && (
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                                                    <Tooltip title={`Extended to: ${new Date(extension.extended_until).toLocaleString()}`}>
                                                        <Chip size="small" color="warning" label="Extended" />
                                                    </Tooltip>
                                                    <IconButton size="small" color="error" onClick={() => handleRevokeExtension(extension.id)}>
                                                        <CancelIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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

            {/* Grant Extension Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 400 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Grant Deadline Extension</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Extending deadline for <b>{selectedStudent?.full_name}</b>.
                    </Typography>
                    
                    <TextField
                        fullWidth
                        type="datetime-local"
                        label="New Deadline (Extended Until)"
                        InputLabelProps={{ shrink: true }}
                        value={extensionDate}
                        onChange={(e) => setExtensionDate(e.target.value)}
                        sx={{ mb: 3 }}
                    />
                    
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason for Extension (Optional)"
                        value={extensionReason}
                        onChange={(e) => setExtensionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setModalOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" color="warning" onClick={handleGrantExtension} disabled={granting} sx={{ fontWeight: 800, borderRadius: 2 }}>
                        {granting ? <CircularProgress size={24} /> : 'Confirm Extension'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SubmissionStatus;
