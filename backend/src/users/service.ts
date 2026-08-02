import bcrypt from 'bcrypt';
import { UserRepository } from './repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { BadRequestError, NotFoundError } from '../common/errors';
import { User } from '@prisma/client';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  private mapToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(this.mapToResponse);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.mapToResponse(user);
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    if (!data.password) {
      throw new BadRequestError('Password is required');
    }
    const existingUser = await this.userRepository.findByUsername(data.username);
    if (existingUser) {
      throw new BadRequestError('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      ...data,
      passwordHash,
    });
    return this.mapToResponse(user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    if (data.username && data.username !== existingUser.username) {
      const usernameConflict = await this.userRepository.findByUsername(data.username);
      if (usernameConflict) {
        throw new BadRequestError('Username is already taken');
      }
    }

    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, {
      ...data,
      passwordHash,
    });

    return this.mapToResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }
    await this.userRepository.delete(id);
  }
}
