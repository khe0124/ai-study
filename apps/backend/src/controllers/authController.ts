import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { SocialAuthService } from "../services/socialAuthService";
import { RegisterRequest, LoginRequest, SocialAuthRequest } from "../types/auth";

const isProduction = process.env.NODE_ENV === "production";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data: RegisterRequest = req.body;
      const result = await AuthService.register(data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      // 프로덕션에서는 상세한 에러 메시지 숨김
      const message =
        error instanceof Error
          ? isProduction && error.message.includes("이미 존재")
            ? "회원가입에 실패했습니다."
            : error.message
          : "회원가입에 실패했습니다.";
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data: LoginRequest = req.body;
      const result = await AuthService.login(data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      // 프로덕션에서는 일관된 에러 메시지
      const message =
        error instanceof Error
          ? isProduction
            ? "이메일 또는 비밀번호가 올바르지 않습니다."
            : error.message
          : "로그인에 실패했습니다.";
      res.status(401).json({
        success: false,
        message,
      });
    }
  }

  static async socialLogin(req: Request, res: Response) {
    try {
      const data: SocialAuthRequest = req.body;
      const result = await SocialAuthService.authenticate(data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "소셜 로그인에 실패했습니다.";
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
      }

      const user = await AuthService.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          provider: user.provider,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "프로필 조회에 실패했습니다.",
      });
    }
  }
}
