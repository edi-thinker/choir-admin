// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
    user?: { id: string; role: string }; // Extend the Request object
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user: { id: string; role: string } };
        req.user = decoded.user; // Add user information to the request object
        next(); // Continue to the next middleware/route handler
    } catch (error) {
        console.error(error);
        res.status(403).json({ message: 'Token is not valid' });
    }
}


export function authorizeRole(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - No user" }); // Should not happen if auth ran first
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Forbidden - Requires one of roles: ${roles.join(', ')}` });
        }
        next();
    };
}