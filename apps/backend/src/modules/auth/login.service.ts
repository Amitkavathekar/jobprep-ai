import { UserModel } from "../users/user.model";
import { LoginUserInput } from "./login.types";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { comparePassword } from "../../shared/utils/password.util";

export const loginUser = async (data: LoginUserInput) => {
  const email = data.email;

//check admin login into .env file
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && email === adminEmail) {
    if (data.password === adminPassword) {
      return {
        fullName: "amit kavathekar",
        email: "amitkavathekar123@gmail.com",
        role: "admin",
      };
    } else {
      throw new UnauthorizedError("Invalid emailid or password");
    }
  }

  //for check normal user in MongoDB
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new UnauthorizedError("Invalid emailaddress or password");
  }

  const isPasswordValid = await comparePassword(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return {
    fullName: user.fullName,
    email: user.email,
    role: "user",
    createdAt: user.createdAt,
  };
};
