import { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  FileText,
  Film,
  Info,
  KeyRound,
  Lock,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { NewsContentKind, NewsItem } from '../types/news';
import {
  fileToBase64,
  formatBengaliRelativeTime,
  INFO_SUBTYPES,
  NEWSROOM_CATEGORIES,
} from '../utils/media';
import { EditorialImage } from './EditorialImage';

type StudioTab = NewsContentKind | 'manage';

interface QuickPublishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: NewsItem[];
  hasPin: boolean;
  editorPin: string;
  onEditorPinChange: (pin: string) => void;
  editingItem: NewsItem | null;
  onClearEditing: () => void;
  onPublished: () => Promise<void>;
}

const STUDIO_IMAGES = [
  {
    label: 'শহর ও মেট্রো',
    url: '/src/assets/images/lead_story_metro_1794866695830.jpg',
  },
  {
    label: 'বন্দর ও বাণিজ্য',
    url: '/src/assets/images/economy_port_trade_1794866696720.jpg',
  },
  {
    label: 'কৃষি ও প্রকৃতি',
    url: '/src/assets/images/agriculture_harvest_1794866697095.jpg',
  },
  {
    label: 'বইমেলা ও সংস্কৃতি',
    url: '/src/assets/images/culture_book_fair_1794866696690.jpg',
  },
];

export function QuickPublishDrawer({
  isOpen,
  onClose,
  items,
  hasPin,
  editorPin,
  onEditorPinChange,
  editingItem,
  onClearEditing,
  onPublished,
}: QuickPublishDrawerProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('news');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<string>('জাতীয়');
  const [infoType, setInfoType] = useState<string>('জরুরি তথ্য');
  const [author, setAuthor] = useState('নিউজ বাংলা ৭ ডেস্ক');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [imageCaption, setImageCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // PIN Security UI state
  const [showPinConfig, setShowPinConfig] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [currentPinForChange, setCurrentPinForChange] = useState('');
  const [pinFeedback, setPinFeedback] = useState('');

  useEffect(() => {
    if (editingItem) {
      setActiveTab(editingItem.kind);
      setTitle(editingItem.title);
      setSummary(editingItem.summary);
      setBody(editingItem.body);
      setCategory(editingItem.category);
      setInfoType(editingItem.infoType || 'জরুরি তথ্য');
      setAuthor(editingItem.author);
      setLocation(editingItem.location || '');
      setImageUrl(editingItem.imageUrl || '');
      setGalleryUrls(editingItem.galleryUrls || []);
      setImageCaption(editingItem.imageCaption || '');
      setVideoUrl(editingItem.videoUrl || '');
      setVideoDuration(editingItem.videoDuration || '');
      setExternalLink(editingItem.externalLink || '');
      setIsLead(Boolean(editingItem.isLead));
      setIsBreaking(Boolean(editingItem.isBreaking));
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [editingItem]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setBody('');
    setLocation('');
    setImageUrl('');
    setGalleryUrls([]);
    setImageCaption('');
    setVideoUrl('');
    setVideoDuration('');
    setExternalLink('');
    setIsLead(false);
    setIsBreaking(false);
    setErrorMessage('');
    onClearEditing();
  };

  const handleTabSwitch = (tab: StudioTab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
    if (tab === 'info') {
      setCategory('তথ্য');
    } else if (category === 'তথ্য') {
      setCategory('জাতীয়');
    }
  };

  const uploadSingleFile = async (file: File): Promise<string> => {
    const base64 = await fileToBase64(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(editorPin ? { 'x-editor-pin': editorPin } : {}),
      },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        dataBase64: base64,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'আপলোড ব্যর্থ হয়েছে');
    }
    return data.url as string;
  };

  const handlePhotoFilesChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    setErrorMessage('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadSingleFile(file);
        uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        if (!imageUrl) {
          setImageUrl(uploadedUrls[0]);
        }
        setGalleryUrls((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'ছবি আপলোডে সমস্যা হয়েছে');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleVideoFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    setErrorMessage('');
    try {
      const url = await uploadSingleFile(files[0]);
      setVideoUrl(url);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'ভিডিও আপলোডে সমস্যা হয়েছে');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'manage') return;

    if (!title.trim()) {
      setErrorMessage('অনুগ্রহ করে শিরোনাম লিখুন।');
      return;
    }

    if (activeTab === 'video' && !videoUrl.trim()) {
      setErrorMessage('ভিডিও লিংক দিন অথবা ডিভাইস থেকে ভিডিও আপলোড করুন।');
      return;
    }

    if (activeTab === 'photo' && !imageUrl.trim() && galleryUrls.length === 0) {
      setErrorMessage('অন্তত একটি ছবি আপলোড করুন বা ছবির লিংক দিন।');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        kind: activeTab,
        title: title.trim(),
        summary: summary.trim() || title.trim(),
        body: body.trim() || summary.trim() || title.trim(),
        category: activeTab === 'info' ? 'তথ্য' : category,
        infoType: activeTab === 'info' ? infoType : undefined,
        author: author.trim() || 'নিউজ বাংলা ৭ ডেস্ক',
        location: location.trim() || undefined,
        imageUrl: imageUrl.trim() || galleryUrls[0] || undefined,
        galleryUrls: galleryUrls.length > 0 ? galleryUrls : undefined,
        imageCaption: imageCaption.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        videoDuration: videoDuration.trim() || undefined,
        externalLink: externalLink.trim() || undefined,
        isLead,
        isBreaking,
      };

      const endpoint = editingItem ? `/api/news/${editingItem.id}` : '/api/news';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(editorPin ? { 'x-editor-pin': editorPin } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'প্রকাশ করতে সমস্যা হয়েছে');
      }

      await onPublished();
      setSuccessMessage(
        editingItem
          ? 'সংবাদটি সফলভাবে হালনাগাদ হয়েছে।'
          : 'সফলভাবে প্রকাশিত হয়েছে! দর্শকরা এখনই এটি দেখতে পারবেন।'
      );
      resetForm();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'প্রকাশ করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetLead = async (id: string) => {
    setErrorMessage('');
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(editorPin ? { 'x-editor-pin': editorPin } : {}),
        },
        body: JSON.stringify({ isLead: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'হালনাগাদ ব্যর্থ');
      await onPublished();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'সমস্যা হয়েছে');
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMessage('');
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: {
          ...(editorPin ? { 'x-editor-pin': editorPin } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'মুছতে সমস্যা হয়েছে');
      await onPublished();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'সমস্যা হয়েছে');
    }
  };

  const handleSavePin = async (remove = false) => {
    setPinFeedback('');
    try {
      const res = await fetch('/api/settings/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: currentPinForChange || editorPin,
          newPin: remove ? '' : pinInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'পিন সংরক্ষণে সমস্যা');
      if (remove) {
        onEditorPinChange('');
        setPinFeedback('পিন লক সরানো হয়েছে।');
      } else {
        onEditorPinChange(pinInput);
        setPinFeedback('নতুন এডিটর পিন সক্রিয় হয়েছে।');
      }
      setPinInput('');
      setCurrentPinForChange('');
      await onPublished();
    } catch (err) {
      setPinFeedback(err instanceof Error ? err.message : 'পিন সেট করতে সমস্যা');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="দ্রুত প্রকাশনা স্টুডিও"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#FBF9F5] h-full overflow-y-auto border-l border-[#E5DFD3] shadow-2xl flex flex-col">
        {/* Studio Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E5DFD3] flex items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1C1917]">
              {editingItem ? 'প্রতিবেদন সম্পাদনা' : 'দ্রুত সংবাদ ও তথ্য প্রকাশ'}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              খবর, ভিডিও, ছবি বা তথ্য প্রকাশের সঙ্গে সঙ্গেই মূল পাতায় যুক্ত হবে
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPinConfig((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#F5F1E8] hover:bg-[#EAE3D5] rounded-lg transition-colors cursor-pointer"
              title="এডিটর পিন সুরক্ষা"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{hasPin ? 'পিন সক্রিয়' : 'পিন সুরক্ষা'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClearEditing();
                onClose();
              }}
              className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F1E8] rounded-lg transition-colors cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Editor PIN Panel */}
        {showPinConfig && (
          <div className="px-6 py-4 bg-[#F5F1E8] border-b border-[#E5DFD3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1917]">
                <Lock className="w-3.5 h-3.5 text-[#9A3412]" />
                <span>সম্পাদক পিন সুরক্ষা (ঐচ্ছিক)</span>
              </div>
              <span className="text-xs text-[#78716C]">
                {hasPin ? 'পিন চালু আছে' : 'বর্তমানে উন্মুক্ত (পিন নেই)'}
              </span>
            </div>

            {hasPin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="password"
                  value={editorPin}
                  onChange={(e) => onEditorPinChange(e.target.value)}
                  placeholder="প্রকাশের জন্য বর্তমান পিন লিখুন"
                  className="px-3 py-2 text-sm bg-white border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#9A3412]"
                />
                <input
                  type="password"
                  value={currentPinForChange}
                  onChange={(e) => setCurrentPinForChange(e.target.value)}
                  placeholder="পরিবর্তন করতে পুরনো পিন"
                  className="px-3 py-2 text-sm bg-white border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#9A3412]"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="নতুন পিন (কমপক্ষে ৪ সংখ্যা)"
                className="flex-1 min-w-[180px] px-3 py-2 text-sm bg-white border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#9A3412]"
              />
              <button
                type="button"
                onClick={() => handleSavePin(false)}
                className="px-3.5 py-2 text-xs font-medium bg-[#1C1917] text-white rounded-lg hover:bg-[#292524] cursor-pointer"
              >
                পিন সেট করুন
              </button>
              {hasPin && (
                <button
                  type="button"
                  onClick={() => handleSavePin(true)}
                  className="px-3.5 py-2 text-xs font-medium text-[#B91C1C] bg-white border border-[#E5DFD3] rounded-lg hover:bg-[#FEE2E2]/40 cursor-pointer"
                >
                  পিন মুছুন
                </button>
              )}
            </div>
            {pinFeedback && <p className="text-xs text-[#9A3412]">{pinFeedback}</p>}
          </div>
        )}

        {/* If PIN is active and not yet entered */}
        {hasPin && !editorPin && !showPinConfig && (
          <div className="mx-6 mt-4 p-3.5 bg-white border border-[#E5DFD3] rounded-xl flex flex-wrap items-center gap-3">
            <Lock className="w-4 h-4 text-[#9A3412] shrink-0" />
            <input
              type="password"
              value={editorPin}
              onChange={(e) => onEditorPinChange(e.target.value)}
              placeholder="সম্পাদক পিন লিখে প্রকাশনা আনলক করুন..."
              className="flex-1 min-w-[180px] text-sm bg-transparent focus:outline-none"
            />
          </div>
        )}

        {/* Mode Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-[#E5DFD3] bg-[#FBF9F5]">
          <div className="flex items-center gap-1 p-1 bg-[#EFEAE0] rounded-xl overflow-x-auto">
            {[
              { id: 'news' as StudioTab, label: 'খবর', icon: FileText },
              { id: 'video' as StudioTab, label: 'ভিডিও', icon: Film },
              { id: 'photo' as StudioTab, label: 'ছবি', icon: Camera },
              { id: 'info' as StudioTab, label: 'তথ্য', icon: Info },
              { id: 'manage' as StudioTab, label: 'তালিকা', icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabSwitch(tab.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#1C1917] shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Messages */}
        {(errorMessage || successMessage) && (
          <div className="px-6 pt-4">
            {errorMessage && (
              <div className="p-3 bg-[#FEE2E2]/70 border border-[#FCA5A5] text-[#991B1B] text-sm rounded-xl">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-[#DCFCE7]/80 border border-[#86EFAC] text-[#14532D] text-sm rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Manage List View */}
        {activeTab === 'manage' ? (
          <div className="p-6 space-y-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#1C1917]">
                সকল প্রকাশিত বিষয় ({items.length})
              </h3>
            </div>
            <div className="divide-y divide-[#E5DFD3] bg-white border border-[#E5DFD3] rounded-xl overflow-hidden">
              {items.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 flex items-start justify-between gap-4 hover:bg-[#FBF9F5] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
                      <span className="font-semibold text-[#9A3412]">
                        {entry.kind === 'video'
                          ? 'ভিডিও'
                          : entry.kind === 'photo'
                            ? 'ছবি'
                            : entry.kind === 'info'
                              ? entry.infoType || 'তথ্য'
                              : entry.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatBengaliRelativeTime(entry.publishedAt)}</span>
                      {entry.isLead && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#1C1917]">মুখ্য সংবাদ</span>
                        </>
                      )}
                    </div>
                    <p className="font-serif text-sm font-semibold text-[#1C1917] line-clamp-2">
                      {entry.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!entry.isLead && entry.kind !== 'info' && (
                      <button
                        type="button"
                        onClick={() => handleSetLead(entry.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#9A3412] bg-[#F5F1E8] rounded-lg cursor-pointer whitespace-nowrap"
                      >
                        মুখ্য করুন
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(entry.kind);
                        setTitle(entry.title);
                        setSummary(entry.summary);
                        setBody(entry.body);
                        setCategory(entry.category);
                        setInfoType(entry.infoType || 'জরুরি তথ্য');
                        setAuthor(entry.author);
                        setLocation(entry.location || '');
                        setImageUrl(entry.imageUrl || '');
                        setGalleryUrls(entry.galleryUrls || []);
                        setImageCaption(entry.imageCaption || '');
                        setVideoUrl(entry.videoUrl || '');
                        setVideoDuration(entry.videoDuration || '');
                        setExternalLink(entry.externalLink || '');
                        setIsLead(Boolean(entry.isLead));
                        setIsBreaking(Boolean(entry.isBreaking));
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-[#1C1917] bg-[#EFEAE0] hover:bg-[#E5DFD3] rounded-lg cursor-pointer"
                    >
                      সম্পাদনা
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-[#78716C] hover:text-[#B91C1C] rounded-lg cursor-pointer"
                      aria-label="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Quick Publish Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                {activeTab === 'info'
                  ? 'তথ্যের শিরোনাম *'
                  : activeTab === 'video'
                    ? 'ভিডিও শিরোনাম *'
                    : activeTab === 'photo'
                      ? 'ছবির শিরোনাম *'
                      : 'খবরের শিরোনাম *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: শহরের নতুন মেট্রোরেল সেবায় যাত্রীদের স্বস্তি"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D6CEBE] rounded-xl text-base text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            {/* Category / Info Type & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeTab === 'info' ? (
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    তথ্যের ধরন
                  </label>
                  <select
                    value={infoType}
                    onChange={(e) => setInfoType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D6CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  >
                    {INFO_SUBTYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    সংবাদ বিভাগ
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D6CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  >
                    {NEWSROOM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  প্রতিবেদক / ডেস্ক ও স্থান
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="প্রতিবেদক"
                    className="w-full px-3 py-2.5 bg-white border border-[#D6CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="স্থান (ঐচ্ছিক)"
                    className="w-full px-3 py-2.5 bg-white border border-[#D6CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>
            </div>

            {/* Video input section (for video tab or optional in news) */}
            {(activeTab === 'video' || activeTab === 'news') && (
              <div className="p-4 bg-white border border-[#E5DFD3] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#1C1917]">
                    {activeTab === 'video' ? 'ভিডিও যুক্ত করুন *' : 'সংযুক্ত ভিডিও (ঐচ্ছিক)'}
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#EFEAE0] hover:bg-[#E5DFD3] text-[#1C1917] rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingMedia ? 'আপলোড হচ্ছে...' : 'ফোন/পিসি থেকে আপলোড'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleVideoFileChange(e.target.files)}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="YouTube, Vimeo বা সরাসরি MP4 লিংক পেস্ট করুন"
                    className="sm:col-span-2 px-3 py-2 bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-sm focus:outline-none focus:border-[#9A3412]"
                  />
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="সময় (যেমন: ০২:৩০)"
                    className="px-3 py-2 bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-sm focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>
            )}

            {/* Photo upload / URL section */}
            <div className="p-4 bg-white border border-[#E5DFD3] rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-medium text-[#1C1917]">
                  {activeTab === 'photo' ? 'ছবি যুক্ত করুন (একাধিক দেওয়া যাবে) *' : 'প্রচ্ছদ ছবি (ঐচ্ছিক)'}
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#9A3412] hover:bg-[#7C2D12] text-white rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingMedia ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ছবি আপলোড'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoFilesChange(e.target.files)}
                  />
                </label>
              </div>

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="অথবা ছবির সরাসরি লিংক (URL) দিন..."
                className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-sm focus:outline-none focus:border-[#9A3412]"
              />

              {/* Quick Newsroom Stock Picker */}
              <div>
                <p className="text-xs text-[#78716C] mb-1.5">দ্রুত নমুনা ছবি নির্বাচন:</p>
                <div className="grid grid-cols-4 gap-2">
                  {STUDIO_IMAGES.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className={`group relative aspect-4/3 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        imageUrl === img.url ? 'border-[#9A3412]' : 'border-transparent'
                      }`}
                    >
                      <EditorialImage src={img.url} alt={img.label} />
                      <span className="sr-only">{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {(imageUrl || galleryUrls.length > 0) && (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {(galleryUrls.length > 0 ? galleryUrls : imageUrl ? [imageUrl] : []).map(
                      (url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          className="relative w-24 h-16 rounded-lg overflow-hidden border border-[#E5DFD3]"
                        >
                          <EditorialImage src={url} alt={`প্রিভিউ ${idx + 1}`} />
                          <button
                            type="button"
                            onClick={() => {
                              setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
                              if (imageUrl === url) setImageUrl('');
                            }}
                            className="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-full cursor-pointer"
                            aria-label="ছবি সরান"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="ছবির ক্যাপশন লিখুন (ঐচ্ছিক)"
                    className="w-full px-3 py-1.5 bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-xs focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                সংক্ষিপ্ত সারমর্ম (প্রচ্ছদে দেখাবে)
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="১-২ লাইনে মূল খবর বা তথ্যটি লিখুন..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#D6CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            {/* Full Body */}
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                বিস্তারিত বিবরণ
              </label>
              <textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="পূর্ণাঙ্গ প্রতিবেদন, ভিডিওর বিবরণ বা প্রয়োজনীয় তথ্য এখানে লিখুন..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#D6CEBE] rounded-xl text-sm text-[#1C1917] leading-relaxed focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            {/* Optional external link & placement checkboxes */}
            <div className="space-y-3">
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="তথ্যসূত্র বা ওয়েবসাইট লিংক (ঐচ্ছিক, যেমন: https://...)"
                className="w-full px-3.5 py-2 bg-white border border-[#D6CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
              />

              {activeTab !== 'info' && (
                <div className="flex flex-wrap items-center gap-5 pt-1">
                  <label className="inline-flex items-center gap-2 text-sm text-[#1C1917] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLead}
                      onChange={(e) => setIsLead(e.target.checked)}
                      className="w-4 h-4 accent-[#9A3412] rounded"
                    />
                    <span>প্রথম পাতার মুখ্য সংবাদ হিসেবে দিন</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-[#1C1917] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="w-4 h-4 accent-[#9A3412] rounded"
                    />
                    <span>সর্বশেষ ব্রেকিং টিকারে দেখান</span>
                  </label>
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between gap-3 sticky bottom-0 bg-[#FBF9F5] pb-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 text-sm font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFEAE0] rounded-xl transition-colors cursor-pointer"
              >
                রিসেট
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingMedia}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
              >
                {submitting
                  ? 'প্রকাশ হচ্ছে...'
                  : editingItem
                    ? 'হালনাগাদ সংরক্ষণ করুন'
                    : 'এখনই প্রকাশ করুন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
