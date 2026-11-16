import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Camera,
  Film,
  Info,
  Play,
  Search,
  X,
} from 'lucide-react';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import { EditorialImage } from './components/EditorialImage';
import { Header, type NavSection } from './components/Header';
import { NewsletterSignup } from './components/NewsletterSignup';
import { QuickPublishDrawer } from './components/QuickPublishDrawer';
import type { NewsFeedResponse, NewsItem } from './types/news';
import {
  formatBengaliHeaderDate,
  formatBengaliRelativeTime,
  NEWSROOM_CATEGORIES,
  toBengaliDigits,
} from './utils/media';

export default function App() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editionLabel, setEditionLabel] = useState('সরাসরি ডিজিটাল সংস্করণ');
  const [hasPin, setHasPin] = useState(false);
  const [editorPin, setEditorPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [activeSection, setActiveSection] = useState<NavSection>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('সকল');
  const [searchQuery, setSearchQuery] = useState('');

  const [readingItem, setReadingItem] = useState<NewsItem | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setLoadError('');
      const res = await fetch('/api/news');
      if (!res.ok) {
        throw new Error('সংবাদ লোড করা যায়নি');
      }
      const data = (await res.json()) as NewsFeedResponse;
      setItems(Array.isArray(data.items) ? data.items : []);
      if (data.editionLabel) setEditionLabel(data.editionLabel);
      setHasPin(Boolean(data.hasPin));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'সংযোগে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Open shared story via hash link (#story-id)
  useEffect(() => {
    if (items.length === 0) return;
    const hash = window.location.hash;
    if (hash.startsWith('#story-')) {
      const targetId = hash.replace('#story-', '');
      const found = items.find((item) => item.id === targetId);
      if (found) setReadingItem(found);
    }
  }, [items]);

  const handleOpenStory = async (item: NewsItem) => {
    setReadingItem(item);
    window.history.replaceState(null, '', `#story-${item.id}`);
    try {
      const res = await fetch(`/api/news/${item.id}/view`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id ? { ...entry, views: data.views ?? entry.views + 1 } : entry
          )
        );
      }
    } catch {
      // Silent view tracking
    }
  };

  const handleCloseStory = () => {
    setReadingItem(null);
    if (window.location.hash.startsWith('#story-')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleDeleteFromReader = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: {
          ...(editorPin ? { 'x-editor-pin': editorPin } : {}),
        },
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          setReadingItem(null);
          setPublishOpen(true);
          return;
        }
        throw new Error(data.error || 'মুছতে সমস্যা হয়েছে');
      }
      setReadingItem(null);
      await fetchFeed();
    } catch {
      setReadingItem(null);
      setPublishOpen(true);
    }
  };

  const handleEditFromReader = (item: NewsItem) => {
    setReadingItem(null);
    setEditingItem(item);
    setPublishOpen(true);
  };

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (activeSection === 'video' && item.kind !== 'video') return false;
      if (activeSection === 'photo' && item.kind !== 'photo') return false;
      if (activeSection === 'info' && item.kind !== 'info') return false;
      if (
        (activeSection === 'archive' || activeSection === 'all') &&
        selectedCategory !== 'সকল' &&
        item.category !== selectedCategory
      ) {
        return false;
      }
      if (query) {
        const hay = `${item.title} ${item.summary} ${item.category} ${item.location ?? ''} ${item.infoType ?? ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [items, activeSection, selectedCategory, searchQuery]);

  const breakingItems = useMemo(
    () => items.filter((item) => item.isBreaking).slice(0, 4),
    [items]
  );

  const leadStory = useMemo(() => {
    return (
      items.find((item) => item.isLead && item.kind !== 'info') ||
      items.find((item) => item.kind === 'news') ||
      items[0] ||
      null
    );
  }, [items]);

  const secondaryNews = useMemo(() => {
    return items
      .filter((item) => item.id !== leadStory?.id && item.kind === 'news')
      .slice(0, 6);
  }, [items, leadStory?.id]);

  const videoItems = useMemo(
    () => items.filter((item) => item.kind === 'video' || Boolean(item.videoUrl)).slice(0, 6),
    [items]
  );

  const photoItems = useMemo(
    () => items.filter((item) => item.kind === 'photo' || (item.imageUrl && item.kind !== 'info')).slice(0, 4),
    [items]
  );

  const infoItems = useMemo(
    () => items.filter((item) => item.kind === 'info').slice(0, 8),
    [items]
  );

  const isFrontPageDefault =
    activeSection === 'all' && selectedCategory === 'সকল' && searchQuery.trim() === '';

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Header
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          if (sec !== 'archive') setSelectedCategory('সকল');
        }}
        onOpenPublish={() => {
          setEditingItem(null);
          setPublishOpen(true);
        }}
      />

      {/* Editorial Date, Edition & Search Utility Strip */}
      <div className="border-b border-[#E5DFD3] bg-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
            <span className="font-medium text-[#1C1917]">{formatBengaliHeaderDate()}</span>
            <span aria-hidden="true">·</span>
            <span>{editionLabel}</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="খবর, ভিডিও বা তথ্য খুঁজুন..."
              className="w-full pl-9 pr-8 py-1.5 text-sm bg-white border border-[#E5DFD3] rounded-lg text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9A3412]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                aria-label="অনুসন্ধান মুছুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Breaking Headline Strip */}
      {breakingItems.length > 0 && isFrontPageDefault && (
        <div className="border-b border-[#E5DFD3] bg-[#F5F1E8]/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-4 overflow-x-auto">
            <span className="text-xs font-bold text-[#9A3412] whitespace-nowrap shrink-0">
              সদ্যপ্রাপ্ত
            </span>
            <span className="text-[#D6CEBE] shrink-0" aria-hidden="true">
              /
            </span>
            <div className="flex items-center gap-6 overflow-x-auto">
              {breakingItems.map((bItem) => (
                <button
                  key={bItem.id}
                  type="button"
                  onClick={() => handleOpenStory(bItem)}
                  className="text-sm font-medium text-[#1C1917] hover:text-[#9A3412] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {bItem.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <p className="font-serif text-xl text-[#57534E]">সংবাদপত্র লোড হচ্ছে...</p>
          </div>
        ) : loadError ? (
          <div className="py-16 text-center space-y-4 bg-white border border-[#E5DFD3] rounded-2xl p-8">
            <p className="font-serif text-xl text-[#991B1B]">{loadError}</p>
            <button
              type="button"
              onClick={fetchFeed}
              className="px-5 py-2.5 text-sm font-medium bg-[#9A3412] text-white rounded-lg hover:bg-[#7C2D12] cursor-pointer"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : isFrontPageDefault ? (
          <>
            {/* TIER 1: Lead Story (মুখ্য সংবাদ) */}
            {leadStory && (
              <section aria-label="মুখ্য সংবাদ" className="pb-10 border-b border-[#E5DFD3]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div
                    onClick={() => handleOpenStory(leadStory)}
                    className="lg:col-span-7 cursor-pointer group rounded-2xl overflow-hidden border border-[#E5DFD3] bg-[#EFEAE0] min-h-[260px] lg:min-h-[420px]"
                  >
                    <EditorialImage
                      src={leadStory.imageUrl}
                      alt={leadStory.title}
                      fallbackTitle={leadStory.title}
                      className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-300"
                    />
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#78716C] mb-3">
                        <span className="font-semibold text-[#9A3412]">
                          {leadStory.isLead ? 'মুখ্য সংবাদ' : leadStory.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{leadStory.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {formatBengaliRelativeTime(leadStory.publishedAt)}
                        </span>
                      </div>

                      <h1
                        onClick={() => handleOpenStory(leadStory)}
                        className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] leading-snug headline-balance cursor-pointer hover:text-[#9A3412] transition-colors"
                      >
                        {leadStory.title}
                      </h1>

                      <p className="mt-4 text-base text-[#44403C] leading-relaxed">
                        {leadStory.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#E5DFD3] flex items-center justify-between gap-4">
                      <div className="text-xs text-[#78716C]">
                        <span className="font-medium text-[#1C1917]">{leadStory.author}</span>
                        {leadStory.location && (
                          <>
                            <span className="mx-1.5" aria-hidden="true">
                              ·
                            </span>
                            <span>{leadStory.location}</span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenStory(leadStory)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9A3412] hover:text-[#7C2D12] cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>বিস্তারিত পড়ুন</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* TIER 2: Secondary Top Stories (প্রধান সংবাদ) */}
            <section aria-labelledby="section-top-news" className="pb-10 border-b border-[#E5DFD3]">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 id="section-top-news" className="font-serif text-2xl font-bold text-[#1C1917]">
                  প্রধান সংবাদ
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('archive')}
                  className="text-sm font-medium text-[#9A3412] hover:text-[#7C2D12] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>সকল বিভাগ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {secondaryNews.length === 0 ? (
                <p className="text-sm text-[#78716C]">আরও সংবাদ যোগ করতে "দ্রুত প্রকাশ" ব্যবহার করুন।</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {secondaryNews.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => handleOpenStory(item)}
                      className="group bg-white border border-[#E5DFD3] rounded-xl overflow-hidden flex flex-col cursor-pointer hover:border-[#C7BFA9] transition-colors"
                    >
                      <div className="aspect-4/3 bg-[#EFEAE0] overflow-hidden">
                        <EditorialImage
                          src={item.imageUrl}
                          alt={item.title}
                          fallbackTitle={item.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#78716C] mb-2">
                            <span className="font-semibold text-[#9A3412]">{item.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {formatBengaliRelativeTime(item.publishedAt)}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-[#1C1917] leading-snug headline-balance group-hover:text-[#9A3412] transition-colors">
                            {item.title}
                          </h3>
                          <p className="mt-2.5 text-sm text-[#57534E] line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#F1EDE4] flex items-center justify-between text-xs text-[#78716C]">
                          <span>{item.author}</span>
                          <span className="tabular-nums">
                            {toBengaliDigits(item.readMinutes ?? 2)} মিনিট পাঠ
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* TIER 3A: Video Desk (ভিডিও প্রতিবেদন) */}
            <section aria-labelledby="section-videos" className="pb-10 border-b border-[#E5DFD3]">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <Film className="w-5 h-5 text-[#9A3412]" />
                  <h2 id="section-videos" className="font-serif text-2xl font-bold text-[#1C1917]">
                    ভিডিও প্রতিবেদন
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('video')}
                  className="text-sm font-medium text-[#9A3412] hover:text-[#7C2D12] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>সকল ভিডিও</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {videoItems.length === 0 ? (
                <div className="bg-white border border-[#E5DFD3] rounded-xl p-8 text-center">
                  <p className="text-sm text-[#57534E]">এখনো কোনো ভিডিও প্রতিবেদন প্রকাশিত হয়নি।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoItems.slice(0, 3).map((vid) => (
                    <article
                      key={vid.id}
                      onClick={() => handleOpenStory(vid)}
                      className="group bg-[#1C1917] text-[#FBF9F5] rounded-xl overflow-hidden cursor-pointer border border-[#292524]"
                    >
                      <div className="relative aspect-video bg-black overflow-hidden">
                        <EditorialImage
                          src={vid.imageUrl}
                          alt={vid.title}
                          fallbackTitle={vid.title}
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-center justify-center">
                          <span className="w-12 h-12 rounded-full bg-[#9A3412] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-[#A8A29E] mb-2">
                          <span className="text-[#FDBA74] font-medium">{vid.category}</span>
                          {vid.videoDuration && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{vid.videoDuration}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>{formatBengaliRelativeTime(vid.publishedAt)}</span>
                        </div>
                        <h3 className="font-serif text-lg font-semibold leading-snug headline-balance group-hover:text-[#FDBA74] transition-colors">
                          {vid.title}
                        </h3>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* TIER 3B: Photojournalism & Info Desk (আলোকচিত্র ও তথ্যকেন্দ্র) */}
            <section aria-label="আলোকচিত্র ও তথ্যকেন্দ্র">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 7 Cols: Photo Stories */}
                <div className="lg:col-span-7">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <Camera className="w-5 h-5 text-[#9A3412]" />
                      <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                        আলোকচিত্র গ্যালারি
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('photo')}
                      className="text-sm font-medium text-[#9A3412] hover:text-[#7C2D12] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>সকল ছবি</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {photoItems.map((photo) => (
                      <article
                        key={photo.id}
                        onClick={() => handleOpenStory(photo)}
                        className="group bg-white border border-[#E5DFD3] rounded-xl overflow-hidden cursor-pointer hover:border-[#C7BFA9] transition-colors"
                      >
                        <div className="aspect-4/3 bg-[#EFEAE0] overflow-hidden">
                          <EditorialImage
                            src={photo.imageUrl}
                            alt={photo.title}
                            fallbackTitle={photo.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1.5">
                            <span className="font-semibold text-[#9A3412]">{photo.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatBengaliRelativeTime(photo.publishedAt)}</span>
                          </div>
                          <h3 className="font-serif text-base font-bold text-[#1C1917] leading-snug line-clamp-2 group-hover:text-[#9A3412] transition-colors">
                            {photo.title}
                          </h3>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Right 5 Cols: Information Desk (তথ্যকেন্দ্র) */}
                <div className="lg:col-span-5">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <Info className="w-5 h-5 text-[#9A3412]" />
                      <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                        তথ্যকেন্দ্র ও বুলেটিন
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('info')}
                      className="text-sm font-medium text-[#9A3412] hover:text-[#7C2D12] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>সব তথ্য</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white border border-[#E5DFD3] rounded-xl divide-y divide-[#E5DFD3]">
                    {infoItems.length === 0 ? (
                      <div className="p-6 text-sm text-[#78716C]">
                        কোনো তথ্য বুলেটিন এখনো যুক্ত হয়নি।
                      </div>
                    ) : (
                      infoItems.map((info) => (
                        <article
                          key={info.id}
                          onClick={() => handleOpenStory(info)}
                          className="p-4 sm:p-5 cursor-pointer hover:bg-[#FBF9F5] transition-colors"
                        >
                          <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1.5">
                            <span className="font-semibold text-[#9A3412]">
                              {info.infoType || 'প্রয়োজনীয় তথ্য'}
                            </span>
                            {info.location && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{info.location}</span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {formatBengaliRelativeTime(info.publishedAt)}
                            </span>
                          </div>
                          <h3 className="font-serif text-base font-bold text-[#1C1917] leading-snug hover:text-[#9A3412] transition-colors">
                            {info.title}
                          </h3>
                          <p className="mt-1.5 text-sm text-[#57534E] line-clamp-2 leading-relaxed">
                            {info.summary}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Filtered Section View (Videos, Photos, Info, Categories, or Search Results) */
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD3]">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  {searchQuery.trim()
                    ? `অনুসন্ধান ফলাফল: "${searchQuery.trim()}"`
                    : activeSection === 'video'
                      ? 'ভিডিও প্রতিবেদন'
                      : activeSection === 'photo'
                        ? 'আলোকচিত্র গ্যালারি'
                        : activeSection === 'info'
                          ? 'তথ্যকেন্দ্র ও জনগুরুত্বপূর্ণ তথ্য'
                          : 'সংবাদ বিভাগ ও আর্কাইভ'}
                </h1>
                <p className="text-sm text-[#78716C] mt-1 tabular-nums">
                  মোট {toBengaliDigits(filteredItems.length)}টি প্রকাশিত বিষয়
                </p>
              </div>

              {(activeSection === 'archive' || activeSection === 'all') && (
                <div className="flex items-center gap-1.5 p-1 bg-[#EFEAE0] rounded-xl overflow-x-auto">
                  {['সকল', ...NEWSROOM_CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-white text-[#1C1917] shadow-xs'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center space-y-4">
                <p className="font-serif text-lg text-[#57534E]">
                  এই বিভাগে এখনো কোনো বিষয় প্রকাশিত হয়নি।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setPublishOpen(true);
                  }}
                  className="px-5 py-2.5 text-sm font-medium bg-[#9A3412] text-white rounded-lg hover:bg-[#7C2D12] cursor-pointer"
                >
                  প্রথমটি প্রকাশ করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => handleOpenStory(item)}
                    className="group bg-white border border-[#E5DFD3] rounded-xl overflow-hidden flex flex-col cursor-pointer hover:border-[#C7BFA9] transition-colors"
                  >
                    {(item.imageUrl || item.kind === 'video' || item.kind === 'photo') && (
                      <div className="relative aspect-4/3 bg-[#EFEAE0] overflow-hidden">
                        <EditorialImage
                          src={item.imageUrl}
                          alt={item.title}
                          fallbackTitle={item.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        {item.kind === 'video' && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="w-11 h-11 rounded-full bg-[#9A3412] text-white flex items-center justify-center">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#78716C] mb-2">
                          <span className="font-semibold text-[#9A3412]">
                            {item.kind === 'info' ? item.infoType || 'তথ্য' : item.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {formatBengaliRelativeTime(item.publishedAt)}
                          </span>
                        </div>
                        <h2 className="font-serif text-lg font-bold text-[#1C1917] leading-snug headline-balance group-hover:text-[#9A3412] transition-colors">
                          {item.title}
                        </h2>
                        <p className="mt-2 text-sm text-[#57534E] line-clamp-3 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#F1EDE4] flex items-center justify-between text-xs text-[#78716C]">
                        <span>{item.author}</span>
                        <span className="tabular-nums">পঠিত {toBengaliDigits(item.views)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Quiet Editorial Broadsheet Footer */}
      <footer className="border-t border-[#E5DFD3] bg-[#F5F1E8] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <p className="font-serif text-xl font-bold text-[#1C1917]">News Bangla 7</p>
            <p className="mt-1.5 text-sm text-[#57534E] max-w-md">
              সত্য, দ্রুততা ও নির্ভরযোগ্য তথ্যের বাংলা ডিজিটাল সংবাদ মাধ্যম। সবার জন্য উন্মুক্ত পাঠযোগ্য।
            </p>
          </div>

          <div className="lg:col-span-5">
            <NewsletterSignup />
          </div>

          <div className="lg:col-span-3 flex flex-wrap lg:justify-end items-center gap-x-5 gap-y-3 text-sm text-[#57534E]">
            <button
              type="button"
              onClick={() => {
                setActiveSection('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              প্রচ্ছদ
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('video')}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              ভিডিও
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('photo')}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              আলোকচিত্র
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('info')}
              className="hover:text-[#1C1917] cursor-pointer"
            >
              তথ্যকেন্দ্র
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setPublishOpen(true);
              }}
              className="font-medium text-[#9A3412] hover:text-[#7C2D12] cursor-pointer"
            >
              সংবাদ প্রকাশ
            </button>
          </div>
        </div>
        <div className="border-t border-[#E5DFD3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-[#78716C] flex flex-wrap items-center justify-between gap-2">
            <span>© ২০২৬ News Bangla 7। সর্বস্বত্ব সংরক্ষিত।</span>
            <span>সহজ পাঠযোগ্য ডিজিটাল সংবাদ ও তথ্য পোর্টাল</span>
          </div>
        </div>
      </footer>

      {/* Reader Modal */}
      <ArticleReaderModal
        item={readingItem}
        onClose={handleCloseStory}
        onEditItem={handleEditFromReader}
        onDeleteItem={handleDeleteFromReader}
      />

      {/* Quick Publish Studio Drawer */}
      <QuickPublishDrawer
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        items={items}
        hasPin={hasPin}
        editorPin={editorPin}
        onEditorPinChange={setEditorPin}
        editingItem={editingItem}
        onClearEditing={() => setEditingItem(null)}
        onPublished={fetchFeed}
      />
    </div>
  );
}
