import { UserRole } from "../../enums";

export interface CreateUserDto {
  username: string;
  password: string;
  confirmPassword: string;
  userRole: UserRole;
  email : String;
}
