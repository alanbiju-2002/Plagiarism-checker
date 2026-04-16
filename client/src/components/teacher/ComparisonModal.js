import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Grid,
    Chip,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ComparisonModal = ({ open, onClose, submission, matches }) => {
    if (!submission) return null;

    const sentenceAnalysis = submission.sentence_analysis ?
        (typeof submission.sentence_analysis === 'string' ? JSON.parse(submission.sentence_analysis) : submission.sentence_analysis)
        : [];

    const getHighlightColor = (status) => {
        switch (status) {
            case 'exact': return '#fee2e2'; // Light red
            case 'paraphrase': return '#ffedd5'; // Light orange
            default: return 'transparent';
        }
    };

    const getBorderColor = (status) => {
        switch (status) {
            case 'exact': return '#ef4444'; // Red
            case 'paraphrase': return '#f97316'; // Orange
            default: return 'transparent';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, height: '90vh' }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" fontWeight={800}>Side-by-Side Integrity Analysis</Typography>
                    <Chip
                        icon={<PsychologyIcon />}
                        label={`AI Probability: ${submission.ai_score || 0}%`}
                        color={submission.ai_score > 50 ? "error" : "primary"}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 700 }}
                    />
                </Box>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Grid container sx={{ height: '100%' }}>
                    {/* Left Side: Student Submission */}
                    <Grid item xs={12} md={matches && matches.length > 0 ? 6 : 12} sx={{ p: 3, overflowY: 'auto', bgcolor: '#fff', borderRight: '1px solid #e2e8f0' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700}>
                            STUDENT SUBMISSION (HIGHLIGHTED)
                        </Typography>
                        <Box sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                            {sentenceAnalysis.length > 0 ? (
                                sentenceAnalysis.map((item, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            backgroundColor: getHighlightColor(item.status),
                                            borderBottom: `2px solid ${getBorderColor(item.status)}`,
                                            padding: '2px 0',
                                            marginRight: '4px',
                                            cursor: item.status !== 'original' ? 'help' : 'default'
                                        }}
                                        title={item.status !== 'original' ? `Similarity: ${item.score}% (${item.status})` : ''}
                                    >
                                        {item.text}{' '}
                                    </span>
                                ))
                            ) : (
                                <Typography color="text.secondary">No sentence analysis available for this submission.</Typography>
                            )}
                        </Box>

                        <Box sx={{ mt: 4, p: 2, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', gap: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ w: 16, h: 16, bgcolor: '#fee2e2', border: '1px solid #ef4444', width: 16, height: 16 }} />
                                <Typography variant="caption" fontWeight={700}>EXACT COPY</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ w: 16, h: 16, bgcolor: '#ffedd5', border: '1px solid #f97316', width: 16, height: 16 }} />
                                <Typography variant="caption" fontWeight={700}>PARAPHRASED</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Side: Matched Sources text */}
                    {matches && matches.length > 0 && (
                        <Grid item xs={12} md={6} sx={{ p: 3, overflowY: 'auto', bgcolor: '#f8fafc' }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700}>
                                MATCHED SOURCES TEXT
                            </Typography>
                            {matches.map((match, index) => (
                                <Box key={index} sx={{ mb: 3, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                                        {match.matched_source_type === 'external' ? 'Web Source Found' : `Match with student: ${match.matched_student_name || 'Unknown'}`}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }} color="error.main" fontWeight={700}>
                                        Similarity: {match.similarity_percentage}%
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" sx={{ lineHeight: 1.8, fontStyle: 'italic', color: 'text.secondary' }}>
                                        "...{match.matched_text || 'Similar content detected in this source.'}..."
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default ComparisonModal;
