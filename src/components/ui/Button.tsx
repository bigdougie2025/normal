import React from 'react';

type ButtonVariant = 'primary' | 'accent' | 'pass' | 'advisory' | 'fail' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-dark active:bg-dark',
  accent: 'bg-accent text-primary font-semibold hover:brightness-95 active:scale-95',
  pass: 'bg-pass text-white hover:brightness-110 active:scale-95',
  advisory: 'bg-advisory text-white hover:brightness-110 active:scale-95',
  fail: 'bg-fail text-white hover:brightness-110 active:scale-95',
  ghost: 'bg-transparent text-primary border border-border hover:bg-border/30 active:scale-95',
  danger: 'bg-fail/10 text-fail border border-fail/30 hover:bg-fail/20 active:scale-95',
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
          inline-flex items-center justify-center rounded-xl font-body font-semibold
          transition-all duration-150 select-none
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
