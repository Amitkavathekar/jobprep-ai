import type { User } from "@workspace/types";
export interface userEntity extends User {
  passwordHash: string
}
