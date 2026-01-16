import { Post } from "../types/post";
import { CommentModel } from "./Comment";

// 인메모리 데이터베이스
const posts: Map<string, Post> = new Map();

export class PostModel {
  static async create(
    postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "comments">
  ): Promise<Post> {
    const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const post: Post = {
      id,
      ...postData,
      comments: [],
      createdAt: now,
      updatedAt: now,
    };

    posts.set(id, post);
    return post;
  }

  static async findById(id: string): Promise<Post | null> {
    const post = posts.get(id);
    if (!post) return null;

    // 댓글 로드
    const comments = await CommentModel.findByPostId(id);
    return {
      ...post,
      comments,
    };
  }

  static async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: Post[]; total: number }> {
    const allPosts: Post[] = [];

    for (const post of posts.values()) {
      const comments = await CommentModel.findByPostId(post.id);
      allPosts.push({
        ...post,
        comments,
      });
    }

    // 생성일 기준 내림차순 정렬 (최신순)
    allPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allPosts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      total,
    };
  }

  static async findByAuthorId(authorId: string): Promise<Post[]> {
    const authorPosts: Post[] = [];

    for (const post of posts.values()) {
      if (post.authorId === authorId) {
        const comments = await CommentModel.findByPostId(post.id);
        authorPosts.push({
          ...post,
          comments,
        });
      }
    }

    // 생성일 기준 내림차순 정렬
    return authorPosts.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  static async update(
    id: string,
    updates: Partial<Omit<Post, "id" | "createdAt" | "comments">>
  ): Promise<Post | null> {
    const post = posts.get(id);
    if (!post) return null;

    const updatedPost = {
      ...post,
      ...updates,
      updatedAt: new Date(),
    };

    posts.set(id, updatedPost);

    // 댓글 로드
    const comments = await CommentModel.findByPostId(id);
    return {
      ...updatedPost,
      comments,
    };
  }

  static async delete(id: string): Promise<boolean> {
    // 관련 댓글도 삭제
    await CommentModel.deleteByPostId(id);
    return posts.delete(id);
  }

  // 테스트용: 모든 게시글 삭제
  static reset(): void {
    posts.clear();
    CommentModel.reset();
  }
}
