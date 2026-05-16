import { Check, AlertTriangle, X } from 'lucide-react';
import type { Grade } from '../../types/inspection';

interface StatusPillProps {
  grade: Grade | null;
  size?: 'sm' | 'md';
}

const gradeConfig: Record<Grade, { bg: string; text: string; label: string; Icon: typeof Check }> = {
  pass: { bg: 'bg-pass/15', text: 'text-pass', label: 'PASS', Icon: Check },
  advisory: { bg: 'bg-advisory/15', text: 'text-advisory', label: 'ADVISORY', Icon: AlertTriangle },
  fail: { bg: 'bg-fail/15', text: 'text-fail', label: 'FAIL', Icon: X },
};

export function StatusPill({ grade, size = 'md' }: StatusPillProps) {
  if (!grade) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-white/5 text-muted font-body font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        NOT GRADED
      </span>
    );
  }

  const config = gradeConfig[grade];
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-body font-semibold ${config.bg} ${config.text} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <config.Icon size={iconSize} strokeWidth={3} />
      {config.label}
    </span>
  );
}
