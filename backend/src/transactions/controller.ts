import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types';
import { TransactionService } from './service';
import { UnauthorizedError } from '../common/errors';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const transactions = await this.transactionService.getAllTransactions();
      res.json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const transaction = await this.transactionService.getTransactionById(req.params.id);
      res.json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User profile not resolved');
      }
      const transaction = await this.transactionService.createTransaction(req.user.id, req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };
}
