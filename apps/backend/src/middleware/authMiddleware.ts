import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthService } from '../services/authService';

// Express Request에 user 속성 추가
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        provider: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.',
      });
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    const payload = verifyToken(token);

    // 사용자 존재 확인
    const user = await AuthService.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 사용자입니다.',
      });
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      provider: payload.provider,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않거나 만료된 토큰입니다.',
    });
  }
};
