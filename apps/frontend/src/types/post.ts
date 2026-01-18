export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorEmail?: string;
  thumbnailImage?: string;
  attachments: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface PostResponse {
  success: boolean;
  data: Post;
}
