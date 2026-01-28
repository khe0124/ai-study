/**
 * Redis 설정 (선택사항)
 * REDIS_URL이 없거나 연결 실패 시 캐싱만 비활성화되고 앱은 정상 동작합니다.
 */

import { createClient, RedisClientType } from "redis";
import { logger } from "../utils/logger";

let redisClient: RedisClientType | null = null;
let isRedisEnabled = false;
let redisErrorLogged = false;

function disableRedis(): void {
  if (redisClient) {
    try {
      if (redisClient.isOpen) redisClient.quit().catch(() => {});
    } catch {
      /* ignore */
    }
    redisClient = null;
  }
  isRedisEnabled = false;
}

export function initRedis(): void {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl || !redisUrl.trim()) {
    logger.warn("Redis URL이 설정되지 않았습니다. 캐싱이 비활성화됩니다.");
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on("error", () => {
      if (!redisErrorLogged) {
        redisErrorLogged = true;
        logger.warn(
          "Redis 연결 실패. 캐싱 비활성화됨. Redis 없이도 앱은 동작합니다. (Redis 사용 시 로컬: redis://localhost:6379, 또는 REDIS_URL 제거)"
        );
      }
      disableRedis();
    });

    redisClient.on("connect", () => {
      redisErrorLogged = false;
      logger.info("Redis Client Connected");
    });

    redisClient
      .connect()
      .then(() => {
        isRedisEnabled = true;
      })
      .catch((err) => {
        logger.warn("Redis Connection Failed. 캐싱 비활성화됨.", {
          message: err instanceof Error ? err.message : String(err),
        });
        disableRedis();
      });
  } catch (error) {
    logger.warn("Redis Initialization Failed. 캐싱 비활성화됨.", {
      message: error instanceof Error ? error.message : String(error),
    });
    redisClient = null;
  }
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!isRedisEnabled || !redisClient) {
    return null;
  }

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return redisClient;
  } catch (error) {
    logger.error("Redis Connection Error", { error });
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    isRedisEnabled = false;
  }
}

export function isRedisAvailable(): boolean {
  return isRedisEnabled && redisClient !== null;
}
