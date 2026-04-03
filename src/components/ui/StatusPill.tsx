import type { Grade } from '../../types/inspection';

interface StatusPillProps {
  grade: Grade | null;
  size?: 'sm' | 'md';
}

const gradeStyles: Record<Grade, string> = {
  pass: 'bg-pass/15 text-pass',
  advisory: 'bg-advisory/15 text-advisory',
  fail: 'bg-fail/15 text-fail',
};

const gradeLabels: Record<Grade, string> = {
  pass: 'PASS',
  advisory: 'ADVISORY',
  fail: 'FAIL',
};

export function StatusPill({ grade, size = 'md' }: StatusPillProps) {
  if (!grade) {
    return (
      <span className={`inline-flex items-center rounded-full bg-border/50 text-muted font-body font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        NOT GRADED
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full font-body font-semibold ${gradeStyles[grade]} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {gradeLabels[grade]}
    </span>
  );
}
