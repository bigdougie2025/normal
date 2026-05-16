import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-body font-medium text-white/70">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full min-h-[100px] px-4 py-3 rounded-xl border bg-white/[0.04] font-body text-white
            placeholder:text-white/25 resize-y
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent
            ${error ? 'border-fail ring-1 ring-fail/50' : 'border-white/[0.08]'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-fail font-body">{error}</p>}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
