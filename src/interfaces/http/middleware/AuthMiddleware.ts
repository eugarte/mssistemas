import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '@infrastructure/auth/JwtAuthService';
import { logger } from '@infrastructure/logging/Logger';

const jwtService = new JwtAuthService();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
  serviceId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = jwtService.extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const payload = jwtService.verifyToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles,
    };
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { ip: req.ip, path: req.path });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = jwtService.extractTokenFromHeader(authHeader);

  if (token) {
    try {
      const payload = jwtService.verifyToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles,
      };
    } catch (error) {
      // Invalid token, but optional auth - continue without user
    }
  }
  
  next();
};

export const requireRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
