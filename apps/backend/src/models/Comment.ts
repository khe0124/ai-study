import { Comment } from "../types/post";

// 인메모리 데이터베이스
const comments: Map<string, Comment> = new Map();

export class CommentModel {
  static async create(
    commentData: Omit<Comment, "id" | "createdAt" | "updatedAt">
  ): Promise<Comment> {
    const id = `comment_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const now = new Date();

    const comment: Comment = {
      id,
      ...commentData,
      createdAt: now,
      updatedAt: now,
    };

    comments.set(id, comment);
    return comment;
  }

  static async findById(id: string): Promise<Comment | null> {
    return comments.get(id) || null;
  }

  static async findByPostId(postId: string): Promise<Comment[]> {
    const postComments: Comment[] = [];
    for (const comment of comments.values()) {
      if (comment.postId === postId) {
        postComments.push(comment);
      }
    }
    // 생성일 기준 오름차순 정렬
    return postComments.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  static async update(
    id: string,
    updates: Partial<Comment>
  ): Promise<Comment | null> {
    const comment = comments.get(id);
    if (!comment) return null;

    const updatedComment = {
      ...comment,
      ...updates,
      updatedAt: new Date(),
    };

    comments.set(id, updatedComment);
    return updatedComment;
  }

  static async delete(id: string): Promise<boolean> {
    return comments.delete(id);
  }

  static async deleteByPostId(postId: string): Promise<number> {
    let deletedCount = 0;
    const commentsToDelete: string[] = [];

    for (const [id, comment] of comments.entries()) {
      if (comment.postId === postId) {
        commentsToDelete.push(id);
      }
    }

    for (const id of commentsToDelete) {
      if (comments.delete(id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // 테스트용: 모든 댓글 삭제
  static reset(): void {
    comments.clear();
  }
}
