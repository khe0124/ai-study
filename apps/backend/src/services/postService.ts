import { PostModel } from "../models/Post";
import { CommentModel } from "../models/Comment";
import { UserModel } from "../models/User";
import { withTransaction } from "../config/database";
import {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  PostResponse,
  CommentResponse,
} from "../types/post";
import { getFileUrl, deleteFile } from "../middleware/uploadMiddleware";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  createCacheKey,
} from "../utils/cache";
import { ForbiddenError, NotFoundError } from "../utils/errors";
import path from "path";

export class PostService {
  static async createPost(
    authorId: string,
    data: CreatePostRequest
  ): Promise<PostResponse> {
    const thumbnailImage = data.thumbnailImage
      ? getFileUrl(data.thumbnailImage.path || "")
      : undefined;

    const attachments = (data.attachments || [])
      .filter((file) => file.path)
      .map((file) => getFileUrl(file.path || ""));

    const post = await PostModel.create({
      title: data.title,
      content: data.content,
      authorId,
      thumbnailImage,
      attachments,
    });

    // 게시글 목록 캐시 무효화
    await deleteCachePattern("posts:*");

    // 배치 조회 (단일 사용자지만 일관성을 위해)
    const authorsMap = await UserModel.findByIds([authorId]);
    const author = authorsMap.get(authorId);

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorEmail: author?.email,
      thumbnailImage: post.thumbnailImage,
      attachments: post.attachments,
      comments: [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  static async getPostById(postId: string): Promise<PostResponse | null> {
    const post = await PostModel.findById(postId);
    if (!post) return null;

    // 모든 작성자 ID 수집 (게시글 작성자 + 댓글 작성자)
    const authorIds = new Set<string>([post.authorId]);
    post.comments.forEach((comment) => {
      authorIds.add(comment.authorId);
    });

    // 배치로 모든 작성자 조회 (N+1 쿼리 문제 해결)
    const authorsMap = await UserModel.findByIds(Array.from(authorIds));

    const author = authorsMap.get(post.authorId);

    // 댓글 작성자 정보 포함
    const comments: CommentResponse[] = post.comments.map((comment) => {
      const commentAuthor = authorsMap.get(comment.authorId);
      return {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        authorEmail: commentAuthor?.email,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorEmail: author?.email,
      thumbnailImage: post.thumbnailImage,
      attachments: post.attachments,
      comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  static async getPosts(
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: PostResponse[]; total: number; page: number; limit: number }> {
    // 캐시 키 생성
    const cacheKey = createCacheKey("posts", `page:${page}`, `limit:${limit}`);

    // 캐시에서 조회 시도
    const cached = await getCache<{ posts: PostResponse[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const { posts, total } = await PostModel.findAll(page, limit);

    if (posts.length === 0) {
      return {
        posts: [],
        total,
        page,
        limit,
      };
    }

    // 모든 작성자 ID 수집 (게시글 작성자 + 댓글 작성자)
    const authorIds = new Set<string>();
    posts.forEach((post) => {
      authorIds.add(post.authorId);
      post.comments.forEach((comment) => {
        authorIds.add(comment.authorId);
      });
    });

    // 배치로 모든 작성자 조회 (N+1 쿼리 문제 해결)
    const authorsMap = await UserModel.findByIds(Array.from(authorIds));

    // 게시글과 댓글에 작성자 정보 매핑
    const postsWithAuthors: PostResponse[] = posts.map((post) => {
      const author = authorsMap.get(post.authorId);

      const comments: CommentResponse[] = post.comments.map((comment) => {
        const commentAuthor = authorsMap.get(comment.authorId);
        return {
          id: comment.id,
          postId: comment.postId,
          authorId: comment.authorId,
          authorEmail: commentAuthor?.email,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        };
      });

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        authorEmail: author?.email,
        thumbnailImage: post.thumbnailImage,
        attachments: post.attachments,
        comments,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    const response = {
      posts: postsWithAuthors,
      total,
      page,
      limit,
    };

    // 캐시에 저장 (5분 TTL)
    await setCache(cacheKey, response, 300);

    return response;
  }

  static async updatePost(
    postId: string,
    authorId: string,
    data: UpdatePostRequest
  ): Promise<PostResponse | null> {
    const post = await PostModel.findById(postId);
    if (!post) return null;

    // 작성자 확인
    if (post.authorId !== authorId) {
      throw new ForbiddenError("게시글을 수정할 권한이 없습니다.");
    }

    // 기존 파일 삭제 (새 파일이 업로드된 경우)
    const updates: any = {};

    if (data.title !== undefined) {
      updates.title = data.title;
    }
    if (data.content !== undefined) {
      updates.content = data.content;
    }

    if (data.thumbnailImage) {
      // 기존 썸네일 삭제
      if (post.thumbnailImage) {
        const oldPath = path.join(
          process.cwd(),
          post.thumbnailImage.replace(/^\/uploads\//, "uploads/")
        );
        deleteFile(oldPath);
      }
      updates.thumbnailImage = getFileUrl(data.thumbnailImage.path || "");
    }

    if (data.attachments && data.attachments.length > 0) {
      // 기존 첨부파일은 유지하고 새 파일 추가
      const newAttachments = data.attachments
        .filter((file) => file.path)
        .map((file) => getFileUrl(file.path || ""));
      updates.attachments = [...post.attachments, ...newAttachments];
    }

    const updatedPost = await PostModel.update(postId, updates);
    if (!updatedPost) return null;

    // 게시글 목록 캐시 무효화
    await deleteCachePattern("posts:*");
    // 특정 게시글 캐시도 무효화
    await deleteCache(createCacheKey("post", postId));

    // 모든 작성자 ID 수집
    const authorIds = new Set<string>([updatedPost.authorId]);
    updatedPost.comments.forEach((comment) => {
      authorIds.add(comment.authorId);
    });

    // 배치로 모든 작성자 조회 (N+1 쿼리 문제 해결)
    const authorsMap = await UserModel.findByIds(Array.from(authorIds));

    const author = authorsMap.get(updatedPost.authorId);

    const comments: CommentResponse[] = updatedPost.comments.map((comment) => {
      const commentAuthor = authorsMap.get(comment.authorId);
      return {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        authorEmail: commentAuthor?.email,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });

    return {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      authorId: updatedPost.authorId,
      authorEmail: author?.email,
      thumbnailImage: updatedPost.thumbnailImage,
      attachments: updatedPost.attachments,
      comments,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
    };
  }

  static async deletePost(
    postId: string,
    authorId: string
  ): Promise<boolean> {
    const post = await PostModel.findById(postId);
    if (!post) return false;

    // 작성자 확인
    if (post.authorId !== authorId) {
      throw new ForbiddenError("게시글을 삭제할 권한이 없습니다.");
    }

    // 파일 경로 저장 (DB 삭제 성공 후 삭제하기 위해)
    const filesToDelete: string[] = [];
    
    if (post.thumbnailImage) {
      const thumbnailPath = path.join(
        process.cwd(),
        post.thumbnailImage.replace(/^\/uploads\//, "uploads/")
      );
      filesToDelete.push(thumbnailPath);
    }

    post.attachments.forEach((attachment) => {
      const attachmentPath = path.join(
        process.cwd(),
        attachment.replace(/^\/uploads\//, "uploads/")
      );
      filesToDelete.push(attachmentPath);
    });

    // 트랜잭션으로 DB 삭제 (원자적 처리)
    let success = false;
    try {
      success = await withTransaction(async (client) => {
        // 댓글 삭제
        await client.query("DELETE FROM comments WHERE post_id = $1", [postId]);
        // 게시글 삭제
        const result = await client.query("DELETE FROM posts WHERE id = $1", [postId]);
        return result.rowCount ? result.rowCount > 0 : false;
      });
    } catch (error) {
      // 트랜잭션 실패 시 파일은 삭제하지 않음
      throw error;
    }

    // DB 삭제 성공 시에만 파일 삭제 (파일 삭제 실패는 로그만 남기고 계속)
    if (success) {
      filesToDelete.forEach((filePath) => {
        try {
          deleteFile(filePath);
        } catch (error) {
          // 파일 삭제 실패는 로그만 남기고 계속 진행
          console.error(`Failed to delete file: ${filePath}`, error);
        }
      });

      // 게시글 목록 캐시 무효화
      await deleteCachePattern("posts:*");
      // 특정 게시글 캐시도 무효화
      await deleteCache(createCacheKey("post", postId));
    }

    return success;
  }

  static async createComment(
    postId: string,
    authorId: string,
    data: CreateCommentRequest
  ): Promise<CommentResponse> {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    const comment = await CommentModel.create({
      postId,
      authorId,
      content: data.content,
    });

    // 배치 조회 (단일 사용자지만 일관성을 위해)
    const authorsMap = await UserModel.findByIds([authorId]);
    const author = authorsMap.get(authorId);

    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      authorEmail: author?.email,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  static async updateComment(
    commentId: string,
    authorId: string,
    data: UpdateCommentRequest
  ): Promise<CommentResponse | null> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) return null;

    // 작성자 확인
    if (comment.authorId !== authorId) {
      throw new ForbiddenError("댓글을 수정할 권한이 없습니다.");
    }

    const updatedComment = await CommentModel.update(commentId, {
      content: data.content,
    });

    if (!updatedComment) return null;

    // 배치 조회 (단일 사용자지만 일관성을 위해)
    const authorsMap = await UserModel.findByIds([updatedComment.authorId]);
    const author = authorsMap.get(updatedComment.authorId);

    return {
      id: updatedComment.id,
      postId: updatedComment.postId,
      authorId: updatedComment.authorId,
      authorEmail: author?.email,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
    };
  }

  static async deleteComment(
    commentId: string,
    authorId: string
  ): Promise<boolean> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) return false;

    // 작성자 확인
    if (comment.authorId !== authorId) {
      throw new ForbiddenError("댓글을 삭제할 권한이 없습니다.");
    }

    return await CommentModel.delete(commentId);
  }
}
