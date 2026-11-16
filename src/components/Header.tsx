import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type NavSection = 'all' | 'video' | 'photo' | 'info' | 'archive';

interface HeaderProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenPublish: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'all', label: 'সর্বশেষ' },
  { id: 'video', label: 'ভিডিও' },
  { id: 'photo', label: 'ছবি' },
  { id: 'info', label: 'তথ্যকেন্দ্র' },
  { id: 'archive', label: 'বিভাগ' },
];

export function Header({ activeSection, onSelectSection, onOpenPublish }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-[#E5DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark only */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412]"
        >
          News Bangla 7
        </a>

        {/* Zone 2: Clean single-line text navigation */}
        <nav className="hidden md:flex items-center gap-7" aria-label="প্রধান নেভিগেশন">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412] ${
                  isActive
                    ? 'text-[#9A3412] border-[#9A3412]'
                    : 'text-[#57534E] border-transparent hover:text-[#1C1917] hover:border-[#D6CEBE]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary CTA (+ responsive mobile drawer trigger) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPublish}
            className="px-4 py-2 text-sm font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]"
          >
            দ্রুত প্রকাশ
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-[#1C1917] hover:bg-[#EFECE5] rounded-lg transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden border-t border-[#E5DFD3] bg-[#FBF9F5] px-4 py-3 flex flex-wrap items-center gap-4"
          aria-label="মোবাইল নেভিগেশন"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  isActive
                    ? 'text-[#9A3412] border-[#9A3412]'
                    : 'text-[#57534E] border-transparent hover:text-[#1C1917]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
