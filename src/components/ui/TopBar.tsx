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
    <header className="sticky top-0 z-50 bg-primary text-white">
      <div className="flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="flex-1 font-headline text-lg font-black uppercase tracking-tight truncate">
          {title}
        </h1>
        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>
    </header>
  );
}
