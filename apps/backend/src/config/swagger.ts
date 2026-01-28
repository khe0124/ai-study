/**
 * Swagger/OpenAPI 설정
 */

import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";
import path from "path";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Web Service API",
    version: "1.0.0",
    description: "Web Service 백엔드 API 문서",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: process.env.FRONTEND_URL || "http://localhost:3001",
      description: "Development server",
    },
    {
      url: "https://api.example.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "에러 메시지",
          },
          error: {
            type: "object",
            properties: {
              code: {
                type: "string",
                example: "ERROR_CODE",
              },
              details: {
                type: "object",
              },
            },
          },
          timestamp: {
            type: "string",
            format: "date-time",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "user_1234567890_abc123",
          },
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          provider: {
            type: "string",
            enum: ["email", "google", "kakao"],
            example: "email",
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          data: {
            type: "object",
            properties: {
              user: {
                $ref: "#/components/schemas/User",
              },
              token: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
            },
          },
        },
      },
      Post: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "post_1234567890_abc123",
          },
          title: {
            type: "string",
            example: "게시글 제목",
          },
          content: {
            type: "string",
            example: "게시글 내용",
          },
          authorId: {
            type: "string",
            example: "user_1234567890_abc123",
          },
          thumbnailImage: {
            type: "string",
            nullable: true,
            example: "http://localhost:3001/uploads/thumbnails/image.jpg",
          },
          attachments: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["http://localhost:3001/uploads/attachments/file.pdf"],
          },
          comments: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Comment",
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "comment_1234567890_abc123",
          },
          postId: {
            type: "string",
            example: "post_1234567890_abc123",
          },
          authorId: {
            type: "string",
            example: "user_1234567890_abc123",
          },
          content: {
            type: "string",
            example: "댓글 내용",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
  },
};

// 경로를 안전하게 처리
const getApiPaths = () => {
  const cwd = process.cwd();
  // 모노레포 루트에서 실행되는 경우
  if (cwd.endsWith("ai-study")) {
    return [
      path.join(cwd, "apps/backend/src/routes/*.ts"),
      path.join(cwd, "apps/backend/src/controllers/*.ts"),
      path.join(cwd, "apps/backend/src/index.ts"),
    ];
  }
  // backend 디렉토리에서 직접 실행되는 경우
  return [
    path.join(cwd, "src/routes/*.ts"),
    path.join(cwd, "src/controllers/*.ts"),
    path.join(cwd, "src/index.ts"),
  ];
};

const options = {
  definition: swaggerDefinition,
  apis: getApiPaths(),
};

let swaggerSpec: any;
try {
  swaggerSpec = swaggerJsdoc(options);
  if (!swaggerSpec || !swaggerSpec.paths) {
    throw new Error("Swagger spec이 올바르게 생성되지 않았습니다.");
  }
} catch (error: any) {
  console.error("⚠️  Swagger spec 생성 실패:", error?.message || error);
  console.error("   경로:", options.apis);
  // 기본 spec 반환 (서버 시작은 계속됨)
  swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "Web Service API",
      version: "1.0.0",
      description: "Swagger spec 생성 중 오류가 발생했습니다. API는 정상 작동합니다.",
    },
    paths: {},
  };
}

export { swaggerSpec };
