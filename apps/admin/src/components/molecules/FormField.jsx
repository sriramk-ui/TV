import React from 'react';

export default function FormField({
  label,
  required = false,
  helperText,
  error,
  children,
  className = ''
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </span>
        </label>
      )}
      {children}
      {error ? (
        <span className="text-xs text-red-600 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-400 font-normal leading-relaxed">{helperText}</span>
      ) : null}
    </div>
  );
}
