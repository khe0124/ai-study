import { PostModel } from "../models/Post";
import { CommentModel } from "../models/Comment";
import { UserModel } from "../models/User";
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

    const author = await UserModel.findById(authorId);

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

    const author = await UserModel.findById(post.authorId);

    // 댓글 작성자 정보 포함
    const comments: CommentResponse[] = await Promise.all(
      post.comments.map(async (comment) => {
        const commentAuthor = await UserModel.findById(comment.authorId);
        return {
          id: comment.id,
          postId: comment.postId,
          authorId: comment.authorId,
          authorEmail: commentAuthor?.email,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        };
      })
    );

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
    const { posts, total } = await PostModel.findAll(page, limit);

    const postsWithAuthors: PostResponse[] = await Promise.all(
      posts.map(async (post) => {
        const author = await UserModel.findById(post.authorId);

        const comments: CommentResponse[] = await Promise.all(
          post.comments.map(async (comment) => {
            const commentAuthor = await UserModel.findById(comment.authorId);
            return {
              id: comment.id,
              postId: comment.postId,
              authorId: comment.authorId,
              authorEmail: commentAuthor?.email,
              content: comment.content,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
            };
          })
        );

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
      })
    );

    return {
      posts: postsWithAuthors,
      total,
      page,
      limit,
    };
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
      throw new Error("게시글을 수정할 권한이 없습니다.");
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

    const author = await UserModel.findById(updatedPost.authorId);

    const comments: CommentResponse[] = await Promise.all(
      updatedPost.comments.map(async (comment) => {
        const commentAuthor = await UserModel.findById(comment.authorId);
        return {
          id: comment.id,
          postId: comment.postId,
          authorId: comment.authorId,
          authorEmail: commentAuthor?.email,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        };
      })
    );

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
      throw new Error("게시글을 삭제할 권한이 없습니다.");
    }

    // 파일 삭제
    if (post.thumbnailImage) {
      const thumbnailPath = path.join(
        process.cwd(),
        post.thumbnailImage.replace(/^\/uploads\//, "uploads/")
      );
      deleteFile(thumbnailPath);
    }

    post.attachments.forEach((attachment) => {
      const attachmentPath = path.join(
        process.cwd(),
        attachment.replace(/^\/uploads\//, "uploads/")
      );
      deleteFile(attachmentPath);
    });

    return await PostModel.delete(postId);
  }

  static async createComment(
    postId: string,
    authorId: string,
    data: CreateCommentRequest
  ): Promise<CommentResponse> {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    const comment = await CommentModel.create({
      postId,
      authorId,
      content: data.content,
    });

    const author = await UserModel.findById(authorId);

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
      throw new Error("댓글을 수정할 권한이 없습니다.");
    }

    const updatedComment = await CommentModel.update(commentId, {
      content: data.content,
    });

    if (!updatedComment) return null;

    const author = await UserModel.findById(updatedComment.authorId);

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
      throw new Error("댓글을 삭제할 권한이 없습니다.");
    }

    return await CommentModel.delete(commentId);
  }
}
