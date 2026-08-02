import { CategoryRepository } from './repository';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from './dto';
import { BadRequestError, NotFoundError } from '../common/errors';
import { Category } from '@prisma/client';

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  private mapToResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAll();
    return categories.map(this.mapToResponse);
  }

  async getCategoryById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return this.mapToResponse(category);
  }

  async createCategory(data: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findByName(data.name);
    if (existing) {
      throw new BadRequestError('Category with this name already exists');
    }
    const category = await this.categoryRepository.create(data);
    return this.mapToResponse(category);
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (data.name !== category.name) {
      const existing = await this.categoryRepository.findByName(data.name);
      if (existing) {
        throw new BadRequestError('Category with this name already exists');
      }
    }

    const updated = await this.categoryRepository.update(id, data);
    return this.mapToResponse(updated);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    await this.categoryRepository.delete(id);
  }
}
