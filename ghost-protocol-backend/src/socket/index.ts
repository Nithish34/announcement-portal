import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { requireAuth } from '../middleware/auth';

let io: SocketServer;

export function initSocket(server: HttpServer): SocketServer {
    io = new SocketServer(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // ── Auth middleware for Socket.IO ────────────────────────────────────────
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token as string | undefined;
        if (!token) {
            return next(new Error('Authentication error: no token provided'));
        }

        // Re-use the express middleware logic inline
        try {
            const jwt = require('jsonwebtoken');
            const payload = jwt.verify(token, process.env.JWT_SECRET!);
            (socket as any).user = payload;
            next();
        } catch {
            next(new Error('Authentication error: invalid token'));
        }
    });

    // ── Connection handler ────────────────────────────────────────────────────
    io.on('connection', (socket) => {
        const user = (socket as any).user;
        console.log(`🔌 Socket connected: ${socket.id} (${user?.teamId ?? 'unknown'})`);

        // Join a room per team for targeted broadcasts
        if (user?.teamId) {
            socket.join(`team:${user.teamId}`);
        }

        // ── Client events ──────────────────────────────────────────────────────

        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date().toISOString() });
        });

        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });

    console.log('🔗 Socket.IO initialized');
    return io;
}

/** Returns the initialized Socket.IO server instance (use after initSocket is called) */
export function getIo(): SocketServer {
    if (!io) throw new Error('Socket.IO has not been initialized. Call initSocket() first.');
    return io;
}
