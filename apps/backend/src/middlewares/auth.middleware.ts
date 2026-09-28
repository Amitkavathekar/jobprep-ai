import { NextFunction, Request, Response } from "express"
import { RESPONSE_MESSAGES } from "../constants/response-messages.js"
import { UnauthorizedError } from "../errors/UnauthorizedError.js"
import { verifyToken } from "../shared/utils/jwt.utils.js"

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError(RESPONSE_MESSAGES.UNAUTHORIZED))
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = verifyToken(token)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as any,
    }
    next()
  } catch (error) {
    next(new UnauthorizedError(RESPONSE_MESSAGES.TOKEN_EXPIRED))
  }
}
