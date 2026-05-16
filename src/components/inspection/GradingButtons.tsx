import { Check, AlertTriangle, X } from 'lucide-react';
import type { Grade } from '../../types/inspection';

interface GradingButtonsProps {
  grade: Grade | null;
  onChange: (grade: Grade) => void;
}

const gradeConfig: { grade: Grade; label: string; Icon: typeof Check; inactive: string; active: string }[] = [
  { grade: 'pass', label: 'PASS', Icon: Check, inactive: 'border-pass/20 text-pass/60', active: 'bg-pass text-white border-pass shadow-[0_0_20px_rgba(34,197,94,0.2)]' },
  { grade: 'advisory', label: 'ADVISORY', Icon: AlertTriangle, inactive: 'border-advisory/20 text-advisory/60', active: 'bg-advisory text-white border-advisory shadow-[0_0_20px_rgba(245,158,11,0.2)]' },
  { grade: 'fail', label: 'FAIL', Icon: X, inactive: 'border-fail/20 text-fail/60', active: 'bg-fail text-white border-fail shadow-[0_0_20px_rgba(239,68,68,0.2)]' },
];

export function GradingButtons({ grade, onChange }: GradingButtonsProps) {
  const handleTap = (g: Grade) => {
    if (navigator.vibrate) navigator.vibrate(10);
    onChange(g);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {gradeConfig.map(({ grade: g, label, Icon, inactive, active }) => {
        const isActive = grade === g;
        return (
          <button
            key={g}
            onClick={() => handleTap(g)}
            className={`
              min-h-[56px] rounded-2xl border-2 font-body font-semibold text-sm
              flex items-center justify-center gap-1.5
              transition-all duration-[200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
              active:scale-[0.95] select-none
              ${isActive ? active : inactive}
            `}
          >
            <Icon size={16} strokeWidth={isActive ? 3 : 2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
