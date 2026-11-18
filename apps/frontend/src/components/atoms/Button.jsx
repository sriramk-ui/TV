import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'secondary', // 'primary', 'secondary', 'muted', 'danger', 'flat', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-brand-md transition-all duration-150 select-none whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-3.5 py-2.5 gap-2 rounded-brand-md',
    lg: 'text-base px-5 py-3 gap-2.5 rounded-brand-md'
  };

  const variantStyles = {
    primary: 'bg-deep text-white hover:bg-slate-800 border border-deep shadow-sm hover:shadow',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm',
    muted: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300',
    flat: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-0 shadow-none',
    ghost: 'bg-transparent text-blue hover:underline p-0 border-0 shadow-none'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.secondary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
}
