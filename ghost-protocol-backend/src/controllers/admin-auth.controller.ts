import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../services/prisma.service';
import type { AdminAuthPayload } from '../middleware/auth';

// ── JWT helpers ────────────────────────────────────────────────────────────
function signAdminToken(adminId: string, email: string): string {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d',
    };
    return jwt.sign({ adminId, email, isAdmin: true }, process.env.JWT_SECRET!, options);
}

// ── POST /api/admin/auth/login ─────────────────────────────────────────────
export async function adminLogin(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }

    try {
        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = signAdminToken(admin.id, admin.email);
        res.json({
            token,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: 'ADMIN',   // kept for dashboard compatibility
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ── GET /api/admin/admins — list all admins (admin-only) ───────────────────
export async function listAdmins(_req: Request, res: Response): Promise<void> {
    try {
        const admins = await prisma.admin.findMany({
            select: { id: true, email: true, name: true, createdAt: true, createdById: true },
            orderBy: { createdAt: 'asc' },
        });
        res.json(admins);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ── POST /api/admin/admins — add a new admin (admin-only) ──────────────────
export async function addAdmin(req: Request, res: Response): Promise<void> {
    const { email, password, name } = req.body as {
        email?: string;
        password?: string;
        name?: string;
    };

    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }

    const createdById: string | undefined = (req.admin as AdminAuthPayload | undefined)?.adminId;

    try {
        const hash = await bcrypt.hash(password, 12);
        const admin = await prisma.admin.create({
            data: {
                email,
                password: hash,
                name: name ?? '',
                createdById: createdById ?? null,
            },
            select: { id: true, email: true, name: true, createdAt: true, createdById: true },
        });
        res.status(201).json(admin);
    } catch (err: unknown) {
        const e = err as { code?: string };
        if (e.code === 'P2002') {
            res.status(409).json({ error: 'An admin with that email already exists' });
            return;
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ── DELETE /api/admin/admins/:adminId — remove an admin (admin-only) ───────
export async function removeAdmin(req: Request, res: Response): Promise<void> {
    const targetId = req.params['adminId'] as string;
    const selfId: string = (req.admin as AdminAuthPayload | undefined)?.adminId ?? '';

    if (targetId === selfId) {
        res.status(400).json({ error: 'You cannot remove yourself' });
        return;
    }

    try {
        await prisma.admin.delete({ where: { id: targetId } });
        res.json({ message: 'Admin removed' });
    } catch (err: unknown) {
        const e = err as { code?: string };
        if (e.code === 'P2025') {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
