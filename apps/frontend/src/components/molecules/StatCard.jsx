import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  className = ''
}) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-brand p-5 shadow-brand transition-all hover:border-slate-300 ${className}`}>
      <div className="flex items-center justify-between text-slate-500 font-semibold text-xs tracking-wide uppercase">
        <span>{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 grid place-items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold tracking-tight text-ink mt-3">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-slate-400 mt-2 font-medium">
          {subtext}
        </div>
      )}
    </div>
  );
}
