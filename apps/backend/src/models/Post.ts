import { Post } from "../types/post";
import { CommentModel } from "./Comment";
import { getPool } from "../config/database";

export class PostModel {
  static async create(
    postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "comments">
  ): Promise<Post> {
    const pool = getPool();
    const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // attachments 배열을 PostgreSQL 배열로 변환
    const attachmentsArray = postData.attachments || [];

    const result = await pool.query(
      `INSERT INTO posts (id, title, content, author_id, thumbnail_image, attachments, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        postData.title,
        postData.content,
        postData.authorId,
        postData.thumbnailImage || null,
        attachmentsArray,
        now,
        now,
      ]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      authorId: row.author_id,
      thumbnailImage: row.thumbnail_image,
      attachments: row.attachments || [],
      comments: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findById(id: string): Promise<Post | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const comments = await CommentModel.findByPostId(id);

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      authorId: row.author_id,
      thumbnailImage: row.thumbnail_image,
      attachments: row.attachments || [],
      comments,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: Post[]; total: number }> {
    const pool = getPool();
    const offset = (page - 1) * limit;

    // 전체 개수 조회
    const countResult = await pool.query("SELECT COUNT(*) as total FROM posts");
    const total = parseInt(countResult.rows[0].total);

    // 페이지네이션된 게시글 조회
    const result = await pool.query(
      `SELECT * FROM posts 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const posts: Post[] = [];
    for (const row of result.rows) {
      const comments = await CommentModel.findByPostId(row.id);
      posts.push({
        id: row.id,
        title: row.title,
        content: row.content,
        authorId: row.author_id,
        thumbnailImage: row.thumbnail_image,
        attachments: row.attachments || [],
        comments,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return { posts, total };
  }

  static async findByAuthorId(authorId: string): Promise<Post[]> {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC",
      [authorId]
    );

    const posts: Post[] = [];
    for (const row of result.rows) {
      const comments = await CommentModel.findByPostId(row.id);
      posts.push({
        id: row.id,
        title: row.title,
        content: row.content,
        authorId: row.author_id,
        thumbnailImage: row.thumbnail_image,
        attachments: row.attachments || [],
        comments,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return posts;
  }

  static async update(
    id: string,
    updates: Partial<Omit<Post, "id" | "createdAt" | "comments">>
  ): Promise<Post | null> {
    const pool = getPool();
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      values.push(updates.content);
    }
    if (updates.thumbnailImage !== undefined) {
      updateFields.push(`thumbnail_image = $${paramIndex++}`);
      values.push(updates.thumbnailImage);
    }
    if (updates.attachments !== undefined) {
      updateFields.push(`attachments = $${paramIndex++}`);
      values.push(updates.attachments);
    }

    if (updateFields.length === 0) {
      return await this.findById(id);
    }

    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await pool.query(
      `UPDATE posts SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const comments = await CommentModel.findByPostId(id);

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      authorId: row.author_id,
      thumbnailImage: row.thumbnail_image,
      attachments: row.attachments || [],
      comments,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const pool = getPool();
    // 관련 댓글도 삭제
    await CommentModel.deleteByPostId(id);
    const result = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // 테스트용: 모든 게시글 삭제
  static async reset(): Promise<void> {
    const pool = getPool();
    await pool.query("DELETE FROM posts");
    await CommentModel.reset();
  }
}
