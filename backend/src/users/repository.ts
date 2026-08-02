import prisma from '../config/prisma';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from '@prisma/client';

export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: CreateUserDto & { passwordHash: string }): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        password: data.passwordHash,
        full_name: data.full_name,
        role: data.role,
      },
    });
  }

  async update(id: string, data: UpdateUserDto & { passwordHash?: string }): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        password: data.passwordHash,
        full_name: data.full_name,
        role: data.role,
      },
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}
