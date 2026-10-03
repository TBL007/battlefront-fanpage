// types/global.d.ts
export {};

declare global {
  namespace Global {
    interface Post {
      id: string;
      user_id: string;
      title: string;
      content: string;
      image_url: string | null;
      type: "forum";
      created_at: string;
      authorName: string;
      authorImage: string;
      authorAllegiance: boolean;
    }
  }
}
