import React from 'react';

export default function Badge({
  children,
  variant = 'default', // 'requested', 'pending_approval', 'approved', 'changes_requested', 'cancelled', 'info', 'success', 'warning', 'danger'
  size = 'md',
  className = ''
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg'
  };

  const variantStyles = {
    requested: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    pending_approval: 'bg-blue-50 text-blue-800 border border-blue-200/60',
    pending_cmo: 'bg-blue-50 text-blue-800 border border-blue-200/60',
    approved: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
    changes_requested: 'bg-rose-50 text-rose-800 border border-rose-200/60',
    cancelled: 'bg-slate-100 text-slate-600 border border-slate-200',
    draft: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    default: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-sans whitespace-nowrap ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.default} ${className}`}>
      {children}
    </span>
  );
}
