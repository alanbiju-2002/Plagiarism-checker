const pool = require('../config/database');

module.exports = (io, socket) => {
    const { id: userId, role } = socket.user;

    // Join a specific room (DM or Class)
    socket.on('join_room', (data) => {
        const { roomId } = data; // e.g., 'class_1' or 'dm_5_12'
        
        // Security check: ensure student only joins their classes or DMs with their teachers
        // For production, you'd verify enrollment here.
        
        socket.join(roomId);
        console.log(`User ${userId} joined room: ${roomId}`);
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
        const { receiverId, classId, content, messageType, filePath, fileName } = data;
        const roomId = classId ? `class_${classId}` : `dm_${[userId, receiverId].sort().join('_')}`;

        try {
            // Persist to database
            const [result] = await pool.execute(
                `INSERT INTO messages (sender_id, receiver_id, class_id, content, file_path, file_name, message_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, receiverId || null, classId || null, content || null, filePath || null, fileName || null, messageType || 'text']
            );

            const newMessage = {
                id: result.insertId,
                sender_id: userId,
                receiver_id: receiverId || null,
                class_id: classId || null,
                content,
                file_path: filePath,
                file_name: fileName,
                message_type: messageType,
                created_at: new Date(),
                is_read: false
            };

            // Broadcast to the room
            io.to(roomId).emit('receive_message', newMessage);
            
            // If it's a DM, also notify the receiver (even if not in the room) for unread counts
            if (receiverId) {
                io.to(`user_${receiverId}`).emit('new_dm_notification', {
                    senderId: userId,
                    message: content || 'Sent a file'
                });
            }

        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Join personal user room for notifications
    socket.join(`user_${userId}`);

    // Typing indicator
    socket.on('typing', (data) => {
        const { roomId, isTyping } = data;
        socket.to(roomId).emit('display_typing', { userId, isTyping });
    });

    // Mark as read
    socket.on('mark_read', async (data) => {
        const { messageIds } = data;
        if (!messageIds || messageIds.length === 0) return;

        try {
            const placeholders = messageIds.map(() => '?').join(',');
            await pool.execute(
                `UPDATE messages SET is_read = TRUE WHERE id IN (${placeholders}) AND receiver_id = ?`,
                [...messageIds, userId]
            );
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });

    // Edit message
    socket.on('edit_message', async (data) => {
        const { messageId, newContent, roomId } = data;
        try {
            const [result] = await pool.execute(
                `UPDATE messages SET content = ? WHERE id = ? AND sender_id = ?`,
                [newContent, messageId, userId]
            );

            if (result.affectedRows > 0) {
                io.to(roomId).emit('message_updated', { messageId, newContent });
            }
        } catch (error) {
            console.error('Error editing message:', error);
            socket.emit('error', { message: 'Failed to edit message' });
        }
    });

    // Delete message
    socket.on('delete_message', async (data) => {
        const { messageId, roomId } = data;
        try {
            const [result] = await pool.execute(
                `DELETE FROM messages WHERE id = ? AND sender_id = ?`,
                [messageId, userId]
            );

            if (result.affectedRows > 0) {
                io.to(roomId).emit('message_deleted', { messageId });
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            socket.emit('error', { message: 'Failed to delete message' });
        }
    });
};
