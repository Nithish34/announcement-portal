import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../services/prisma.service';

function signToken(payload: object): string {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d',
    };
    return jwt.sign(payload, process.env.JWT_SECRET!, options);
}

// POST /api/auth/login
// Body: { teamId, password }  (or { email, password })
export async function login(req: Request, res: Response): Promise<void> {
    const { teamId, email, password } = req.body as { teamId?: string; email?: string; password?: string };

    if ((!teamId && !email) || !password) {
        res.status(400).json({ error: 'teamId (or email) and password are required' });
        return;
    }

    try {
        let user;

        if (email) {
            user = await prisma.user.findUnique({
                where: { email },
                include: { team: { select: { id: true, name: true } } },
            });
        } else if (teamId) {
            // Find the first user in that team (or specifically the team lead if designed that way)
            user = await prisma.user.findFirst({
                where: { teamId },
                include: { team: { select: { id: true, name: true } } },
            });
        }

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = signToken({ userId: user.id, teamId: user.teamId, role: user.role });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                team: user.team,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/auth/register
export async function registerTeam(req: Request, res: Response): Promise<void> {
    const { email, password, teamId, adminSecret } = req.body as {
        email?: string;
        password?: string;
        teamId?: string;
        adminSecret?: string;
    };

    if (adminSecret !== process.env.ADMIN_SECRET) {
        res.status(403).json({ error: 'Invalid admin secret' });
        return;
    }

    if (!email || !password || !teamId) {
        res.status(400).json({ error: 'email, password, and teamId are required' });
        return;
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, password: passwordHash, teamId },
            select: { id: true, email: true, role: true, teamId: true },
        });
        res.status(201).json(user);
    } catch (err: any) {
        if (err.code === 'P2002') {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/auth/refresh
export async function refreshToken(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const token = signToken({ userId: user.userId, teamId: user.teamId, role: user.role });
    res.json({ token });
}

// POST /api/auth/logout
export async function logout(_req: Request, res: Response): Promise<void> {
    // Stateless JWT — client is responsible for dropping the token.
    res.json({ message: 'Logged out successfully' });
}
