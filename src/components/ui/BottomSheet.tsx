import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-h-[85vh] bg-dark rounded-t-3xl overflow-hidden animate-slide-up border-t border-white/[0.08]">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          {title && (
            <h3 className="font-headline text-sm font-black uppercase tracking-tight text-white">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/[0.06] transition-colors ml-auto"
            aria-label="Close"
          >
            <X size={18} className="text-white/50" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(85vh-60px)] p-4 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
