import prisma from '../config/prisma';
import { Product } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';

export type ProductWithCategory = Product & {
  category: {
    name: string;
  };
};

export class ProductRepository {
  async findAll(): Promise<ProductWithCategory[]> {
    return prisma.product.findMany({
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true },
        },
      },
    });
  }

  async create(data: CreateProductDto): Promise<ProductWithCategory> {
    return prisma.product.create({
      data: {
        category_id: data.category_id,
        name: data.name,
        price: data.price,
        is_active: data.is_active ?? true,
        image_url: data.image_url,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateProductDto): Promise<ProductWithCategory> {
    return prisma.product.update({
      where: { id },
      data: {
        category_id: data.category_id,
        name: data.name,
        price: data.price,
        is_active: data.is_active,
        image_url: data.image_url,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }
}
