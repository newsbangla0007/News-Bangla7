import { useState } from 'react';
import { Newspaper } from 'lucide-react';

interface EditorialImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function EditorialImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: EditorialImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className="w-full h-full bg-[#EFEAE0] flex flex-col items-center justify-center p-6 text-center select-none"
        role="img"
        aria-label={alt}
      >
        <Newspaper className="w-8 h-8 text-[#9A3412]/70 mb-2" strokeWidth={1.5} />
        <span className="font-serif text-sm font-medium text-[#57534E] line-clamp-2 max-w-[220px]">
          {fallbackTitle || 'News Bangla 7'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
