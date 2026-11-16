import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

interface NewsItemRecord {
  id: string;
  kind: 'news' | 'video' | 'photo' | 'info';
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

interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}

interface NewsDatabase {
  editionLabel: string;
  editorPinHash: string | null;
  items: NewsItemRecord[];
  subscribers?: NewsletterSubscriber[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'news_db.json');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

function createSeedDatabase(): NewsDatabase {
  const now = Date.now();
  const minutesAgo = (mins: number) => new Date(now - mins * 60000).toISOString();

  return {
    editionLabel: 'ঢাকা ও কলকাতা সংস্করণ · সরাসরি সংবাদ ডেস্ক',
    editorPinHash: null,
    items: [
      {
        id: 'nb7-lead-metro',
        kind: 'news',
        title: 'সন্ধ্যার শহরে মেট্রোরেলের নতুন সম্প্রসারণ: সময় বাঁচবে ৪০ মিনিট, বাড়ছে যাত্রীসেবা',
        summary:
          'নতুন উড়াল করিডোর চালু হওয়ায় কর্মব্যস্ত সন্ধ্যায় শহরের প্রধান সংযোগ সড়কের যানজট উল্লেখযোগ্যভাবে কমেছে। প্রতিদিন আরও দুই লাখ যাত্রী দ্রুত যাতায়াতের সুবিধা পাবেন।',
        body:
          'ব্যস্ত শহরের নিত্যযাত্রীদের দীর্ঘ প্রতীক্ষার অবসান ঘটিয়ে আজ সন্ধ্যা থেকে নতুন মেট্রোরেল সম্প্রসারিত রুটে নিয়মিত যাত্রী পরিবহন শুরু হয়েছে। আধুনিক সিগন্যালিং ব্যবস্থা ও স্বয়ংক্রিয় টিকিটিং সুবিধার কারণে প্রতি চার মিনিট অন্তর ট্রেন চলাচল করবে বলে জানিয়েছে কর্তৃপক্ষ।\n\nসরেজমিনে দেখা গেছে, অফিস ফেরত মানুষ মাত্র পনেরো মিনিটে শহরের এক প্রান্ত থেকে অন্য প্রান্তে পৌঁছে যাচ্ছেন। এর ফলে প্রধান সড়কগুলোতে বাস ও ব্যক্তিগত গাড়ির চাপ কমেছে। পরিবহন বিশেষজ্ঞদের মতে, এই করিডোর পূর্ণ ক্ষমতায় চালু হলে প্রতিদিন প্রায় চল্লিশ মিনিট করে কর্মঘণ্টা সাশ্রয় হবে।\n\nনিরাপত্তা ও নারী যাত্রীদের স্বাচ্ছন্দ্যের জন্য প্রতিটি স্টেশনে বাড়তি আলো, সিসিটিভি নজরদারি এবং জরুরি সহায়তা কেন্দ্র স্থাপন করা হয়েছে। আগামী সপ্তাহ থেকেই রাত ১১টা পর্যন্ত বর্ধিত সময়সূচি কার্যকর করার পরিকল্পনা রয়েছে।',
        category: 'জাতীয়',
        author: 'নিউজ বাংলা ৭ ডেস্ক',
        location: 'মেট্রো করিডোর',
        imageUrl: '/src/assets/images/lead_story_metro_1794866695830.jpg',
        imageCaption: 'সন্ধ্যার ব্যস্ত সময়ে নতুন মেট্রো করিডোর ও নিচের সড়কে যানবাহন চলাচল। ছবি: নিউজ বাংলা ৭',
        isLead: true,
        isBreaking: true,
        readMinutes: 3,
        publishedAt: minutesAgo(14),
        views: 1840,
      },
      {
        id: 'nb7-economy-port',
        kind: 'news',
        title: 'নদীবন্দর ও কন্টেইনার টার্মিনালে পণ্য খালাসে নতুন গতি, রপ্তানি আয়ে ইতিবাচক সূচক',
        summary:
          'স্বয়ংক্রিয় ক্রেন ও ডিজিটাল কাস্টমস ক্লিয়ারেন্স যুক্ত হওয়ায় বন্দরগুলোতে পণ্য জট কমেছে; চলতি প্রান্তিকে রপ্তানি সরবরাহ বেড়েছে ১৮ শতাংশ।',
        body:
          'দেশের প্রধান নদীবন্দর ও কন্টেইনার টার্মিনালগুলোতে আধুনিক গ্যান্ট্রি ক্রেন এবং অনলাইন কাস্টমস ব্যবস্থাপনা যুক্ত হওয়ার পর পণ্য খালাসের সময় অর্ধেকে নেমে এসেছে। আগে যেখানে একটি জাহাজের পণ্য খালাস করতে তিন থেকে চার দিন লাগত, এখন তা ২৪ ঘণ্টার মধ্যেই সম্পন্ন হচ্ছে।\n\nবন্দর ব্যবহারকারী ব্যবসায়ীরা জানান, দ্রুত শুল্কায়ন ও নির্বিঘ্ন পরিবহন সুবিধার ফলে আন্তর্জাতিক ক্রেতাদের কাছে সময়মতো পণ্য পৌঁছে দেওয়া সহজ হয়েছে। বিশেষ করে তৈরি পোশাক, পাটজাত পণ্য ও কৃষি প্রক্রিয়াজাত খাদ্য রপ্তানিতে এর সরাসরি সুফল মিলছে।',
        category: 'অর্থনীতি',
        author: 'অর্থনীতি প্রতিবেদক',
        location: 'বন্দর নগরী',
        imageUrl: '/src/assets/images/economy_port_trade_1794866696720.jpg',
        imageCaption: 'গোধূলি আলোয় কন্টেইনার টার্মিনালে পণ্য ওঠানামার ব্যস্ততা। ছবি: নিউজ বাংলা ৭',
        readMinutes: 3,
        publishedAt: minutesAgo(42),
        views: 920,
      },
      {
        id: 'nb7-agri-harvest',
        kind: 'news',
        title: 'ভোরের কুয়াশায় সবুজ ধানের মাঠে বাম্পার ফলনের আশা, ন্যায্য দামে স্বস্তিতে কৃষক',
        summary:
          'আবহাওয়া অনুকূলে থাকায় ও আধুনিক সেচ ব্যবস্থাপনার কারণে চলতি মৌসুমে ধানের উৎপাদন লক্ষ্যমাত্রা ছাড়িয়ে যাওয়ার পূর্বাভাস দিয়েছে কৃষি বিভাগ।',
        body:
          'গ্রামীণ জনপদে এখন ভোরের কুয়াশা ভেদ করে সোনালি রোদের সঙ্গে সঙ্গে মাঠে নামছেন কৃষকরা। এবারের মৌসুমে রোগবালাই কম থাকায় এবং সময়মতো সেচ ও সার পাওয়ায় ধানের চারা অত্যন্ত সতেজ রয়েছে।\n\nস্থানীয় কৃষি কর্মকর্তারা জানিয়েছেন, উচ্চফলনশীল জাতের আবাদ বাড়ায় প্রতি একরে উৎপাদন আগের বছরের তুলনায় অন্তত ১০ শতাংশ বেশি হবে বলে আশা করা হচ্ছে। সরাসরি সংগ্রহ কেন্দ্রের মাধ্যমে ধান কেনার উদ্যোগ নেওয়ায় কৃষকরা ন্যায্য মূল্য পাওয়ার ব্যাপারে আশাবাদী।',
        category: 'জাতীয়',
        author: 'কৃষি ও গ্রামীণ ডেস্ক',
        location: 'উত্তরাঞ্চল',
        imageUrl: '/src/assets/images/agriculture_harvest_1794866697095.jpg',
        imageCaption: 'ভোরের রোদে সবুজ ধানের ক্ষেতে পরিচর্যায় ব্যস্ত কৃষকরা।',
        readMinutes: 2,
        publishedAt: minutesAgo(95),
        views: 745,
      },
      {
        id: 'nb7-photo-bookfair',
        kind: 'photo',
        title: 'ছবিতে বইমেলা প্রাঙ্গণ: পাঠক, প্রকাশক ও নতুন বইয়ের গন্ধে মুখর বিকেল',
        summary:
          'গাছের ছায়ায় সারি সারি কাঠের স্টল আর নতুন বই হাতে সব বয়সী পাঠকের উপস্থিতিতে জমে উঠেছে প্রাণের বইমেলা।',
        body:
          'বিকেলের নরম রোদে বইমেলার প্রাঙ্গণ যেন এক মিলনমেলায় পরিণত হয়েছে। স্কুল-কলেজের শিক্ষার্থী থেকে শুরু করে প্রবীণ পাঠকরাও স্টলে স্টলে ঘুরে দেখছেন ইতিহাস, বিজ্ঞান, কবিতা ও শিশুসাহিত্যের নতুন সব প্রকাশনা।\n\nপ্রকাশকরা জানান, এ বছর মননশীল প্রবন্ধ ও তরুণ লেখকদের মৌলিক গল্পের বইয়ের প্রতি পাঠকদের আগ্রহ চোখে পড়ার মতো।',
        category: 'সংস্কৃতি',
        author: 'ফটো সাংবাদিক দল',
        location: 'বইমেলা প্রাঙ্গণ',
        imageUrl: '/src/assets/images/culture_book_fair_1794866696690.jpg',
        galleryUrls: [
          '/src/assets/images/culture_book_fair_1794866696690.jpg',
          '/src/assets/images/lead_story_metro_1794866695830.jpg',
        ],
        imageCaption: 'বইমেলা প্রাঙ্গণে পছন্দের বই উল্টেপাল্টে দেখছেন পাঠকরা। ছবি: নিউজ বাংলা ৭',
        readMinutes: 2,
        publishedAt: minutesAgo(140),
        views: 1120,
      },
      {
        id: 'nb7-video-report',
        kind: 'video',
        title: 'ভিডিও প্রতিবেদন: নদীমাতৃক বাংলার বাণিজ্য ও আধুনিক পরিবহনের রূপান্তর',
        summary:
          'বন্দর, রেল ও সড়ক যোগাযোগের সমন্বয়ে কীভাবে বদলে যাচ্ছে আঞ্চলিক অর্থনীতির চিত্র—দেখুন বিশেষ ভিডিও প্রতিবেদনে।',
        body:
          'নদীপথ ও আধুনিক রেল যোগাযোগের সমন্বয় আঞ্চলিক পণ্য পরিবহনে নতুন দিগন্ত খুলে দিয়েছে। এই ভিডিও প্রতিবেদনে তুলে ধরা হয়েছে বন্দর এলাকার সাম্প্রতিক অবকাঠামোগত উন্নয়ন এবং এর ফলে সাধারণ মানুষের জীবনযাত্রায় আসা পরিবর্তন।',
        category: 'প্রযুক্তি',
        author: 'মাল্টিমিডিয়া ডেস্ক',
        location: 'স্টুডিও রিপোর্ট',
        imageUrl: '/src/assets/images/economy_port_trade_1794866696720.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        videoDuration: '০৩:৪৫',
        readMinutes: 4,
        publishedAt: minutesAgo(180),
        views: 1560,
      },
      {
        id: 'nb7-info-weather',
        kind: 'info',
        title: 'আবহাওয়া তথ্য: আগামী ২৪ ঘণ্টায় তাপমাত্রা সামান্য কমতে পারে, সকালের দিকে হালকা কুয়াশা',
        summary:
          'সর্বোচ্চ তাপমাত্রা ২৮ ডিগ্রি এবং সর্বনিম্ন ১৭ ডিগ্রি সেলসিয়াস থাকতে পারে। নদী অববাহিকায় ভোরের দিকে হালকা কুয়াশার সম্ভাবনা রয়েছে।',
        body:
          'আবহাওয়া দপ্তরের সর্বশেষ বুলেটিন অনুযায়ী, আগামী ২৪ ঘণ্টায় আকাশ প্রধানত পরিষ্কার ও শুষ্ক থাকবে। তবে ভোরের দিকে নদী তীরবর্তী এলাকা ও মহাসড়কে হালকা কুয়াশা পড়তে পারে। যানবাহন চালকদের ভোরের দিকে সতর্কতার সঙ্গে চলাচলের পরামর্শ দেওয়া হয়েছে।',
        category: 'তথ্য',
        infoType: 'আবহাওয়া',
        author: 'তথ্যকেন্দ্র ডেস্ক',
        location: 'সারাদেশ',
        readMinutes: 1,
        publishedAt: minutesAgo(25),
        views: 610,
      },
      {
        id: 'nb7-info-market',
        kind: 'info',
        title: 'আজকের প্রয়োজনীয় তথ্য: সাপ্তাহিক বাজারদর ও জরুরি নাগরিক সেবা নম্বর',
        summary:
          'নিত্যপ্রয়োজনীয় চাল, ডাল ও সবজির হালনাগাদ বাজারদর এবং জরুরি অ্যাম্বুলেন্স, ফায়ার সার্ভিস ও হেল্পলাইন সংক্রান্ত তথ্য।',
        body:
          'বাজার পর্যবেক্ষণ দলের তথ্য অনুযায়ী আজ পাইকারি বাজারে নতুন সবজির সরবরাহ বাড়ায় দাম কিছুটা স্থিতিশীল রয়েছে। জরুরি যেকোনো নাগরিক সহায়তার জন্য জাতীয় জরুরি সেবা ৯৯৯ এবং স্বাস্থ্য বাতায়ন ১৬২৬৩ নম্বরে ২৪ ঘণ্টা যোগাযোগ করা যাবে।',
        category: 'তথ্য',
        infoType: 'বাজারদর',
        author: 'নাগরিক তথ্য ডেস্ক',
        location: 'নগর বাজার',
        readMinutes: 1,
        publishedAt: minutesAgo(75),
        views: 530,
      },
      {
        id: 'nb7-info-traffic',
        kind: 'info',
        title: 'যান চলাচল নির্দেশনা: ফ্লাইওভার মেরামতের কারণে রাত ১১টা থেকে বিকল্প সড়ক ব্যবহারের অনুরোধ',
        summary:
          'নিরাপদ ও নির্বিঘ্ন যাতায়াতের জন্য রক্ষণাবেক্ষণ কাজের সময় মধ্যরাতে নির্দিষ্ট লেন বন্ধ থাকবে।',
        body:
          'রক্ষণাবেক্ষণ কাজের অংশ হিসেবে আজ রাত ১১টা থেকে ভোর ৫টা পর্যন্ত প্রধান ফ্লাইওভারের পশ্চিমমুখী লেন সাময়িকভাবে বন্ধ থাকবে। এই সময়ে নিচের বিকল্প সড়ক এবং মেট্রোরেল ব্যবহার করার জন্য যাত্রীদের অনুরোধ জানানো হয়েছে।',
        category: 'তথ্য',
        infoType: 'যান চলাচল',
        author: 'ট্রাফিক আপডেট',
        location: 'কেন্দ্রীয় সড়ক',
        readMinutes: 1,
        publishedAt: minutesAgo(115),
        views: 490,
      },
    ],
  };
}

function readDatabase(): NewsDatabase {
  ensureDirectories();
  if (!fs.existsSync(DB_FILE)) {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as NewsDatabase;
    if (!Array.isArray(parsed.items)) {
      throw new Error('Invalid DB structure');
    }
    return parsed;
  } catch {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
}

function writeDatabase(db: NewsDatabase) {
  ensureDirectories();
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

function sortItems(items: NewsItemRecord[]): NewsItemRecord[] {
  return [...items].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

function sanitizePinCheck(req: Request, db: NewsDatabase): boolean {
  if (!db.editorPinHash) return true;
  const provided = String(req.headers['x-editor-pin'] ?? '');
  if (!provided) return false;
  return hashPin(provided) === db.editorPinHash;
}

async function startServer() {
  ensureDirectories();
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

  // Get all news, videos, photos, and info items
  app.get('/api/news', (_req: Request, res: Response) => {
    const db = readDatabase();
    res.json({
      items: sortItems(db.items),
      editionLabel: db.editionLabel,
      hasPin: Boolean(db.editorPinHash),
    });
  });

  // Publish new item rapidly
  app.post('/api/news', (req: Request, res: Response) => {
    const db = readDatabase();
    if (!sanitizePinCheck(req, db)) {
      res.status(401).json({ error: 'সঠিক এডিটর পিন দিন।' });
      return;
    }

    const body = req.body ?? {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      res.status(400).json({ error: 'শিরোনাম অবশ্যই দিতে হবে।' });
      return;
    }

    const kind: NewsItemRecord['kind'] =
      body.kind === 'video' || body.kind === 'photo' || body.kind === 'info'
        ? body.kind
        : 'news';

    const summary =
      typeof body.summary === 'string' && body.summary.trim()
        ? body.summary.trim()
        : title;
    const contentBody =
      typeof body.body === 'string' && body.body.trim()
        ? body.body.trim()
        : summary;

    const isLead = Boolean(body.isLead);
    if (isLead) {
      db.items = db.items.map((item) => ({ ...item, isLead: false }));
    }

    const wordCount = contentBody.split(/\s+/).filter(Boolean).length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 140));

    const galleryUrls = Array.isArray(body.galleryUrls)
      ? body.galleryUrls.filter((u: unknown): u is string => typeof u === 'string' && u.trim().length > 0)
      : undefined;

    const newItem: NewsItemRecord = {
      id: `nb7-${crypto.randomUUID().slice(0, 8)}`,
      kind,
      title,
      summary,
      body: contentBody,
      category:
        typeof body.category === 'string' && body.category.trim()
          ? body.category.trim()
          : kind === 'info'
            ? 'তথ্য'
            : 'জাতীয়',
      author:
        typeof body.author === 'string' && body.author.trim()
          ? body.author.trim()
          : 'নিউজ বাংলা ৭ ডেস্ক',
      location:
        typeof body.location === 'string' && body.location.trim()
          ? body.location.trim()
          : undefined,
      imageUrl:
        typeof body.imageUrl === 'string' && body.imageUrl.trim()
          ? body.imageUrl.trim()
          : galleryUrls && galleryUrls.length > 0
            ? galleryUrls[0]
            : undefined,
      galleryUrls: galleryUrls && galleryUrls.length > 0 ? galleryUrls : undefined,
      imageCaption:
        typeof body.imageCaption === 'string' && body.imageCaption.trim()
          ? body.imageCaption.trim()
          : undefined,
      videoUrl:
        typeof body.videoUrl === 'string' && body.videoUrl.trim()
          ? body.videoUrl.trim()
          : undefined,
      videoDuration:
        typeof body.videoDuration === 'string' && body.videoDuration.trim()
          ? body.videoDuration.trim()
          : undefined,
      infoType:
        typeof body.infoType === 'string' && body.infoType.trim()
          ? body.infoType.trim()
          : undefined,
      externalLink:
        typeof body.externalLink === 'string' && body.externalLink.trim()
          ? body.externalLink.trim()
          : undefined,
      isLead,
      isBreaking: Boolean(body.isBreaking),
      readMinutes,
      publishedAt: new Date().toISOString(),
      views: 1,
    };

    db.items.unshift(newItem);
    writeDatabase(db);
    res.status(201).json({ item: newItem });
  });

  // Update existing item or toggle lead/breaking status
  app.patch('/api/news/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    if (!sanitizePinCheck(req, db)) {
      res.status(401).json({ error: 'সঠিক এডিটর পিন দিন।' });
      return;
    }

    const idx = db.items.findIndex((item) => item.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'আইটেমটি খুঁজে পাওয়া যায়নি।' });
      return;
    }

    const updates = req.body ?? {};
    if (updates.isLead === true) {
      db.items = db.items.map((item) => ({ ...item, isLead: false }));
    }

    const current = db.items[idx];
    const updated: NewsItemRecord = {
      ...current,
      ...(typeof updates.title === 'string' && updates.title.trim() ? { title: updates.title.trim() } : {}),
      ...(typeof updates.summary === 'string' ? { summary: updates.summary.trim() } : {}),
      ...(typeof updates.body === 'string' ? { body: updates.body.trim() } : {}),
      ...(typeof updates.category === 'string' ? { category: updates.category.trim() } : {}),
      ...(typeof updates.author === 'string' ? { author: updates.author.trim() } : {}),
      ...(typeof updates.location === 'string' ? { location: updates.location.trim() || undefined } : {}),
      ...(typeof updates.imageUrl === 'string' ? { imageUrl: updates.imageUrl.trim() || undefined } : {}),
      ...(typeof updates.imageCaption === 'string' ? { imageCaption: updates.imageCaption.trim() || undefined } : {}),
      ...(typeof updates.videoUrl === 'string' ? { videoUrl: updates.videoUrl.trim() || undefined } : {}),
      ...(typeof updates.infoType === 'string' ? { infoType: updates.infoType.trim() || undefined } : {}),
      ...(typeof updates.isLead === 'boolean' ? { isLead: updates.isLead } : {}),
      ...(typeof updates.isBreaking === 'boolean' ? { isBreaking: updates.isBreaking } : {}),
    };

    db.items[idx] = updated;
    writeDatabase(db);
    res.json({ item: updated });
  });

  // Track views silently for reader metrics
  app.post('/api/news/:id/view', (req: Request, res: Response) => {
    const db = readDatabase();
    const item = db.items.find((entry) => entry.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'পাওয়া যায়নি' });
      return;
    }
    item.views = (item.views ?? 0) + 1;
    writeDatabase(db);
    res.json({ views: item.views });
  });

  // Delete an item
  app.delete('/api/news/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    if (!sanitizePinCheck(req, db)) {
      res.status(401).json({ error: 'সঠিক এডিটর পিন দিন।' });
      return;
    }

    const before = db.items.length;
    db.items = db.items.filter((item) => item.id !== req.params.id);
    if (db.items.length === before) {
      res.status(404).json({ error: 'আইটেমটি খুঁজে পাওয়া যায়নি।' });
      return;
    }
    writeDatabase(db);
    res.json({ ok: true });
  });

  // Direct device upload for photos and videos
  app.post('/api/upload', (req: Request, res: Response) => {
    const db = readDatabase();
    if (!sanitizePinCheck(req, db)) {
      res.status(401).json({ error: 'সঠিক এডিটর পিন দিন।' });
      return;
    }

    const { filename, mimeType, dataBase64 } = req.body ?? {};
    if (typeof dataBase64 !== 'string' || !dataBase64) {
      res.status(400).json({ error: 'কোনো ফাইল ডেটা পাওয়া যায়নি।' });
      return;
    }

    const allowedMimePrefixes = ['image/', 'video/'];
    const safeMime = typeof mimeType === 'string' ? mimeType.toLowerCase() : '';
    if (!allowedMimePrefixes.some((prefix) => safeMime.startsWith(prefix))) {
      res.status(400).json({ error: 'শুধুমাত্র ছবি বা ভিডিও ফাইল আপলোড করা যাবে।' });
      return;
    }

    const extFromName = typeof filename === 'string' ? path.extname(filename).toLowerCase() : '';
    const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov']);
    const fallbackExt = safeMime.startsWith('video/') ? '.mp4' : '.jpg';
    const ext = allowedExts.has(extFromName) ? extFromName : fallbackExt;

    const buffer = Buffer.from(dataBase64, 'base64');
    if (buffer.length > 40 * 1024 * 1024) {
      res.status(413).json({ error: 'ফাইলের আকার ৪০ মেগাবাইটের কম হতে হবে।' });
      return;
    }

    const savedName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, savedName);
    fs.writeFileSync(targetPath, buffer);
    res.status(201).json({ url: `/uploads/${savedName}` });
  });

  // Optional Editor PIN lock management
  app.post('/api/settings/pin', (req: Request, res: Response) => {
    const db = readDatabase();
    const { currentPin, newPin } = req.body ?? {};

    if (db.editorPinHash) {
      const provided = typeof currentPin === 'string' ? currentPin : '';
      if (hashPin(provided) !== db.editorPinHash) {
        res.status(401).json({ error: 'বর্তমান পিনটি সঠিক নয়।' });
        return;
      }
    }

    if (typeof newPin === 'string' && newPin.trim().length > 0) {
      if (newPin.trim().length < 4) {
        res.status(400).json({ error: 'পিন কমপক্ষে ৪ অক্ষরের হতে হবে।' });
        return;
      }
      db.editorPinHash = hashPin(newPin.trim());
    } else {
      db.editorPinHash = null;
    }

    writeDatabase(db);
    res.json({ hasPin: Boolean(db.editorPinHash) });
  });

  // Verify PIN quickly
  app.post('/api/settings/verify-pin', (req: Request, res: Response) => {
    const db = readDatabase();
    if (!db.editorPinHash) {
      res.json({ valid: true, hasPin: false });
      return;
    }
    const provided = typeof req.body?.pin === 'string' ? req.body.pin : '';
    const valid = hashPin(provided) === db.editorPinHash;
    res.json({ valid, hasPin: true });
  });

  // Newsletter mailing list subscription
  app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!rawEmail || !emailRegex.test(rawEmail)) {
      res.status(400).json({ error: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।' });
      return;
    }

    const normalizedEmail = rawEmail.toLowerCase();
    const db = readDatabase();
    const subscribers = Array.isArray(db.subscribers) ? db.subscribers : [];
    const existing = subscribers.find((sub) => sub.email.toLowerCase() === normalizedEmail);

    if (existing) {
      res.json({
        ok: true,
        alreadySubscribed: true,
        message: 'এই ইমেইলটি ইতিমধ্যেই আমাদের মেইলিং লিস্টে যুক্ত রয়েছে।',
      });
      return;
    }

    db.subscribers = [
      ...subscribers,
      { email: normalizedEmail, subscribedAt: new Date().toISOString() },
    ];
    writeDatabase(db);

    res.status(201).json({
      ok: true,
      alreadySubscribed: false,
      message: 'ধন্যবাদ! আপনি সফলভাবে আমাদের নিউজলেটারে যুক্ত হয়েছেন।',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`News Bangla 7 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
