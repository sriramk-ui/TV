import React from 'react';
import { Menu } from 'lucide-react';
import Button from '../atoms/Button';

export default function Header({
  eyebrow = 'SRI SANKARA TV / PRODUCTION',
  title,
  subtitle,
  actions,
  onMenuToggle
}) {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between gap-4 mb-4 lg:hidden">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-sm font-semibold"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
              {eyebrow}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
