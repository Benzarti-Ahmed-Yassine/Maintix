import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'maintix_jwt_secret_key_2024';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Demo fallback: default to technician or extract role from query/header for ease of testing
    const demoRole = (req.headers['x-demo-role'] as string) || 'TECHNICIAN';
    req.user = {
      id: 'demo-user-id',
      email: `${demoRole.toLowerCase()}@maintix.io`,
      name: `Demo ${demoRole}`,
      role: demoRole.toUpperCase(),
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'ADMIN') {
      return next(); // Admin has all access
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to ${allowedRoles.join(', ')}`,
        currentRole: req.user.role,
      });
    }
    next();
  };
}
