import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
    userId: string;
    teamId: string;
    role: 'PARTICIPANT' | 'ADMIN';
}

export interface AdminAuthPayload {
    adminId: string;
    email: string;
    isAdmin: true;
}

// Extend Express Request to carry decoded JWT payloads
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
            admin?: AdminAuthPayload;
        }
    }
}

// ── requireAuth — for participant routes ────────────────────────────────────
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

// ── requireAdmin — for participant routes that need ADMIN role ──────────────
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    requireAuth(req, res, () => {
        const payload = req.user as any;
        if (payload?.role !== 'ADMIN' && payload?.isAdmin !== true) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        next();
    });
}

// ── requireAdminAuth — for admin-dashboard routes (Admin table token) ───────
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or malformed authorization header' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as AdminAuthPayload;
        if (!payload.isAdmin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        req.admin = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired admin token' });
    }
}
