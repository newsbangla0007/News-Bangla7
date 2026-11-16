import { type FormEvent, useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা লিখুন।';
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return 'সঠিক ইমেইল ঠিকানা দিন (যেমন: reader@example.com)।';
    }
    return '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setStatus('idle');
      return;
    }

    setError('');
    setStatus('submitting');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || 'সাবস্ক্রিপশন সম্পন্ন করা যায়নি।');
      }

      setStatus('success');
      setSuccessMessage(
        data.message || 'ধন্যবাদ! প্রতিদিনের প্রধান সংবাদ আপনার ইমেইলে পৌঁছে যাবে।'
      );
      setEmail('');
    } catch (err) {
      setStatus('idle');
      setError(
        err instanceof Error ? err.message : 'সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করুন।'
      );
    }
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="font-serif text-base font-bold text-[#1C1917]">
        নিউজলেটার ও মেইলিং লিস্ট
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-[#57534E] leading-relaxed">
        প্রতিদিনের বাছাই করা শীর্ষ সংবাদ ও বিশেষ প্রতিবেদন সরাসরি ইনবক্সে পেতে যুক্ত হন।
      </p>

      {status === 'success' ? (
        <div
          role="status"
          className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#D6CEBE] bg-white px-3.5 py-3 text-xs sm:text-sm text-[#1C1917]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#9A3412] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-medium">{successMessage}</p>
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setSuccessMessage('');
              }}
              className="text-xs font-medium text-[#9A3412] hover:text-[#7C2D12] underline underline-offset-2 cursor-pointer"
            >
              অন্য একটি ইমেইল যোগ করুন
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                ইমেইল ঠিকানা
              </label>
              <Mail
                className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="footer-newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="আপনার ইমেইল ঠিকানা লিখুন..."
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'footer-newsletter-error' : undefined}
                disabled={status === 'submitting'}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none transition-colors ${
                  error
                    ? 'border-[#991B1B] focus:border-[#991B1B]'
                    : 'border-[#E5DFD3] focus:border-[#9A3412]'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-4 py-2 text-sm font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]"
            >
              {status === 'submitting' ? 'যুক্ত হচ্ছে...' : 'যুক্ত হন'}
            </button>
          </div>

          {error && (
            <p
              id="footer-newsletter-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-[#991B1B]"
            >
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
