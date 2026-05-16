import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'elevated';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantClasses = {
  default: 'bg-dark border border-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
  glass: 'glass',
  elevated: 'bg-elevated border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
};

export function Card({ children, className = '', onClick, padding = 'md', variant = 'default' }: CardProps) {
  const interactive = onClick
    ? 'cursor-pointer hover:border-white/[0.15] active:scale-[0.99] transition-all duration-[200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]'
    : 'transition-colors duration-[200ms]';

  return (
    <div
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${interactive} ${className}`}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
