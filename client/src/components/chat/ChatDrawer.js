import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Drawer, Box, Typography, List, ListItem, 
    ListItemText, Avatar, IconButton, Badge, TextField, 
    Paper, CircularProgress, Divider, Tooltip, Menu, MenuItem
} from '@mui/material';
import { 
    Chat as ChatIcon, Close as CloseIcon, Send as SendIcon, 
    AttachFile as AttachFileIcon, Download as DownloadIcon,
    Person as PersonIcon, School as SchoolIcon,
    Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import socketService from '../../services/socketService';

const ChatDrawer = ({ open, onClose, user }) => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [typingStatus, setTypingStatus] = useState({});
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [anchorElActions, setAnchorElActions] = useState(null);
    const [selectedMsgId, setSelectedMsgId] = useState(null);
    
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (open && user) {
            fetchContacts();
            fetchUnread();
            socketService.connect(localStorage.getItem('accessToken'));
        }
    }, [open, user]);

    const fetchContacts = async () => {
        try {
            const res = await api.get('/api/chat/contacts');
            setContacts(res.data.contacts);
        } catch (err) {
            console.error('Error fetching contacts:', err);
        }
    };

    const fetchUnread = async () => {
        try {
            const res = await api.get('/api/chat/unread');
            const counts = {};
            res.data.unread.forEach(u => counts[u.sender_id] = u.count);
            setUnreadCounts(counts);
        } catch (err) {
            console.error('Error fetching unread:', err);
        }
    };

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        setMessages([]);
        
        const roomId = contact.role === 'class' 
            ? `class_${contact.id}` 
            : `dm_${[user.id, contact.id].sort().join('_')}`;
        
        socketService.joinRoom(roomId);
        fetchHistory(roomId);
        
        // Clear unread for this contact
        if (unreadCounts[contact.id]) {
            setUnreadCounts(prev => ({ ...prev, [contact.id]: 0 }));
        }
    };

    const fetchHistory = async (roomId) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/chat/history/${roomId}`);
            setMessages(res.data.messages);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleNewMessage = (msg) => {
            if (selectedContact) {
                const currentRoomId = selectedContact.role === 'class' 
                    ? `class_${selectedContact.id}` 
                    : `dm_${[user.id, selectedContact.id].sort().join('_')}`;
                
                const msgRoomId = msg.class_id 
                    ? `class_${msg.class_id}` 
                    : `dm_${[msg.sender_id, msg.receiver_id].sort().join('_')}`;

                if (currentRoomId === msgRoomId) {
                    setMessages(prev => [...prev, msg]);
                    setTimeout(scrollToBottom, 100);
                    return;
                }
            }
            // If not in this room, increment unread (only for DMs or relevant broadcasts)
            if (!msg.class_id || user.role === 'student') {
                setUnreadCounts(prev => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }));
            }
        };

        const handleTyping = ({ userId, isTyping }) => {
            setTypingStatus(prev => ({ ...prev, [userId]: isTyping }));
        };

        const handleUpdate = ({ messageId, newContent }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
        };

        const handleDelete = ({ messageId }) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
        };

        socketService.onReceiveMessage(handleNewMessage);
        socketService.onTyping(handleTyping);
        socketService.onMessageUpdated(handleUpdate);
        socketService.onMessageDeleted(handleDelete);

        return () => {
            // socketService logic handles off() usually
        };
    }, [selectedContact, user]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        const isBroadcast = selectedContact.role === 'class';
        const messageData = {
            receiverId: isBroadcast ? null : selectedContact.id,
            classId: isBroadcast ? selectedContact.id : null,
            content: newMessage,
            messageType: isBroadcast ? 'announcement' : 'text'
        };

        socketService.sendMessage(messageData);
        setNewMessage('');
        
        const roomId = isBroadcast ? `class_${selectedContact.id}` : `dm_${[user.id, selectedContact.id].sort().join('_')}`;
        socketService.sendTyping(roomId, false);
    };

    const handleEditSubmit = (e) => {
        e?.preventDefault();
        if (!editContent.trim() || !editingMessageId) return;
        
        const roomId = selectedContact.role === 'class' ? `class_${selectedContact.id}` : `dm_${[user.id, selectedContact.id].sort().join('_')}`;
        socketService.editMessage(editingMessageId, editContent, roomId);
        setEditingMessageId(null);
        setEditContent('');
    };

    const confirmDelete = (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        const roomId = selectedContact.role === 'class' ? `class_${selectedContact.id}` : `dm_${[user.id, selectedContact.id].sort().join('_')}`;
        socketService.deleteMessage(messageId, roomId);
        setAnchorElActions(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedContact) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/api/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const isBroadcast = selectedContact.role === 'class';
            const messageData = {
                receiverId: isBroadcast ? null : selectedContact.id,
                classId: isBroadcast ? selectedContact.id : null,
                messageType: 'file',
                filePath: res.data.url,
                fileName: res.data.fileName
            };

            socketService.sendMessage(messageData);
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const handleInput = (e) => {
        setNewMessage(e.target.value);
        if (!selectedContact) return;

        const roomId = selectedContact.role === 'class' ? `class_${selectedContact.id}` : `dm_${[user.id, selectedContact.id].sort().join('_')}`;
        socketService.sendTyping(roomId, true);
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.sendTyping(roomId, false);
        }, 3000);
    };

    const getFileDownloadPath = (path) => `http://localhost:5000/${path}`;

    return (
        <Drawer 
            anchor="right" 
            open={open} 
            onClose={onClose} 
            PaperProps={{ sx: { width: { xs: '100vw', sm: 400 }, display: 'flex', borderLeft: 'none', boxShadow: '-10px 0 15px -3px rgba(0,0,0,0.1)' } }}
        >
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ChatIcon />
                    <Typography variant="h6" fontWeight={800}>Chat Messenger</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Contacts Sidebar */}
                <Box sx={{ width: 100, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', bgcolor: '#f1f5f9' }}>
                    <List sx={{ p: 0 }}>
                        {contacts.map((contact) => (
                            <ListItem 
                                key={contact.id + contact.role}
                                onClick={() => handleSelectContact(contact)}
                                sx={{ 
                                    flexDirection: 'column', 
                                    py: 2, 
                                    cursor: 'pointer',
                                    bgcolor: selectedContact?.id === contact.id && selectedContact.role === contact.role ? 'white' : 'transparent',
                                    borderRight: selectedContact?.id === contact.id && selectedContact.role === contact.role ? '4px solid #1976d2' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Badge badgeContent={unreadCounts[contact.id]} color="error" overlap="circular">
                                    <Avatar 
                                        sx={{ 
                                            width: 48, 
                                            height: 48, 
                                            bgcolor: contact.role === 'class' ? 'secondary.main' : 'primary.light',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {contact.role === 'class' ? <SchoolIcon /> : <PersonIcon />}
                                    </Avatar>
                                </Badge>
                                <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', fontWeight: 800, fontSize: '0.6rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                    {contact.full_name.toUpperCase()}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Chat Window */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
                    {selectedContact ? (
                        <>
                            <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800} color="primary">{selectedContact.full_name}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {selectedContact.role === 'class' ? 'Classroom Announcement' : (selectedContact.role === 'teacher' ? 'Teacher' : 'Student')}
                                    </Typography>
                                </Box>
                                {typingStatus[selectedContact.id] && (
                                    <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ animation: 'pulse 1.5s infinite' }}>
                                        Typing...
                                    </Typography>
                                )}
                            </Box>
                            
                            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress size={24} /></Box>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMine = msg.sender_id === user.id;
                                        const isEditing = editingMessageId === msg.id;

                                        return (
                                            <Box 
                                                key={msg.id || idx} 
                                                sx={{ 
                                                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                                                    maxWidth: '85%',
                                                    position: 'relative',
                                                    '&:hover .msg-actions': { opacity: 1 }
                                                }}
                                            >
                                                {!isMine && selectedContact.role === 'class' && (
                                                    <Typography variant="caption" sx={{ ml: 1, mb: 0.5, display: 'block', fontWeight: 700, color: 'text.secondary' }}>
                                                        {msg.sender_name}
                                                    </Typography>
                                                )}
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                                    {isMine && !isEditing && (
                                                        <IconButton 
                                                            className="msg-actions"
                                                            size="small" 
                                                            onClick={(e) => {
                                                                setAnchorElActions(e.currentTarget);
                                                                setSelectedMsgId(msg.id);
                                                            }}
                                                            sx={{ opacity: 0, transition: '0.2s', alignSelf: 'center' }}
                                                        >
                                                            <MoreIcon fontSize="inherit" />
                                                        </IconButton>
                                                    )}
                                                    <Paper 
                                                        elevation={0}
                                                        sx={{ 
                                                            p: 1.5, 
                                                            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                            bgcolor: isMine ? 'primary.main' : 'white',
                                                            color: isMine ? 'white' : 'text.primary',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                            border: isMine ? 'none' : '1px solid #e2e8f0'
                                                        }}
                                                    >
                                                        {isEditing ? (
                                                            <Box component="form" onSubmit={handleEditSubmit} sx={{ minWidth: 200 }}>
                                                                <TextField
                                                                    fullWidth
                                                                    autoFocus
                                                                    size="small"
                                                                    multiline
                                                                    value={editContent}
                                                                    onChange={(e) => setEditContent(e.target.value)}
                                                                    sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }}
                                                                />
                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                                                                    <Typography 
                                                                        variant="caption" 
                                                                        sx={{ cursor: 'pointer', fontWeight: 700 }} 
                                                                        onClick={() => setEditingMessageId(null)}
                                                                    >
                                                                        Cancel
                                                                    </Typography>
                                                                    <Typography 
                                                                        variant="caption" 
                                                                        sx={{ cursor: 'pointer', fontWeight: 700 }} 
                                                                        onClick={handleEditSubmit}
                                                                    >
                                                                        Save
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        ) : (
                                                            <>
                                                                {msg.message_type === 'file' ? (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <AttachFileIcon fontSize="small" />
                                                                        <Box sx={{ mr: 1 }}>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-all' }}>{msg.file_name}</Typography>
                                                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>File Attachment</Typography>
                                                                        </Box>
                                                                        <IconButton 
                                                                            size="small" 
                                                                            sx={{ color: 'inherit', bgcolor: 'rgba(255,255,255,0.1)' }} 
                                                                            onClick={() => window.open(getFileDownloadPath(msg.file_path), '_blank')}
                                                                        >
                                                                            <DownloadIcon fontSize="inherit" />
                                                                        </IconButton>
                                                                    </Box>
                                                                ) : (
                                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                                        {msg.content}
                                                                    </Typography>
                                                                )}
                                                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, textAlign: 'right', fontSize: '0.6rem', fontWeight: 600 }}>
                                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </Paper>
                                                </Box>
                                            </Box>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Actions Menu */}
                            <Menu
                                anchorEl={anchorElActions}
                                open={Boolean(anchorElActions)}
                                onClose={() => setAnchorElActions(null)}
                            >
                                <MenuItem onClick={() => {
                                    const msg = messages.find(m => m.id === selectedMsgId);
                                    if (msg.message_type === 'file') {
                                        setAnchorElActions(null);
                                        return;
                                    }
                                    setEditingMessageId(selectedMsgId);
                                    setEditContent(msg.content || '');
                                    setAnchorElActions(null);
                                }}>
                                    <EditIcon sx={{ mr: 1, fontSize: 18 }} /> Edit
                                </MenuItem>
                                <MenuItem onClick={() => confirmDelete(selectedMsgId)} sx={{ color: 'error.main' }}>
                                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
                                </MenuItem>
                            </Menu>

                            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                                <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <input
                                        type="file"
                                        id="chat-file-input"
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                        accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                                    />
                                    <Tooltip title="Attach File">
                                        <IconButton size="small" onClick={() => document.getElementById('chat-file-input').click()}>
                                            <AttachFileIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <TextField 
                                        fullWidth 
                                        size="small" 
                                        multiline
                                        maxRows={3}
                                        placeholder={selectedContact.role === 'class' ? "Send announcement to class..." : "Type a message..."}
                                        value={newMessage}
                                        onChange={handleInput}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f1f5f9', '& fieldset': { border: 'none' } } }}
                                    />
                                    <IconButton 
                                        color="primary" 
                                        type="submit" 
                                        disabled={!newMessage.trim()}
                                        sx={{ bgcolor: newMessage.trim() ? 'primary.main' : 'transparent', color: newMessage.trim() ? 'white' : 'inherit', '&:hover': { bgcolor: 'primary.dark' } }}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'text.disabled', p: 4, textAlign: 'center' }}>
                            <Box sx={{ p: 3, borderRadius: '50%', bgcolor: '#f1f5f9', mb: 3 }}>
                                <ChatIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                            </Box>
                            <Typography variant="body1" fontWeight={800} color="text.primary">Your Classroom Hub</Typography>
                            <Typography variant="caption" sx={{ mt: 1, px: 4 }}>
                                {user.role === 'student' 
                                    ? 'Contact your teacher privately or stay updated with class announcements.' 
                                    : 'Respond to student inquiries or broadcast updates to your entire class.'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default ChatDrawer;
