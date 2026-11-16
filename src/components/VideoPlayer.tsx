import { ExternalLink, Film } from 'lucide-react';
import { parseVideoSource } from '../utils/media';

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  posterUrl?: string;
}

export function VideoPlayer({ videoUrl, title, posterUrl }: VideoPlayerProps) {
  const parsed = parseVideoSource(videoUrl);

  if (!parsed) {
    return (
      <div className="w-full aspect-video bg-[#1C1917] text-[#E7E2D8] flex flex-col items-center justify-center p-6 text-center rounded-xl">
        <Film className="w-9 h-9 text-[#9A3412] mb-2" />
        <p className="text-sm">ভিডিও লিংক পাওয়া যায়নি</p>
      </div>
    );
  }

  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    return (
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#E5DFD3]">
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (parsed.type === 'direct') {
    return (
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#E5DFD3]">
        <video
          src={parsed.src}
          poster={posterUrl}
          controls
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-[#1C1917] text-[#FBF9F5] flex flex-col items-center justify-center gap-3 p-6 text-center rounded-xl border border-[#332E2A]">
      <Film className="w-8 h-8 text-[#D97706]" />
      <p className="text-sm text-[#D6CEBE] max-w-md">
        এই ভিডিওটি বাহ্যিক উৎসে সংযুক্ত রয়েছে। সরাসরি দেখতে নিচের বোতামে ক্লিক করুন।
      </p>
      <a
        href={parsed.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#9A3412] hover:bg-[#7C2D12] text-white rounded-lg transition-colors"
      >
        <span>ভিডিও দেখুন</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
