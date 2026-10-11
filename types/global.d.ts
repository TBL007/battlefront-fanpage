// types/global.d.ts
export {};

declare global {
  namespace Global {
    interface Post {
      id: string;
      user_id: string;
      title: string;
      content: string | null;
      image_url: string | null;
      type: "forum" | "gallery";
      created_at: string;
      authorName: string;
      authorImage: string | null;
      authorAllegiance: number | boolean;
      /** Present on the single-post endpoint only. */
      likes?: number;
      /** Whether the signed-in user has already liked this post. */
      likedByMe?: boolean;
    }

    interface Comment {
      id: string;
      user_id: string;
      post_id: string;
      /** Set when this comment is a reply to another comment. */
      comment_id: string | null;
      content: string;
      created_at: string;
      authorName: string;
      authorImage: string | null;
      authorAllegiance: number | boolean;
      likes?: number;
      /** Whether the signed-in user has already liked this comment. */
      likedByMe?: boolean;
    }

    /** `/api/forum/[id]` merges the post with its comments. */
    interface PostWithComments extends Post {
      comments: Comment[];
    }

    interface LikedContent {
      likedPosts: (Post & { likedAt: string })[];
      likedComments: (Comment & { likedAt: string })[];
    }

    /** Which OAuth providers a member has connected. */
    interface UserConnections {
      discord: boolean;
      /** Discord snowflake, used to build discord.com/users/<id>. */
      discordUserId: string | null;
    }

    interface PublicUser {
      name: string;
      image: string | null;
      socials: Record<string, unknown> | null;
      createdAt: string;
      allegiance: number | boolean;
      posts: Post[];
      comments: Comment[];
    }
  }
}