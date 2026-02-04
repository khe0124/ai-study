import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import { validateEnvVariables } from "./config/security";
import { generalLimiter, speedLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { logger, stream } from "./utils/logger";
import {
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  initSentry,
} from "./config/sentry";
import swaggerUi from "swagger-ui-express";
import { initRedis, closeRedis } from "./config/redis";
import { closePool } from "./config/database";

dotenv.config();

console.log("🚀 Starting backend server...");

// Swagger spec 로드 (에러 발생 시에도 서버는 시작되도록)
import { swaggerSpec } from "./config/swagger";
console.log("✅ Swagger spec imported");

// Sentry 초기화 (가장 먼저 실행)
try {
  initSentry();
  console.log("✅ Sentry initialized");
} catch (error) {
  console.error("⚠️  Sentry initialization failed:", error);
}

// Redis 초기화 (선택사항)
try {
  initRedis();
  console.log("✅ Redis initialized (if configured)");
} catch (error) {
  console.error("⚠️  Redis initialization failed:", error);
}

// 에러 핸들링을 위한 전역 핸들러 (서버 시작 후 설정)
// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  logger.info("SIGTERM received, shutting down gracefully");
  
  try {
    await closeRedis();
    await closePool();
    logger.info("All connections closed successfully");
  } catch (error) {
    logger.error("Error during graceful shutdown", { error });
  }
  
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  logger.info("SIGINT received, shutting down gracefully");
  
  try {
    await closeRedis();
    await closePool();
    logger.info("All connections closed successfully");
  } catch (error) {
    logger.error("Error during graceful shutdown", { error });
  }
  
  process.exit(0);
});

// 에러 핸들링 (서버 시작 후 설정)
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  logger.error("Uncaught Exception", { error });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

// 환경 변수 검증
try {
  validateEnvVariables();
  console.log("✅ Environment variables validated");
} catch (error) {
  console.error("❌ Environment variable validation failed:", error);
  logger.error("Environment variable validation failed", { error });
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Production environment requires valid environment variables");
    process.exit(1);
  }
  // 개발 환경에서는 경고만 출력하고 계속 진행
  console.warn("⚠️  개발 환경이므로 서버를 계속 실행합니다.");
}

const app = express();
const PORT = process.env.PORT || 3002;
const isProduction = process.env.NODE_ENV === "production";

console.log(`📝 Port: ${PORT}, Environment: ${process.env.NODE_ENV || "development"}`);

// Sentry 요청 핸들러 (가장 먼저)
app.use(sentryRequestHandler);
app.use(sentryTracingHandler());

// HTTP 요청 로깅 (Morgan)
app.use(
  morgan("combined", {
    stream,
    skip: (req, res) => {
      // Health check는 로깅 제외
      return req.path === "/health" || req.path === "/api/health";
    },
  }),
);

// 보안 헤더 설정 (Helmet) - Swagger UI를 위한 CSP 예외 추가
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.jsdelivr.net",
        ],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

// CORS 설정
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : ["http://localhost:3000"];

    // 개발 환경에서는 origin이 없는 경우 허용 (Postman 등)
    if (!origin && !isProduction) {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS 정책에 의해 차단되었습니다."));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parser 설정 (크기 제한)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use(generalLimiter);
app.use(speedLimiter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "backend",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "backend-api",
    timestamp: new Date().toISOString(),
  });
});

// Swagger API 문서
try {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info("Swagger UI initialized at /api-docs");
} catch (error) {
  logger.error("Swagger UI initialization failed", { error });
}

// Auth routes
app.use("/api/auth", authRoutes);

// Post routes
app.use("/api/posts", postRoutes);

// 정적 파일 서빙 (업로드된 파일) - 보안 헤더 추가
app.use("/uploads", (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Disposition", "attachment");
  res.setHeader("Cache-Control", "private, no-cache");
  next();
}, express.static(path.join(process.cwd(), "uploads")));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    timestamp: new Date().toISOString(),
  });
});

// Sentry 에러 핸들러 (에러 핸들러 전에)
app.use(sentryErrorHandler);

// 전역 에러 핸들러
app.use(errorHandler);

app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info(`Backend server is running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
}).on("error", (error: any) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Try: lsof -ti:${PORT} | xargs kill -9`);
  } else {
    console.error("❌ Server failed to start:", error);
  }
  process.exit(1);
});
