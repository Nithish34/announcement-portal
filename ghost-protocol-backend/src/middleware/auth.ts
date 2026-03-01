import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
    userId: string;
    teamId: string;
    role: 'PARTICIPANT' | 'ADMIN'; // matches the Role enum values in schema.prisma
}

// Extend Express Request to carry our decoded JWT payload
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or malformed authorization header' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    requireAuth(req, res, () => {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        next();
    });
}
