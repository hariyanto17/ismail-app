import { ProductRepository, ProductWithCategory } from './repository';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from './dto';
import { NotFoundError } from '../common/errors';
import prisma from '../config/prisma';
import { uploadImage, replaceImage, deleteImage } from '../common/imageStorage';

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  private mapToResponse(product: ProductWithCategory): ProductResponseDto {
    return {
      id: product.id,
      category_id: product.category_id,
      category_name: product.category.name,
      name: product.name,
      price: product.price,
      is_active: product.is_active,
      image_url: product.image_url,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }

  async getAllProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findAll();
    return products.map(this.mapToResponse);
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return this.mapToResponse(product);
  }

  async createProduct(data: CreateProductDto): Promise<ProductResponseDto> {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.category_id },
    });
    if (!categoryExists) {
      throw new NotFoundError('Category not found');
    }

    let imageUrl = null;
    if (data.image) {
      imageUrl = await uploadImage(data.image, data.name);
    }

    const product = await this.productRepository.create({
      ...data,
      image_url: imageUrl,
    });
    return this.mapToResponse(product);
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (data.category_id) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.category_id },
      });
      if (!categoryExists) {
        throw new NotFoundError('Category not found');
      }
    }

    let imageUrl = data.image_url !== undefined ? data.image_url : product.image_url;
    if (data.image) {
      const title = data.name || product.name;
      if (product.image_url) {
        imageUrl = await replaceImage(product.image_url, data.image, title);
      } else {
        imageUrl = await uploadImage(data.image, title);
      }
    }

    const updated = await this.productRepository.update(id, {
      ...data,
      image_url: imageUrl,
    });
    return this.mapToResponse(updated);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.image_url) {
      try {
        await deleteImage(product.image_url);
      } catch (err) {
        console.error('Failed to delete image from storage:', err);
      }
    }

    await this.productRepository.delete(id);
  }
}
