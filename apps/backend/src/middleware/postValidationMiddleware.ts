import { body, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateCreatePost = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("제목을 입력해주세요.")
    .isLength({ min: 1, max: 200 })
    .withMessage("제목은 1자 이상 200자 이하여야 합니다."),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("내용을 입력해주세요.")
    .isLength({ min: 1, max: 10000 })
    .withMessage("내용은 1자 이상 10000자 이하여야 합니다."),
];

export const validateUpdatePost = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("제목은 1자 이상 200자 이하여야 합니다."),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("내용은 1자 이상 10000자 이하여야 합니다."),
];

export const validateCreateComment = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("댓글 내용을 입력해주세요.")
    .isLength({ min: 1, max: 1000 })
    .withMessage("댓글은 1자 이상 1000자 이하여야 합니다."),
];

export const validateUpdateComment = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("댓글 내용을 입력해주세요.")
    .isLength({ min: 1, max: 1000 })
    .withMessage("댓글은 1자 이상 1000자 이하여야 합니다."),
];

export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("페이지는 1 이상의 정수여야 합니다.")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit은 1 이상 100 이하의 정수여야 합니다.")
    .toInt(),
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
