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
          <label className="block text-sm font-body font-medium text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full min-h-[48px] px-4 rounded-xl border bg-white font-body text-primary
            placeholder:text-muted/60
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            disabled:bg-border/20 disabled:text-muted
            ${error ? 'border-fail ring-1 ring-fail' : 'border-border'}
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
