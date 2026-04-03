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
          <label className="block text-sm font-body font-medium text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full min-h-[100px] px-4 py-3 rounded-xl border bg-white font-body text-primary
            placeholder:text-muted/60 resize-y
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            ${error ? 'border-fail ring-1 ring-fail' : 'border-border'}
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
