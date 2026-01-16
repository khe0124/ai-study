import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import { validateEnvVariables } from "./config/security";
import { generalLimiter, speedLimiter } from "./middleware/rateLimiter";

dotenv.config();

// 환경 변수 검증
try {
  validateEnvVariables();
} catch (error) {
  console.error(error instanceof Error ? error.message : "환경 변수 검증 실패");
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

// 보안 헤더 설정 (Helmet)
app.use(helmet());

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

// Auth routes
app.use("/api/auth", authRoutes);

// Post routes
app.use("/api/posts", postRoutes);

// 정적 파일 서빙 (업로드된 파일)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // 프로덕션에서는 스택 트레이스 숨김
  if (isProduction) {
    console.error("Internal Server Error:", err.message);
  } else {
    console.error(err.stack);
  }

  res.status(500).json({
    success: false,
    message: isProduction
      ? "서버 오류가 발생했습니다."
      : err.message || "Internal Server Error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server is running on port ${PORT}`);
});
