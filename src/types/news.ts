export type NewsContentKind = 'news' | 'video' | 'photo' | 'info';

export type NewsCategory =
  | 'জাতীয়'
  | 'আন্তর্জাতিক'
  | 'অর্থনীতি'
  | 'খেলাধুলা'
  | 'প্রযুক্তি'
  | 'সংস্কৃতি'
  | 'মতামত'
  | 'তথ্য';

export type InfoSubType =
  | 'জরুরি তথ্য'
  | 'আবহাওয়া'
  | 'চাকরি ও শিক্ষা'
  | 'বাজারদর'
  | 'যান চলাচল'
  | 'সাধারণ তথ্য';

export interface NewsItem {
  id: string;
  kind: NewsContentKind;
  title: string;
  summary: string;
  body: string;
  category: string;
  author: string;
  location?: string;
  imageUrl?: string;
  galleryUrls?: string[];
  imageCaption?: string;
  videoUrl?: string;
  videoDuration?: string;
  infoType?: string;
  externalLink?: string;
  isLead?: boolean;
  isBreaking?: boolean;
  readMinutes?: number;
  publishedAt: string;
  views: number;
}

export interface NewsFeedResponse {
  items: NewsItem[];
  editionLabel: string;
  hasPin: boolean;
}
