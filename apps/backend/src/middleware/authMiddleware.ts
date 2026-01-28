import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthService } from '../services/authService';
import { getCache, setCache, createCacheKey } from '../utils/cache';

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

    // 캐시 키 생성
    const userCacheKey = createCacheKey("user", "exists", payload.userId);
    
    // 캐시에서 사용자 존재 여부 확인 (5분 TTL)
    let userExists = await getCache<boolean>(userCacheKey);
    
    if (userExists === null) {
      // 캐시에 없으면 DB에서 확인
      const user = await AuthService.getUserById(payload.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '유효하지 않은 사용자입니다.',
        });
      }
      
      // 사용자 존재 여부를 캐시에 저장 (5분)
      // 짧은 TTL로 설정하여 사용자 삭제 시 빠르게 반영
      userExists = true;
      await setCache(userCacheKey, true, 300);
    } else if (userExists === false) {
      // 캐시에 false가 저장되어 있으면 사용자가 삭제된 것으로 간주
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 사용자입니다.',
      });
    }

    // JWT 토큰의 정보를 사용 (DB 조회 없이)
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
