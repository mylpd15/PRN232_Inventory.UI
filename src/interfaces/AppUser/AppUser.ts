import { UserRole } from "../../common/enums";

export interface AppUser {
  id: string;
  displayName: string;
  username: string;
  email: string;
  isDisabled: boolean;
  userRole: UserRole;
}

export interface AddUserDto {
  displayName: string;
  username?: string;
  email?: string;
  userRole: string;
} 