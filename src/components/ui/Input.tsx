import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-body font-medium text-white/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full min-h-[48px] px-4 rounded-xl border bg-white/[0.04] font-body text-white
            placeholder:text-white/25
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent
            disabled:bg-white/[0.02] disabled:text-muted
            ${error ? 'border-fail ring-1 ring-fail/50' : 'border-white/[0.08]'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-fail font-body">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted font-body">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
