import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { INPUT_LIMITS, normalizeEmail } from "../config/security";

export const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요.")
    .isLength({ max: INPUT_LIMITS.EMAIL_MAX_LENGTH })
    .withMessage(`이메일은 최대 ${INPUT_LIMITS.EMAIL_MAX_LENGTH}자까지 입력 가능합니다.`)
    .customSanitizer((value) => normalizeEmail(value)),
  body("password")
    .isLength({ 
      min: INPUT_LIMITS.PASSWORD_MIN_LENGTH, 
      max: INPUT_LIMITS.PASSWORD_MAX_LENGTH 
    })
    .withMessage(
      `비밀번호는 ${INPUT_LIMITS.PASSWORD_MIN_LENGTH}자 이상 ${INPUT_LIMITS.PASSWORD_MAX_LENGTH}자 이하여야 합니다.`
    )
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("비밀번호는 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다.")
    .trim(),
];

export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요.")
    .isLength({ max: INPUT_LIMITS.EMAIL_MAX_LENGTH })
    .withMessage(`이메일은 최대 ${INPUT_LIMITS.EMAIL_MAX_LENGTH}자까지 입력 가능합니다.`)
    .customSanitizer((value) => normalizeEmail(value)),
  body("password")
    .notEmpty()
    .withMessage("비밀번호를 입력해주세요.")
    .isLength({ max: INPUT_LIMITS.PASSWORD_MAX_LENGTH })
    .withMessage(`비밀번호는 최대 ${INPUT_LIMITS.PASSWORD_MAX_LENGTH}자까지 입력 가능합니다.`)
    .trim(),
];

export const validateSocialAuth = [
  body("provider")
    .isIn(["google", "kakao"])
    .withMessage("지원하는 소셜 로그인 제공자는 google, kakao입니다."),
  body("accessToken")
    .notEmpty()
    .withMessage("accessToken이 필요합니다.")
    .isLength({ max: INPUT_LIMITS.TOKEN_MAX_LENGTH })
    .withMessage(`토큰 길이가 너무 깁니다.`),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};
