import { UserModel } from './user.model.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { RESPONSE_MESSAGES } from '../../constants/response-messages.js';

export class UserService {
  public static async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError(RESPONSE_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  public static async updateProfile(userId: string, data: Partial<{ name: string; bio: string; skills: string[]; avatar: string }>) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError(RESPONSE_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  public static async getAllUsers() {
    return UserModel.find().select('-password').sort({ createdAt: -1 });
  }
}
