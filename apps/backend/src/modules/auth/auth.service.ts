import { RESPONSE_MESSAGES } from "../../constants/response-messages.js"
import { BadRequestError } from "../../errors/BadRequestError.js"
import { UnauthorizedError } from "../../errors/UnauthorizedError.js"
import { generateToken } from "../../jwt.utils.js"
import { UserModel } from "../users/user.model.js"

export class AuthService {
  public static async register(data: {
    name: string
    email: string
    password: string
  }) {
    const existingUser = await UserModel.findOne({ email: data.email })
    if (existingUser) {
      throw new BadRequestError(RESPONSE_MESSAGES.EMAIL_ALREADY_EXISTS)
    }

    const user = await UserModel.create(data)
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    }
  }

  public static async login(data: { email: string; password: string }) {
    const user = await UserModel.findOne({ email: data.email }).select(
      "+password"
    )
    if (!user) {
      throw new UnauthorizedError(RESPONSE_MESSAGES.INVALID_CREDENTIALS)
    }

    const isMatch = await user.comparePassword(data.password)
    if (!isMatch) {
      throw new UnauthorizedError(RESPONSE_MESSAGES.INVALID_CREDENTIALS)
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    }
  }
}
