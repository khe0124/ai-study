import { User } from '../types/auth';

// 간단한 인메모리 데이터베이스 (실제 프로젝트에서는 DB 사용)
// 프로덕션에서는 PostgreSQL, MongoDB 등을 사용하세요
const users: Map<string, User> = new Map();

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    
    users.set(id, user);
    return user;
  }

  static async findByEmail(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  static async findById(id: string): Promise<User | null> {
    return users.get(id) || null;
  }

  static async findByProvider(provider: string, providerId: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.provider === provider && user.providerId === providerId) {
        return user;
      }
    }
    return null;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    
    users.set(id, updatedUser);
    return updatedUser;
  }

  // 테스트용: 모든 사용자 삭제
  static reset(): void {
    users.clear();
  }
}
