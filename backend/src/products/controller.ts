import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types';
import { ProductService } from './service';

export class ProductController {
  constructor(private productService: ProductService) {}

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.getAllProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  };
}
