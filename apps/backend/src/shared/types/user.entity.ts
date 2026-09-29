import type { User } from "@workspace/types/src/user.ts"

export interface userEntity extends User {
  passwordHash: string
}
