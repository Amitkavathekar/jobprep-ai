import type { User } from "@workspace/types";

export interface RegisterUserInput extends User {
  password: string;
}
