import { UserModel } from "../users/user.model";
import { LoginUserInput } from "./login.types";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { comparePassword } from "../../shared/utils/password.util";
import { generateToken } from "../../shared/utils/jwt.utils";

export const loginUser = async (data: LoginUserInput) => {
  const email = data.email.trim().toLowerCase();

  // Admin login
  if (email === process.env.ADMIN_EMAIL?.toLowerCase()) {
    if (data.password !== process.env.ADMIN_PASSWORD) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = generateToken({
      id: "admin",
      email,
      role: "admin",
    });

    return {
      token,
      user: {
        id: "admin",
        fullName: "System Admin",
        email,
        role: "admin",
      },
    };
  }

  // Normal user login
  const user = await UserModel.findOne({ email });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Invalid emailid or password");
  }

  const passwordMatch = await comparePassword(
    data.password,
    user.passwordHash
  );

  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Generate jwt token
  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: "user",
  });

  return {
    token,
    user: {
      fullName: user.fullName,
      email: user.email,
      role: "user",
      createdAt: user.createdAt,
    },
  };
};
