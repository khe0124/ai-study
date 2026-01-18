import { Comment } from "../types/post";
import { getPool } from "../config/database";

export class CommentModel {
  static async create(
    commentData: Omit<Comment, "id" | "createdAt" | "updatedAt">
  ): Promise<Comment> {
    const pool = getPool();
    const id = `comment_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO comments (id, post_id, author_id, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id,
        commentData.postId,
        commentData.authorId,
        commentData.content,
        now,
        now,
      ]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findById(id: string): Promise<Comment | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM comments WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByPostId(postId: string): Promise<Comment[]> {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC",
      [postId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static async update(
    id: string,
    updates: Partial<Comment>
  ): Promise<Comment | null> {
    const pool = getPool();
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      values.push(updates.content);
    }

    if (updateFields.length === 0) {
      return await this.findById(id);
    }

    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await pool.query(
      `UPDATE comments SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query("DELETE FROM comments WHERE id = $1", [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async deleteByPostId(postId: string): Promise<number> {
    const pool = getPool();
    const result = await pool.query("DELETE FROM comments WHERE post_id = $1", [postId]);
    return result.rowCount || 0;
  }

  // 테스트용: 모든 댓글 삭제
  static async reset(): Promise<void> {
    const pool = getPool();
    await pool.query("DELETE FROM comments");
  }
}
