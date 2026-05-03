import { getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';

export type Role = 'admin' | 'elaborador' | 'taster';

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { sessionClaims } = getAuth(req);
    const userRole = (sessionClaims?.metadata as { role?: Role })?.role;

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }
    next();
  };
};
