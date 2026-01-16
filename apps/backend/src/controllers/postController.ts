import { Request, Response } from "express";
import { PostService } from "../services/postService";
import {
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../types/post";

const isProduction = process.env.NODE_ENV === "production";

export class PostController {
  static async createPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
      }

      const data: CreatePostRequest = {
        title: req.body.title,
        content: req.body.content,
        thumbnailImage: req.file || (req.files as any)?.thumbnailImage?.[0],
        attachments: (req.files as any)?.attachments || [],
      };

      const result = await PostService.createPost(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "게시글 작성에 실패했습니다.";
      res.status(400).json({
        success: false,
        message: isProduction && !(error instanceof Error)
          ? "게시글 작성에 실패했습니다."
          : message,
      });
    }
  }

  static async getPost(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const post = await PostService.getPostById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "게시글을 찾을 수 없습니다.",
        });
      }

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "게시글 조회에 실패했습니다.",
      });
    }
  }

  static async getPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PostService.getPosts(page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "게시글 목록 조회에 실패했습니다.",
      });
    }
  }

  static async updatePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
      }

      const postId = req.params.id;
      const data: UpdatePostRequest = {
        title: req.body.title,
        content: req.body.content,
        thumbnailImage: req.file || (req.files as any)?.thumbnailImage?.[0],
        attachments: (req.files as any)?.attachments || [],
      };

      const result = await PostService.updatePost(
        postId,
        req.user.userId,
        data
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "게시글을 찾을 수 없습니다.",
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "게시글 수정에 실패했습니다.";
      const statusCode =
        error instanceof Error && message.includes("권한") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: isProduction && !(error instanceof Error)
          ? "게시글 수정에 실패했습니다."
          : message,
      });
    }
  }

  static async deletePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
      }

      const postId = req.params.id;
      const success = await PostService.deletePost(postId, req.user.userId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "게시글을 찾을 수 없습니다.",
        });
      }

      res.status(200).json({
        success: true,
        message: "게시글이 삭제되었습니다.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.";
      const statusCode =
        error instanceof Error && message.includes("권한") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: isProduction && !(error instanceof Error)
          ? "게시글 삭제에 실패했습니다."
          : message,
      });
    }
  }

  static async createComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
      }

      const postId = req.params.postId;
      const data: CreateCommentRequest = {
        content: req.body.content,
      };

      const result = await PostService.createComment(
        postId,
        req.user.userId,
        data
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "댓글 작성에 실패했습니다.";
      res.status(400).json({
        success: false,
        message: isProduction && !(error instanceof Error)
          ? "댓글 작성에 실패했습니다."
          : message,
      });
    }
  }

  static async updateComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
      }

      const commentId = req.params.commentId;
      const data: UpdateCommentRequest = {
        content: req.body.content,
      };

      const result = await PostService.updateComment(
        commentId,
        req.user.userId,
        data
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "댓글을 찾을 수 없습니다.",
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "댓글 수정에 실패했습니다.";
      const statusCode =
        error instanceof Error && message.includes("권한") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: isProduction && !(error instanceof Error)
          ? "댓글 수정에 실패했습니다."
          : message,
      });
    }
  }

  static async deleteComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
      }

      const commentId = req.params.commentId;
      const success = await PostService.deleteComment(
        commentId,
        req.user.userId
      );

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "댓글을 찾을 수 없습니다.",
        });
      }

      res.status(200).json({
        success: true,
        message: "댓글이 삭제되었습니다.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.";
      const statusCode =
        error instanceof Error && message.includes("권한") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: isProduction && !(error instanceof Error)
          ? "댓글 삭제에 실패했습니다."
          : message,
      });
    }
  }
}
