import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
    }

    // Supabase 풀러(Transaction mode)인데 쿼리 파라미터가 없으면 pgbouncer 호환 추가
    const connectionString =
      databaseUrl.includes('pooler.supabase.com') && !databaseUrl.includes('?')
        ? `${databaseUrl}?pgbouncer=true`
        : databaseUrl;

    // 환경 변수에서 설정값 읽기 (기본값 제공)
    // Docker 내부 PostgreSQL은 SSL 불필요, Supabase 등 외부 DB는 SSL 필요
    const useSSL = databaseUrl.includes('supabase.com') || process.env.DB_SSL === 'true';

    const poolConfig: PoolConfig & { family?: number } = {
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: parseInt(
        process.env.DB_CONNECTION_TIMEOUT || '15000',
        10,
      ),
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      allowExitOnIdle: false,
      family: 4, // IPv4만 사용 (일부 환경에서 DNS/연결 안정성)
    };

    pool = new Pool(poolConfig);

    // 연결 풀 이벤트 핸들링
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    pool.on('connect', () => {
      // 연결 성공 시 로깅 (개발 환경에서만)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Database connection established');
      }
    });
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * 트랜잭션 헬퍼 함수
 * 여러 작업을 원자적으로 실행
 */
export async function withTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
