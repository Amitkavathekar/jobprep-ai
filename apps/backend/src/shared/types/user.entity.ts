import { User } from "@workspace/types/User";
export interface userEntity extends User {
  passwordHash: string
}
User
