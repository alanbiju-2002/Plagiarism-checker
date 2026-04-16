import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        if (this.socket && this.socket.connected) return;

        console.log('Connecting to socket with token...');
        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Connected to chat server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(roomId) {
        if (this.socket) {
            this.socket.emit('join_room', { roomId });
        }
    }

    sendMessage(messageData) {
        if (this.socket) {
            this.socket.emit('send_message', messageData);
        }
    }

    onReceiveMessage(callback) {
        if (this.socket) {
            this.socket.off('receive_message');
            this.socket.on('receive_message', callback);
        }
    }

    onTyping(callback) {
        if (this.socket) {
            this.socket.off('display_typing');
            this.socket.on('display_typing', callback);
        }
    }

    sendTyping(roomId, isTyping) {
        if (this.socket) {
            this.socket.emit('typing', { roomId, isTyping });
        }
    }

    editMessage(messageId, newContent, roomId) {
        if (this.socket) {
            this.socket.emit('edit_message', { messageId, newContent, roomId });
        }
    }

    deleteMessage(messageId, roomId) {
        if (this.socket) {
            this.socket.emit('delete_message', { messageId, roomId });
        }
    }

    onMessageUpdated(callback) {
        if (this.socket) {
            this.socket.off('message_updated');
            this.socket.on('message_updated', callback);
        }
    }

    onMessageDeleted(callback) {
        if (this.socket) {
            this.socket.off('message_deleted');
            this.socket.on('message_deleted', callback);
        }
    }

    onNotification(callback) {
        if (this.socket) {
            this.socket.off('new_dm_notification');
            this.socket.on('new_dm_notification', callback);
        }
    }
}

const socketService = new SocketService();
export default socketService;
