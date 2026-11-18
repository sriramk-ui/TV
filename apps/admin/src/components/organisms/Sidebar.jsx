import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  MailCheck,
  ShieldCheck,
  Activity,
  LogOut,
  X
} from 'lucide-react';
import Avatar from '../atoms/Avatar';

export default function Sidebar({
  user,
  isOpen = false,
  onClose,
  onLogout
}) {
  const navItems = [
    { to: '/', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/staff', label: 'Staff Directory', icon: Users },
    { to: '/integrations', label: 'Integrations & APIs', icon: Settings },
    { to: '/finance-recipients', label: 'Accounts Mailboxes', icon: MailCheck },
    { to: '/audit', label: 'Audit Trail', icon: ShieldCheck },
    { to: '/health', label: 'System Health', icon: Activity }
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-white z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue text-white font-bold text-lg grid place-items-center shadow-md shadow-blue/20">
              S
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-tight">
                Sri Sankara TV
              </div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                ADMIN CONSOLE
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Governance
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-brand-md text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Avatar name={user?.name} role={user?.role} size="md" className="bg-slate-800 text-white border-slate-700" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Chief Managing Officer
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
