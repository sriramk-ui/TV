import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  PhoneCall,
  MailCheck,
  Activity,
  LogOut,
  X
} from 'lucide-react';
import Avatar from '../atoms/Avatar';
import { ROLE_LABELS } from '@sankara/constants';

export default function Sidebar({
  user,
  pendingApprovalsCount = 0,
  isOpen = false,
  onClose,
  onLogout
}) {
  const role = user?.role || 'crew';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      allowed: ['ep', 'production_head', 'cmo', 'accounts', 'crew']
    },
    {
      to: '/schedule',
      label: 'Shoot Schedule',
      icon: Calendar,
      allowed: ['ep', 'production_head', 'cmo', 'accounts', 'crew']
    },
    {
      to: '/pafs',
      label: 'PAF & Budgets',
      icon: FileSpreadsheet,
      allowed: ['production_head', 'cmo', 'accounts'] // Zero EP or Crew visibility
    },
    {
      to: '/approvals',
      label: 'CMO Approvals',
      icon: CheckCircle2,
      badge: pendingApprovalsCount,
      allowed: ['cmo']
    },
    {
      to: '/staff',
      label: 'Team Directory',
      icon: Users,
      allowed: ['production_head', 'cmo']
    },
    {
      to: '/calls',
      label: 'Voice Dispatch',
      icon: PhoneCall,
      allowed: ['production_head', 'cmo']
    },
    {
      to: '/finance-settings',
      label: 'Accounts Recipients',
      icon: MailCheck,
      allowed: ['cmo']
    },
    {
      to: '/logs',
      label: 'Delivery Log',
      icon: Activity,
      allowed: ['cmo']
    }
  ];

  const visibleItems = navItems.filter((item) => item.allowed.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/90 z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-deep text-white font-bold text-lg grid place-items-center shadow-md shadow-deep/15">
              S
            </div>
            <div>
              <div className="text-sm font-extrabold text-deep tracking-tight">
                Sri Sankara TV
              </div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                PRODUCTION PORTAL
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-brand-md text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 text-blue shadow-xs font-bold'
                        : 'text-slate-600 hover:text-deep hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Avatar name={user?.name} role={user?.role} size="md" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-ink truncate">
                {user?.name || 'Production User'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {ROLE_LABELS[role] || role}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
