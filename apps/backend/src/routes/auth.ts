import { Router } from "express";
import { AuthController } from "../controllers/authController";
import {
  validateRegister,
  validateLogin,
  validateSocialAuth,
  handleValidationErrors,
} from "../middleware/validationMiddleware";
import { authenticate } from "../middleware/authMiddleware";
import {
  authLimiter,
  registerLimiter,
  socialAuthLimiter,
} from "../middleware/rateLimiter";

const router = Router();

// 회원가입 (Rate limiting 적용)
router.post(
  "/register",
  registerLimiter,
  validateRegister,
  handleValidationErrors,
  AuthController.register
);

// 로그인 (Rate limiting 적용)
router.post(
  "/login",
  authLimiter,
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

// 소셜 로그인 (Rate limiting 적용)
router.post(
  "/social",
  socialAuthLimiter,
  validateSocialAuth,
  handleValidationErrors,
  AuthController.socialLogin
);

// 프로필 조회 (인증 필요)
router.get("/profile", authenticate, AuthController.getProfile);

export default router;
