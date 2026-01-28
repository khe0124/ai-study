import { User } from '../types/auth';
import { getPool } from '../config/database';

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const pool = getPool();
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    try {
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
    } catch (error) {
      // Supabase "Tenant or user not found" 에러는 보통 테이블이 없거나 RLS 정책 문제
      if (error instanceof Error && error.message.includes("Tenant or user not found")) {
        throw new Error(
          "데이터베이스 테이블이 없거나 접근 권한이 없습니다. " +
          "마이그레이션을 실행했는지 확인하세요: npm run migrate. " +
          "또한 Supabase Dashboard에서 RLS(Row Level Security) 정책을 확인하세요."
        );
      }
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    try {
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
    } catch (error) {
      // Supabase "Tenant or user not found" 에러는 보통 테이블이 없거나 RLS 정책 문제
      if (error instanceof Error && error.message.includes("Tenant or user not found")) {
        throw new Error(
          "데이터베이스 테이블이 없거나 접근 권한이 없습니다. " +
          "마이그레이션을 실행했는지 확인하세요: npm run migrate. " +
          "또한 Supabase Dashboard에서 RLS(Row Level Security) 정책을 확인하세요."
        );
      }
      throw error;
    }
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

  /**
   * 여러 사용자를 한 번에 조회 (N+1 쿼리 문제 해결)
   */
  static async findByIds(ids: string[]): Promise<Map<string, User>> {
    if (ids.length === 0) {
      return new Map();
    }

    const pool = getPool();
    // 중복 제거
    const uniqueIds = Array.from(new Set(ids));
    
    const result = await pool.query(
      `SELECT * FROM users WHERE id = ANY($1::text[])`,
      [uniqueIds]
    );

    const userMap = new Map<string, User>();
    for (const row of result.rows) {
      const user: User = {
        id: row.id,
        email: row.email,
        password: row.password,
        provider: row.provider,
        providerId: row.provider_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      userMap.set(user.id, user);
    }

    return userMap;
  }

  static async findByProvider(provider: string, providerId: string): Promise<User | null> {
    const pool = getPool();
    try {
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
    } catch (error) {
      // Supabase "Tenant or user not found" 에러는 보통 테이블이 없거나 RLS 정책 문제
      if (error instanceof Error && error.message.includes("Tenant or user not found")) {
        throw new Error(
          "데이터베이스 테이블이 없거나 접근 권한이 없습니다. " +
          "마이그레이션을 실행했는지 확인하세요: npm run migrate. " +
          "또한 Supabase Dashboard에서 RLS(Row Level Security) 정책을 확인하세요."
        );
      }
      throw error;
    }
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
