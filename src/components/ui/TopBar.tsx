import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function TopBar({ title, showBack = false, onBack, rightAction }: TopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors duration-[150ms]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white/70" />
          </button>
        )}
        <h1 className="flex-1 font-headline text-base font-black uppercase tracking-tight text-white truncate">
          {title}
        </h1>
        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>
    </header>
  );
}
