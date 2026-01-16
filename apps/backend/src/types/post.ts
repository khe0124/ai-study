export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  thumbnailImage?: string; // 파일 경로 또는 URL
  attachments: string[]; // 파일 경로 또는 URL 배열
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  thumbnailImage?: Express.Multer.File;
  attachments?: Express.Multer.File[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  thumbnailImage?: Express.Multer.File;
  attachments?: Express.Multer.File[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorEmail?: string;
  thumbnailImage?: string;
  attachments: string[];
  comments: CommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentResponse {
  id: string;
  postId: string;
  authorId: string;
  authorEmail?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
