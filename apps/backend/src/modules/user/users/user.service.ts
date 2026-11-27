import { UserModel } from "./user.model";

export const getAllUsers = async () => {
  const users = await UserModel.find();

  return users;
};
