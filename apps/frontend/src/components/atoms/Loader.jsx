import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({
  size = 'md',
  message = '',
  fullPage = false,
  className = ''
}) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}>
      <Loader2 className={`animate-spin text-blue ${sizeStyles[size] || sizeStyles.md}`} />
      {message && <p className="text-sm text-slate-500 font-medium">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 grid place-items-center">
        {content}
      </div>
    );
  }

  return content;
}
