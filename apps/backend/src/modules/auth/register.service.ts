import { UserModel } from "../users/user.model";
import { RegisterUserInput } from "./register.types";
import { BadRequestError } from "../../errors/BadRequestError";
import { hashPassword } from "../../shared/utils/password.util";

export const registerUser = async (data: RegisterUserInput) => {
  const email = data.email;

  const existingUser = await UserModel.findOne({
    email,
  });

  if (existingUser) {
    throw new BadRequestError("User already exists in database");
  }

  const { password, ...userData } = data;
  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    ...userData,
    email,
    passwordHash,
  });

  return {
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  };
};
