import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/ForbiddenError.js';
import { UserRole } from '../constants/roles.js';
import { RESPONSE_MESSAGES } from '../constants/response-messages.js';

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError(RESPONSE_MESSAGES.FORBIDDEN));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(RESPONSE_MESSAGES.FORBIDDEN));
    }

    next();
  };
};
