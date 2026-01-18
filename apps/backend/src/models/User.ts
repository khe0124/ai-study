import { User } from '../types/auth';
import { getPool } from '../config/database';

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const pool = getPool();
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const result = await pool.query(
      `INSERT INTO users (id, email, password, provider, provider_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        userData.email,
        userData.password || null,
        userData.provider,
        userData.providerId || null,
        now,
        now,
      ]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      provider: row.provider,
      providerId: row.provider_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      provider: row.provider,
      providerId: row.provider_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findById(id: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      provider: row.provider,
      providerId: row.provider_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByProvider(provider: string, providerId: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM users WHERE provider = $1 AND provider_id = $2",
      [provider, providerId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      provider: row.provider,
      providerId: row.provider_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const pool = getPool();
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.password !== undefined) {
      updateFields.push(`password = $${paramIndex++}`);
      values.push(updates.password);
    }
    if (updates.provider !== undefined) {
      updateFields.push(`provider = $${paramIndex++}`);
      values.push(updates.provider);
    }
    if (updates.providerId !== undefined) {
      updateFields.push(`provider_id = $${paramIndex++}`);
      values.push(updates.providerId);
    }

    if (updateFields.length === 0) {
      return await this.findById(id);
    }

    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      provider: row.provider,
      providerId: row.provider_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // 테스트용: 모든 사용자 삭제
  static async reset(): Promise<void> {
    const pool = getPool();
    await pool.query("DELETE FROM users");
  }
}
