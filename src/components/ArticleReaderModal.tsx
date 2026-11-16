import { useEffect, useState } from 'react';
import { Check, ExternalLink, Share2, Trash2, X } from 'lucide-react';
import type { NewsItem } from '../types/news';
import { formatBengaliRelativeTime, toBengaliDigits } from '../utils/media';
import { EditorialImage } from './EditorialImage';
import { VideoPlayer } from './VideoPlayer';

interface ArticleReaderModalProps {
  item: NewsItem | null;
  onClose: () => void;
  onEditItem: (item: NewsItem) => void;
  onDeleteItem: (id: string) => void;
}

export function ArticleReaderModal({
  item,
  onClose,
  onEditItem,
  onDeleteItem,
}: ArticleReaderModalProps) {
  const [copied, setCopied] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    setActivePhotoIndex(0);
    setCopied(false);
  }, [item?.id]);

  useEffect(() => {
    if (!item) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [item, onClose]);

  if (!item) return null;

  const photos =
    item.galleryUrls && item.galleryUrls.length > 0
      ? item.galleryUrls
      : item.imageUrl
        ? [item.imageUrl]
        : [];

  const activePhoto = photos[activePhotoIndex] ?? item.imageUrl;

  const handleCopyShare = async () => {
    const shareUrl = `${window.location.origin}/#story-${item.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const kindLabel =
    item.kind === 'video'
      ? 'ভিডিও প্রতিবেদন'
      : item.kind === 'photo'
        ? 'আলোকচিত্র'
        : item.kind === 'info'
          ? item.infoType || 'তথ্যকেন্দ্র'
          : item.category;

  const paragraphs = item.body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-xs flex items-start justify-center overflow-y-auto p-3 sm:p-6 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-headline"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <article className="bg-[#FBF9F5] border border-[#E5DFD3] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto">
        {/* Top utility bar */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b border-[#E5DFD3] bg-white">
          <div className="flex items-center gap-2 text-xs text-[#78716C] truncate">
            <span className="font-semibold text-[#9A3412]">{kindLabel}</span>
            {item.location && (
              <>
                <span aria-hidden="true">·</span>
                <span>{item.location}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formatBengaliRelativeTime(item.publishedAt)}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#14532D]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'লিংক কপি হয়েছে' : 'শেয়ার'}</span>
            </button>
            <button
              type="button"
              onClick={() => onEditItem(item)}
              className="px-3 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              সম্পাদনা
            </button>
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              className="p-1.5 text-[#78716C] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/50 rounded-lg transition-colors cursor-pointer"
              aria-label="মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-lg transition-colors cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Content */}
        <div className="px-5 sm:px-10 py-8">
          <h1
            id="reader-headline"
            className="font-serif text-2xl sm:text-4xl font-bold text-[#1C1917] leading-snug headline-balance"
          >
            {item.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#44403C] leading-relaxed">
            {item.summary}
          </p>

          <div className="mt-5 pb-6 border-b border-[#E5DFD3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#78716C]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#1C1917]">{item.author}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {new Date(item.publishedAt).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 tabular-nums">
              <span>পাঠকাল {toBengaliDigits(item.readMinutes ?? 2)} মিনিট</span>
              <span aria-hidden="true">·</span>
              <span>পঠিত {toBengaliDigits(item.views)} বার</span>
            </div>
          </div>

          {/* Embedded Video Player if videoUrl exists */}
          {item.videoUrl && (
            <div className="mt-6">
              <VideoPlayer
                videoUrl={item.videoUrl}
                title={item.title}
                posterUrl={item.imageUrl}
              />
            </div>
          )}

          {/* Photo / Gallery Presentation */}
          {activePhoto && (!item.videoUrl || item.kind !== 'video') && (
            <figure className="mt-6">
              <div className="w-full aspect-16/10 bg-[#EFEAE0] rounded-xl overflow-hidden border border-[#E5DFD3]">
                <EditorialImage
                  src={activePhoto}
                  alt={item.title}
                  fallbackTitle={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {item.imageCaption && (
                <figcaption className="mt-2.5 text-xs font-serif italic text-[#78716C]">
                  {item.imageCaption}
                </figcaption>
              )}

              {photos.length > 1 && (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                  {photos.map((photoUrl, idx) => (
                    <button
                      key={`${photoUrl}-${idx}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-opacity ${
                        idx === activePhotoIndex
                          ? 'border-[#9A3412] opacity-100'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <EditorialImage src={photoUrl} alt={`${item.title} ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </figure>
          )}

          {/* Long-form prose body */}
          <div className="mt-7 max-w-prose space-y-4 text-base sm:text-[17px] text-[#292524] leading-[1.85]">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'editorial-dropcap' : undefined}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* External Source / Action Link */}
          {item.externalLink && (
            <div className="mt-8 pt-6 border-t border-[#E5DFD3]">
              <a
                href={item.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#9A3412] hover:text-[#7C2D12] underline underline-offset-4"
              >
                <span>মূল তথ্যসূত্র বা বিস্তারিত লিংক দেখুন</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
