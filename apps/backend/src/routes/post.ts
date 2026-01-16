import { Router } from "express";
import { PostController } from "../controllers/postController";
import { authenticate } from "../middleware/authMiddleware";
import {
  validateCreatePost,
  validateUpdatePost,
  validateCreateComment,
  validateUpdateComment,
  validatePagination,
  handleValidationErrors,
} from "../middleware/postValidationMiddleware";
import { uploadPostFiles } from "../middleware/uploadMiddleware";

const router = Router();

// 게시글 목록 조회 (인증 불필요)
router.get(
  "/",
  validatePagination,
  handleValidationErrors,
  PostController.getPosts
);

// 게시글 상세 조회 (인증 불필요)
router.get("/:id", PostController.getPost);

// 게시글 작성 (인증 필요)
router.post(
  "/",
  authenticate,
  uploadPostFiles,
  validateCreatePost,
  handleValidationErrors,
  PostController.createPost
);

// 게시글 수정 (인증 필요)
router.put(
  "/:id",
  authenticate,
  uploadPostFiles,
  validateUpdatePost,
  handleValidationErrors,
  PostController.updatePost
);

// 게시글 삭제 (인증 필요)
router.delete("/:id", authenticate, PostController.deletePost);

// 댓글 작성 (인증 필요)
router.post(
  "/:postId/comments",
  authenticate,
  validateCreateComment,
  handleValidationErrors,
  PostController.createComment
);

// 댓글 수정 (인증 필요)
router.put(
  "/:postId/comments/:commentId",
  authenticate,
  validateUpdateComment,
  handleValidationErrors,
  PostController.updateComment
);

// 댓글 삭제 (인증 필요)
router.delete(
  "/:postId/comments/:commentId",
  authenticate,
  PostController.deleteComment
);

export default router;
