import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types';
import { AuthService } from './service';
import { UnauthorizedError } from '../common/errors';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.refresh(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // In stateless JWT, logout is primarily handled by the client clearing the storage.
      // We return success: true as per API requirements.
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const profile = await this.authService.getProfile(req.user.id);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const { currentPassword, newPassword, confirmPassword } = req.body;
      await this.authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword,
        confirmPassword
      );
      res.json({ success: true, data: { message: 'Password changed successfully' } });
    } catch (error) {
      next(error);
    }
  };
}
