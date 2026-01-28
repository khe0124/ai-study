/**
 * 캐싱 유틸리티
 */

import { getRedisClient, isRedisAvailable } from "../config/redis";
import { logger } from "./logger";

const DEFAULT_TTL = 3600; // 1시간 (초)

/**
 * 캐시에서 값 가져오기
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }

    const value = await client.get(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error) {
    logger.error("Cache Get Error", { error, key });
    return null;
  }
}

/**
 * 캐시에 값 저장
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error("Cache Set Error", { error, key });
    return false;
  }
}

/**
 * 캐시에서 값 삭제
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    await client.del(key);
    return true;
  } catch (error) {
    logger.error("Cache Delete Error", { error, key });
    return false;
  }
}

/**
 * 패턴으로 캐시 삭제 (SCAN 패턴 사용 - 프로덕션 안전)
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    // SCAN을 사용하여 블로킹 없이 키 스캔
    const keys: string[] = [];
    let cursor = 0;

    do {
      const result = await client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100, // 한 번에 스캔할 키 수
      });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== 0);

    // 배치로 삭제 (한 번에 너무 많은 키를 삭제하지 않도록)
    if (keys.length > 0) {
      // 한 번에 최대 1000개씩 삭제
      const batchSize = 1000;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        await client.del(batch);
      }
    }

    return true;
  } catch (error) {
    logger.error("Cache Delete Pattern Error", { error, pattern });
    return false;
  }
}

/**
 * 캐시 키 생성 헬퍼
 */
export function createCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(":")}`;
}
