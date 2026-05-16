import React from 'react';

type ButtonVariant = 'primary' | 'accent' | 'pass' | 'advisory' | 'fail' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-white text-primary hover:bg-white/90',
  accent: 'bg-accent text-primary font-semibold hover:brightness-95',
  pass: 'bg-pass text-white hover:brightness-110',
  advisory: 'bg-advisory text-white hover:brightness-110',
  fail: 'bg-fail text-white hover:brightness-110',
  ghost: 'bg-transparent text-white/60 border border-white/10 hover:border-white/20 hover:text-white',
  danger: 'bg-fail/10 text-fail border border-fail/20 hover:bg-fail/20',
};

const sizeClasses = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-[56px] px-5 text-base',
  lg: 'min-h-[64px] px-6 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth = false, size = 'md', className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-2xl font-body font-semibold
          transition-all duration-[200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none
          active:scale-[0.97]
          disabled:opacity-40 disabled:pointer-events-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
