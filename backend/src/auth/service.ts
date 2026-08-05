import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './repository';
import { LoginDto, AuthResponseDto } from './dto';
import { UnauthorizedError } from '../common/errors';
import { UserPayload } from '../common/types';

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-for-pos-mvp-12345';
  private jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-jwt-key-for-pos-mvp-67890';

  constructor(private authRepository: AuthRepository) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    if (!dto.password) {
      throw new UnauthorizedError('Username and password are required');
    }

    const user = await this.authRepository.findUserByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: UserPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as UserPayload;
      const user = await this.authRepository.findUserById(decoded.id);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const payload: UserPayload = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      const newAccessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '1d' });
      const newRefreshToken = jwt.sign(payload, this.jwtRefreshSecret, { expiresIn: '7d' });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    };
  }

  async changePassword(
    userId: string,
    currentPassword?: string,
    newPassword?: string,
    confirmPassword?: string
  ): Promise<void> {
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new UnauthorizedError('All password fields are required.');
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect.');
    }

    // Verify new and confirm passwords match
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedError('New password and confirm password do not match.');
    }

    // Verify minimum length
    if (newPassword.length < 6) {
      throw new UnauthorizedError('New password must be at least 6 characters long.');
    }

    // Verify new password !== current password
    if (currentPassword === newPassword) {
      throw new UnauthorizedError('New password cannot be identical to the current password.');
    }

    // Hash and save new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePassword(userId, passwordHash);
  }
}
