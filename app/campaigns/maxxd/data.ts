export type CreatorStatus = "ON_TRACK" | "WATCH" | "SLOW";

export interface Creator {
  name: string;
  handle: string | null;
  tier: string;
  posts: number;
  uniqueVideos: number;
  totalViews: number;
  status: CreatorStatus;
  profiles: {
    instagram: string | null;
    tiktok: string | null;
    youtube: string | null;
    facebook: string | null;
  };
}

export interface Platform {
  name: string;
  posts: number;
  views: number;
  likes: number;
  comments: number;
}

export interface DailyView {
  date: string;
  views: number;
}

export interface TopPost {
  rank: number;
  creator: string;
  platform: "instagram" | "tiktok" | "youtube" | "facebook";
  views: number;
  likes: number;
  engagement: number;
  date: string;
  title: string;
  url: string;
}

export const campaignMeta = {
  client: "Maxxd",
  type: "Fitness app",
  status: "Live",
  day: 26,
  totalDays: 30,
  dataAsOf: "Apr 14, 2026",
  month: "MARCH 2026",
} as const;

export const headlineMetrics = [
  { value: 575104, label: "Total Views", caption: "across 4 platforms" },
  { value: 262, label: "Total Posts", caption: "in 26 days" },
  { value: 70, label: "Unique Videos", caption: "original content pieces" },
  { value: 9721, label: "Engagements", caption: "likes + comments" },
] as const;

export const creators: Creator[] = [
  {
    name: "Anh Pham",
    handle: "@millie.bikini",
    tier: "Inner Circle",
    posts: 83,
    uniqueVideos: 22,
    totalViews: 240317,
    status: "WATCH",
    profiles: {
      instagram: "https://www.instagram.com/millie.bikini/",
      tiktok: "https://www.tiktok.com/@millie.bikini",
      youtube: "https://www.youtube.com/@millie.bikini",
      facebook: "https://www.facebook.com/61578440877676",
    },
  },
  {
    name: "jayc",
    handle: "@fitnesswithjayc",
    tier: "Level 2",
    posts: 60,
    uniqueVideos: 14,
    totalViews: 164888,
    status: "ON_TRACK",
    profiles: {
      instagram: "https://www.instagram.com/fitnesswithjayc/",
      tiktok: "https://www.tiktok.com/@fitnesswithjayc",
      youtube: "https://www.youtube.com/@fitnesswithjayc",
      facebook: "https://www.facebook.com/61579509345792",
    },
  },
  {
    name: "Kevin Bui",
    handle: "@kevxlifestyle",
    tier: "Inner Circle",
    posts: 79,
    uniqueVideos: 24,
    totalViews: 103867,
    status: "WATCH",
    profiles: {
      instagram: "https://www.instagram.com/kevxlifestyle/",
      tiktok: "https://www.tiktok.com/@kevxlifestyle",
      youtube: "https://www.youtube.com/@kevxlifestyle",
      facebook: null,
    },
  },
  {
    name: "PaulAngelo Cometa",
    handle: "@fitnesswith_paul",
    tier: "Inner Circle",
    posts: 28,
    uniqueVideos: 7,
    totalViews: 44968,
    status: "ON_TRACK",
    profiles: {
      instagram: "https://www.instagram.com/fitnesswith_paul/",
      tiktok: "https://www.tiktok.com/@fitnesswithpaul3",
      youtube: "https://www.youtube.com/@paulsfitnessandlifestyle",
      facebook: "https://www.facebook.com/61575462467789",
    },
  },
  {
    name: "Evan Lukas",
    handle: null,
    tier: "Inner Circle",
    posts: 8,
    uniqueVideos: 2,
    totalViews: 13237,
    status: "ON_TRACK",
    profiles: { instagram: null, tiktok: null, youtube: null, facebook: null },
  },
  {
    name: "Amy Phu",
    handle: "@ami.bikini",
    tier: "Inner Circle",
    posts: 4,
    uniqueVideos: 1,
    totalViews: 7827,
    status: "ON_TRACK",
    profiles: {
      instagram: null,
      tiktok: "https://www.tiktok.com/@ami.bikini",
      youtube: null,
      facebook: null,
    },
  },
];

export const platforms: Platform[] = [
  { name: "YouTube", posts: 74, views: 342301, likes: 3919, comments: 164 },
  { name: "Instagram", posts: 71, views: 156495, likes: 3461, comments: 217 },
  { name: "TikTok", posts: 71, views: 45113, likes: 2341, comments: 112 },
  { name: "Facebook", posts: 46, views: 31195, likes: 0, comments: 0 },
];

export const dailyViews: DailyView[] = [
  { date: "2026-03-20", views: 953 },
  { date: "2026-03-21", views: 1976 },
  { date: "2026-03-22", views: 29916 },
  { date: "2026-03-23", views: 31427 },
  { date: "2026-03-24", views: 8120 },
  { date: "2026-03-25", views: 6468 },
  { date: "2026-03-26", views: 5977 },
  { date: "2026-03-27", views: 9632 },
  { date: "2026-03-28", views: 25045 },
  { date: "2026-03-29", views: 5785 },
  { date: "2026-03-30", views: 11662 },
  { date: "2026-03-31", views: 11044 },
  { date: "2026-04-01", views: 8502 },
  { date: "2026-04-02", views: 18282 },
  { date: "2026-04-03", views: 24988 },
  { date: "2026-04-04", views: 15225 },
  { date: "2026-04-05", views: 50411 },
  { date: "2026-04-06", views: 17362 },
  { date: "2026-04-07", views: 34293 },
  { date: "2026-04-08", views: 35843 },
  { date: "2026-04-09", views: 46239 },
  { date: "2026-04-10", views: 33032 },
  { date: "2026-04-11", views: 35977 },
  { date: "2026-04-12", views: 48181 },
  { date: "2026-04-13", views: 30596 },
  { date: "2026-04-14", views: 27165 },
];

export const topPosts: TopPost[] = [
  { rank: 1, creator: "Anh Pham", platform: "instagram", views: 37934, likes: 1303, engagement: 3.56, date: "2026-03-23", title: "u're delusional af brooo 😭🙏🏻", url: "https://www.instagram.com/reel/DWNLn5pgSin/" },
  { rank: 2, creator: "Anh Pham", platform: "youtube", views: 31039, likes: 290, engagement: 0.96, date: "2026-04-04", title: "fat loss = consistency, food choice, flexibility", url: "https://www.youtube.com/watch?v=y0EM2GbYZIw" },
  { rank: 3, creator: "Anh Pham", platform: "youtube", views: 29956, likes: 197, engagement: 0.69, date: "2026-04-06", title: "fat loss = food choice + consistency + flexibility", url: "https://www.youtube.com/watch?v=tvgdfrUcpQY" },
  { rank: 4, creator: "Anh Pham", platform: "youtube", views: 28132, likes: 423, engagement: 1.51, date: "2026-04-08", title: "The 80/20 golden rule for your weight loss", url: "https://www.youtube.com/watch?v=is3LQ7FiCmo" },
  { rank: 5, creator: "jayc", platform: "youtube", views: 23008, likes: 200, engagement: 0.91, date: "2026-03-31", title: "Comment \"MAXXD\" and I'll send you the app", url: "https://www.youtube.com/watch?v=Bc87RXl6ehs" },
  { rank: 6, creator: "jayc", platform: "youtube", views: 22529, likes: 424, engagement: 1.94, date: "2026-04-09", title: "Comment \"MAXXD\" and I'll send you the app", url: "https://www.youtube.com/watch?v=8hxFDgP_O-g" },
  { rank: 7, creator: "Anh Pham", platform: "instagram", views: 18457, likes: 533, engagement: 2.95, date: "2026-03-22", title: "don't worry bruhh NO ONE is texting u 🥀😭", url: "https://www.instagram.com/reel/DWKmsVqgd7C/" },
  { rank: 8, creator: "jayc", platform: "youtube", views: 16807, likes: 303, engagement: 1.87, date: "2026-04-06", title: "Day 3, Comment MAXXD for the app", url: "https://www.youtube.com/watch?v=KeWV7Bglvds" },
  { rank: 9, creator: "Kevin Bui", platform: "youtube", views: 14315, likes: 91, engagement: 0.64, date: "2026-04-01", title: "Eat This EVERYDAY!", url: "https://www.youtube.com/watch?v=ic7PRDyLNtI" },
  { rank: 10, creator: "jayc", platform: "youtube", views: 13564, likes: 174, engagement: 1.35, date: "2026-04-05", title: "Comment \"MAXXD\" and I'll send you the app", url: "https://www.youtube.com/watch?v=5zvdDPE94zI" },
  { rank: 11, creator: "jayc", platform: "youtube", views: 12937, likes: 38, engagement: 0.36, date: "2026-04-08", title: "Comment \"MAXXD\" and I'll send you the app", url: "https://www.youtube.com/watch?v=QudkMyOr2yk" },
  { rank: 12, creator: "jayc", platform: "youtube", views: 12860, likes: 302, engagement: 2.48, date: "2026-04-11", title: "Comment \"MAXXD\" and I'll send you the app", url: "https://www.youtube.com/watch?v=OuUcG0rYS8o" },
];

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
