import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// 업로드 디렉토리 생성
const uploadDir = path.join(process.cwd(), "uploads");
const thumbnailsDir = path.join(uploadDir, "thumbnails");
const attachmentsDir = path.join(uploadDir, "attachments");

// 디렉토리가 없으면 생성
[uploadDir, thumbnailsDir, attachmentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    if (file.fieldname === "thumbnailImage") {
      cb(null, thumbnailsDir);
    } else if (file.fieldname === "attachments") {
      cb(null, attachmentsDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // 파일명: 타임스탬프_랜덤문자열_원본파일명
    const uniqueSuffix = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}_${uniqueSuffix}${ext}`);
  },
});

// 파일 필터 (이미지 및 일반 파일 허용)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // 썸네일은 이미지만 허용
  if (file.fieldname === "thumbnailImage") {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("썸네일은 이미지 파일만 업로드 가능합니다."));
    }
  } else {
    // 첨부파일은 모든 파일 허용 (필요시 제한 가능)
    cb(null, true);
  }
};

// Multer 설정
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // 최대 10개 파일
  },
});

// 썸네일 이미지 업로드 미들웨어
export const uploadThumbnail = upload.single("thumbnailImage");

// 첨부파일 업로드 미들웨어
export const uploadAttachments = upload.array("attachments", 10);

// 썸네일 + 첨부파일 업로드 미들웨어
export const uploadPostFiles = upload.fields([
  { name: "thumbnailImage", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

// 파일 경로를 URL로 변환하는 헬퍼 함수
export function getFileUrl(filePath: string): string {
  if (!filePath) return "";
  // 파일 경로에서 uploads 디렉토리 기준으로 상대 경로 추출
  const uploadsIndex = filePath.indexOf("uploads");
  if (uploadsIndex === -1) return "";
  const relativePath = filePath.substring(uploadsIndex);
  return `/${relativePath.replace(/\\/g, "/")}`;
}

// 파일 삭제 헬퍼 함수
export function deleteFile(filePath: string): void {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`파일 삭제 실패: ${filePath}`, error);
  }
}
