import { Role } from '@prisma/client';

export interface CreateUserDto {
  username: string;
  password?: string;
  full_name: string;
  role: Role;
  is_active?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  full_name?: string;
  role?: Role;
  is_active?: boolean;
}

export interface UserResponseDto {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
