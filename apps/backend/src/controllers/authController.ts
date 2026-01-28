import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { SocialAuthService } from "../services/socialAuthService";
import { RegisterRequest, LoginRequest, SocialAuthRequest } from "../types/auth";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  asyncHandler,
} from "../middleware/errorHandler";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterRequest = req.body;
    const result = await AuthService.register(data);

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const data: LoginRequest = req.body;
    const result = await AuthService.login(data);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  static socialLogin = asyncHandler(async (req: Request, res: Response) => {
    const data: SocialAuthRequest = req.body;
    const result = await SocialAuthService.authenticate(data);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError("인증이 필요합니다.");
    }

    const user = await AuthService.getUserById(req.user.userId);
    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        provider: user.provider,
      },
    });
  });
}
