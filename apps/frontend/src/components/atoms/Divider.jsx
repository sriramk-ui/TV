import React from 'react';

export default function Divider({
  orientation = 'horizontal',
  label,
  className = ''
}) {
  if (orientation === 'vertical') {
    return <div className={`inline-block w-px bg-slate-200 self-stretch my-1 mx-2 ${className}`} />;
  }

  if (label) {
    return (
      <div className={`relative flex items-center my-4 ${className}`}>
        <div className="flex-grow border-t border-slate-200" />
        <span className="flex-shrink mx-3 text-xs uppercase tracking-wider font-semibold text-slate-400">
          {label}
        </span>
        <div className="flex-grow border-t border-slate-200" />
      </div>
    );
  }

  return <hr className={`border-t border-slate-200 my-4 ${className}`} />;
}
