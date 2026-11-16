export type VideoSourceType =
  | { type: 'youtube'; embedUrl: string }
  | { type: 'vimeo'; embedUrl: string }
  | { type: 'direct'; src: string }
  | { type: 'external'; url: string };

export function parseVideoSource(rawUrl?: string): VideoSourceType | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;

  // YouTube (watch, youtu.be, shorts, embed)
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Local uploaded video or direct video stream
  if (
    url.startsWith('/uploads/') ||
    url.startsWith('blob:') ||
    url.startsWith('data:video/') ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
  ) {
    return {
      type: 'direct',
      src: url,
    };
  }

  return {
    type: 'external',
    url,
  };
}

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(input: number | string): string {
  return String(input).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)] ?? digit);
}

export function formatBengaliRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'সাম্প্রতিক';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 2) return 'এইমাত্র';
  if (diffMins < 60) return `${toBengaliDigits(diffMins)} মিনিট আগে`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${toBengaliDigits(diffHours)} ঘণ্টা আগে`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 7) return `${toBengaliDigits(diffDays)} দিন আগে`;

  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatBengaliHeaderDate(): string {
  return new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে'));
    reader.readAsDataURL(file);
  });
}

export const NEWSROOM_CATEGORIES = [
  'জাতীয়',
  'আন্তর্জাতিক',
  'অর্থনীতি',
  'খেলাধুলা',
  'প্রযুক্তি',
  'সংস্কৃতি',
  'মতামত',
  'তথ্য',
] as const;

export const INFO_SUBTYPES = [
  'জরুরি তথ্য',
  'আবহাওয়া',
  'চাকরি ও শিক্ষা',
  'বাজারদর',
  'যান চলাচল',
  'সাধারণ তথ্য',
] as const;
