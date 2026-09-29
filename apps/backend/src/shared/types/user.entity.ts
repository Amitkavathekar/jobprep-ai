import type { User } from "@workspace/types/src/user.js"

export interface userEntity extends User {
  passwordHash: string
}
