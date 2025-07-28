export interface AppUser{
  id: string;
  displayName: string;
  username: string;
  email: string;
  isDisabled: boolean;
  userRole: string;
  avatar?: string;
}

export interface AddUserDto {
  displayName: string;
  username?: string;
  email?: string;
  userRole: string;
} 