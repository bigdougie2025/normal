import { Check } from 'lucide-react';
import type { Grade } from '../../types/inspection';

interface GradingButtonsProps {
  grade: Grade | null;
  onChange: (grade: Grade) => void;
}

const gradeConfig: { grade: Grade; label: string; bg: string; activeBg: string }[] = [
  { grade: 'pass', label: 'PASS', bg: 'border-pass/40 text-pass', activeBg: 'bg-pass text-white border-pass' },
  { grade: 'advisory', label: 'ADVISORY', bg: 'border-advisory/40 text-advisory', activeBg: 'bg-advisory text-white border-advisory' },
  { grade: 'fail', label: 'FAIL', bg: 'border-fail/40 text-fail', activeBg: 'bg-fail text-white border-fail' },
];

export function GradingButtons({ grade, onChange }: GradingButtonsProps) {
  const handleTap = (g: Grade) => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
    onChange(g);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {gradeConfig.map(({ grade: g, label, bg, activeBg }) => {
        const isActive = grade === g;
        return (
          <button
            key={g}
            onClick={() => handleTap(g)}
            className={`
              min-h-[56px] rounded-xl border-2 font-body font-semibold text-sm
              flex items-center justify-center gap-1.5
              transition-all duration-150 active:scale-95 select-none
              ${isActive ? activeBg : bg}
            `}
          >
            {isActive && <Check size={18} strokeWidth={3} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
