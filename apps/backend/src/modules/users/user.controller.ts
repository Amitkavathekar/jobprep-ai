import { Request, Response, NextFunction } from "express"
import { getAllUsers } from "../users/user.service"

// GET /api/auth/users
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers()

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    })
  } catch (error) {
    next(error)
  }
}

