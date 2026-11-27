import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  openConflictsCount?: number;
}

const NAV_OPS = [
  { label: 'Main Dashboard', path: '/', icon: 'grid_view' },
  { label: 'Document Repository', path: '/repository', icon: 'folder_data' },
  { label: 'Upload Documents', path: '/upload', icon: 'upload_file', minRole: 'researcher' },
  { label: 'AI Assistant', path: '/assistant', icon: 'psychology', minRole: 'analyst' },
  { label: 'Document Processing', path: '/processing', icon: 'layers' },
  { label: 'Verification Center', path: '/verification', icon: 'rule', badge: true },
  { label: 'Report Generator', path: '/reports', icon: 'summarize', minRole: 'analyst' },
  { label: 'Analytics & Insights', path: '/analytics', icon: 'insights' },
];

const NAV_GOV = [
  { label: 'User Management', path: '/users', icon: 'group', minRole: 'admin' },
  { label: 'Audit Logs', path: '/audit', icon: 'verified', minRole: 'admin' },
  { label: 'Settings & Help', path: '/settings', icon: 'tune' },
];

export const AppShell: React.FC<AppShellProps> = ({ children, openConflictsCount = 0 }) => {
  const { user, logout, hasMinRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState('');

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/repository?q=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  const activeItem = [...NAV_OPS, ...NAV_GOV].find(
    (item) => item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(item.path))
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Fixed Left Sidebar (320px per Stitch DESIGN.md) */}
      <aside className="fixed left-0 top-0 h-full w-80 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/30">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center gap-3 bg-surface-container-low/50 border-b border-outline-variant/20">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[24px]">landscape</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-[20px] font-bold text-on-surface leading-tight tracking-tight">
                GeoStratum
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
                CMPDI · Coal India AI
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="overflow-y-auto flex-1 px-4 py-4">
            <div className="px-2 mb-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-outline font-semibold">
                Operations & Core Models
              </span>
            </div>
            <nav className="space-y-1">
              {NAV_OPS.filter((item) => !item.minRole || hasMinRole(item.minRole)).map((item) => {
                const isActive =
                  item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between min-h-[44px] px-4 py-2 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="text-[16px]">{item.label}</span>
                    </div>
                    {item.badge && openConflictsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[11px] font-semibold">
                        {openConflictsCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-4 pb-1 px-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-outline font-semibold">
                  Governance
                </span>
              </div>
              {NAV_GOV.filter((item) => !item.minRole || hasMinRole(item.minRole)).map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between min-h-[44px] px-4 py-2 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="text-[16px]">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="p-4 bg-surface-container-low/60 m-2 rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-headline font-bold flex items-center justify-center shrink-0">
                {user.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-headline text-[15px] font-semibold text-on-surface truncate">
                    {user.full_name}
                  </span>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center text-outline hover:text-error transition-colors rounded-lg"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                  </button>
                </div>
                <p className="text-[13px] text-on-surface-variant truncate">{user.designation || 'Employee'}</p>
                <p className="font-mono text-[11px] text-outline truncate">{user.subsidiary} · {user.location}</p>
                <div className="mt-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant font-mono text-[11px] font-semibold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                    {user.roles[0] || 'viewer'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="pl-80 min-h-screen">
        {/* Sticky Header (80px) */}
        <header className="fixed top-0 left-80 right-0 h-20 bg-surface/85 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
          <div className="h-20 w-full px-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0 flex-1 max-w-2xl">
              <div className="hidden xl:flex items-center gap-2 font-mono text-[12px] text-on-surface-variant shrink-0">
                <span className="text-outline font-medium">Coal India Limited</span>
                <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                <span className="text-outline font-medium">CMPDI</span>
                <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                <span className="font-semibold text-primary truncate">{activeItem?.label || 'Workspace'}</span>
              </div>

              <form onSubmit={handleGlobalSearch} className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 bg-surface-container-low rounded-xl text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all shadow-[0_0_0_1px_rgba(115,118,134,0.15)] focus:shadow-[0_0_0_2px_#004ac6]"
                  placeholder="Search geological reports, mines, borehole logs..."
                  type="text"
                />
              </form>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-mono text-[11px] font-medium text-on-surface-variant">
                  System Operational · Prototype
                </span>
              </div>
              {hasMinRole('researcher') && (
                <Link
                  to="/upload"
                  className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary font-headline text-[15px] font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>New Upload</span>
                </Link>
              )}
              <Link
                to="/help"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                title="Help & Support"
              >
                <span className="material-symbols-outlined text-[22px]">help_outline</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-12 px-8">{children}</main>
      </div>
    </div>
  );
};
