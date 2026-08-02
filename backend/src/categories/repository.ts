import prisma from '../config/prisma';
import { Category } from '@prisma/client';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    return prisma.category.create({
      data: {
        name: data.name,
      },
    });
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }
}
