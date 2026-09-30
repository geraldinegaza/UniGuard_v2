import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Radio,
  Building2,
  PhoneCall,
  Shield,
  LogOut,
  RefreshCw,
  User as UserIcon,
  Wifi,
  WifiOff,
  ChevronRight,
  Database,
  Home,
  HeartHandshake,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';

export interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onUserChange?: (user: User) => void;
  isOnline: boolean;
  setIsOnline?: (online: boolean) => void;
  pendingOutboxCount: number;
  onSignOut?: () => void;
  onOpenReportModal?: () => void;
  onOpenSupabaseModal?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  isOnline,
  setIsOnline,
  pendingOutboxCount,
  onSignOut,
  onOpenReportModal,
  onOpenSupabaseModal,
}) => {
  const users = storage.getUsers();

  const handleRoleCycle = () => {
    if (!onUserChange) return;
    const currentIndex = users.findIndex((u) => u.id === currentUser.id);
    const nextIndex = (currentIndex + 1) % users.length;
    const nextUser = users[nextIndex];
    if (nextUser) {
      storage.setActiveUserId(nextUser.id);
      onUserChange(nextUser);
    }
  };

  const isResident = currentUser.role === 'citizen';

  // Navigation Items exclusively for the Resident Portal: Home, Relief, Guides, FAQs, Shelters, Hotlines only
  const residentNavItems = [
    {
      id: 'home',
      label: 'Home',
      shortLabel: 'Home',
      icon: Home,
      badge: null,
    },
    {
      id: 'relief',
      label: 'Relief',
      shortLabel: 'Relief',
      icon: HeartHandshake,
      badge: null,
    },
    {
      id: 'guides',
      label: 'Guides',
      shortLabel: 'Guides',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'faqs',
      label: 'FAQs',
      shortLabel: 'FAQs',
      icon: HelpCircle,
      badge: null,
    },
    {
      id: 'shelters',
      label: 'Shelters',
      shortLabel: 'Shelters',
      icon: Building2,
      badge: null,
    },
    {
      id: 'hotlines',
      label: 'Hotlines',
      shortLabel: 'Hotlines',
      icon: PhoneCall,
      badge: null,
    },
  ];

  // Navigation Items for Admin and Operations Staff
  const adminNavItems = [
    {
      id: 'overview',
      label: 'Command Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'incidents',
      label: 'Hazard Intelligence',
      shortLabel: 'Hazards',
      icon: AlertTriangle,
      badge: '18 Active',
    },
    {
      id: 'advisories',
      label: 'Early Warnings',
      shortLabel: 'Bulletins',
      icon: Radio,
      badge: 'Signal #2',
    },
    {
      id: 'shelters',
      label: 'Evacuation Centers',
      shortLabel: 'Shelters',
      icon: Building2,
      badge: '4 Open',
    },
    {
      id: 'hotlines',
      label: 'Emergency Hotlines',
      shortLabel: 'Dispatch',
      icon: PhoneCall,
      badge: '24/7',
    },
  ];

  const navItems = isResident ? residentNavItems : adminNavItems;

  return (
    <aside className="w-full lg:w-64 xl:w-72 bg-[#991B1B] text-white rounded-[28px] sm:rounded-[32px] m-2 sm:m-3 lg:m-4 flex flex-col justify-between shrink-0 relative overflow-hidden shadow-2xl z-20 border border-rose-900/30">
      {/* Top Header & Emblem Badge */}
      <div className="pt-6 sm:pt-7 px-4 flex flex-col items-center text-center relative z-10">
        {/* Elevated Centered Circular White Pill Badge with Soft Drop Shadow */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] flex items-center justify-center text-[#991B1B] mb-3 transition-transform hover:scale-105 border-2 border-rose-100">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 fill-[#991B1B]/15 stroke-[#991B1B] stroke-[2.2]" />
        </div>

        <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
          Uni<span className="text-rose-200">Guard</span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-white/15 text-white ml-1">
            LDRRMC
          </span>
        </h1>
        <p className="text-[11px] font-medium text-rose-200/90 tracking-wider uppercase mt-0.5">
          Lingayen Operations Hub
        </p>

        {/* Thin divider */}
        <div className="w-full h-px bg-rose-800/60 my-4" />
      </div>

      {/* Signature Scooped Navigation Items */}
      <nav className="flex-1 py-1 space-y-1 relative z-10">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id ||
            (item.id === 'overview' && activeTab === 'home') ||
            (item.id === 'home' && activeTab === 'overview') ||
            (item.id === 'incidents' && (activeTab === 'feed' || activeTab === 'triage'));
          const Icon = item.icon;

          return (
            <div key={item.id} className="relative">
              {isActive ? (
                /* Scooped Cutout Active Item */
                <div className="relative pl-3 mr-0">
                  {/* Inverted Fillet Curve Top */}
                  <svg
                    className="absolute right-0 -top-4 w-4 h-4 pointer-events-none fill-white"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M 16 0 A 16 16 0 0 1 0 16 L 16 16 Z" />
                  </svg>

                  {/* Active White Tab Body: rounded pill cap on left, flush on right */}
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className="w-full bg-white text-[#991B1B] rounded-l-full py-3 px-4 flex items-center justify-between font-bold text-sm shadow-md transition-all relative z-10 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Cyan Indicator Dot and Upward Accent Line */}
                      <div className="relative flex items-center justify-center shrink-0">
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#00BCD4] rounded-full"
                          aria-hidden="true"
                        />
                        <span className="w-2 h-2 rounded-full bg-[#00BCD4] shadow-[0_0_8px_#00BCD4]" />
                      </div>

                      <Icon className="w-4 h-4 text-[#991B1B] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-[#991B1B] shrink-0 ml-1">
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Inverted Fillet Curve Bottom */}
                  <svg
                    className="absolute right-0 -bottom-4 w-4 h-4 pointer-events-none fill-white"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M 0 0 A 16 16 0 0 1 16 16 L 16 0 Z" />
                  </svg>
                </div>
              ) : (
                /* Inactive Navigation Item */
                <div className="px-3">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className="w-full text-white/90 hover:text-white hover:bg-white/10 rounded-2xl py-2.5 px-3.5 flex items-center justify-between text-sm font-semibold transition-all duration-200 cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 text-rose-200/80 group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/20 text-rose-100 shrink-0 ml-1">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom User Controls & Botanical Decorative Motif */}
      <div className="p-3 sm:p-4 relative z-10 space-y-2 mt-auto">
        {/* User Role Card & Switcher (Shown for staff; for resident, profile and caution are moved to header) */}
        {currentUser.role !== 'citizen' ? (
          <>
            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-2.5 border border-white/10 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 font-bold text-xs uppercase">
                    {currentUser.full_name ? currentUser.full_name[0] : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold truncate text-[11px] leading-tight">
                      {currentUser.full_name || 'Operations Officer'}
                    </p>
                    <p className="text-rose-200/90 text-[10px] capitalize">
                      {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenReportModal && (
                    <div className="relative group">
                      <button
                        onClick={onOpenReportModal}
                        className="p-1.5 rounded-lg bg-white text-[#991B1B] hover:bg-rose-50 hover:scale-105 active:scale-95 shadow-xs transition-all cursor-pointer flex items-center justify-center"
                        aria-label="Report Hazard"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#991B1B]" />
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                        <span className="relative z-10 py-1 px-2.5 text-[10px] font-bold leading-none text-white whitespace-nowrap bg-slate-900 rounded-md shadow-lg border border-slate-700">
                          Report Hazard
                        </span>
                        <div className="w-1.5 h-1.5 -mt-0.5 rotate-45 bg-slate-900 border-r border-b border-slate-700" />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleRoleCycle}
                    title="Switch Demo Role"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-rose-200">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span>{isOnline ? 'Live LDRRMC Feed' : 'Offline Buffer'}</span>
                </div>
                {pendingOutboxCount > 0 && (
                  <span className="bg-[#00BCD4] text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full">
                    {pendingOutboxCount} queued
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Report & Sign Out */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  className="py-2 px-2.5 rounded-xl bg-white text-[#991B1B] hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#991B1B]" />
                  <span>+ Hazard</span>
                </button>
              )}

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </>
        ) : (
          /* Resident sidebar bottom: Connection status only */
          <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-2.5 border border-white/10 text-xs">
            <div className="flex items-center justify-between text-[10px] text-rose-200">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                <span>{isOnline ? 'Live LDRRMC Feed' : 'Offline Buffer'}</span>
              </div>
              {pendingOutboxCount > 0 && (
                <span className="bg-[#00BCD4] text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full">
                  {pendingOutboxCount} queued
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Decorative Motif: Elegant botanical foliage / curling vine watermark */}
      <div
        className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none z-0 opacity-25 select-none"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full text-rose-100" fill="currentColor">
          <path d="M42.7,133.5 C36.2,112.8 45.1,91.4 62.8,79.5 C80.5,67.6 104.9,66.8 123.6,77.7 C138.5,86.4 148.2,102.1 149.7,119.2 C150.8,131.7 146.4,144.3 137.9,153.5 C129.4,162.7 117.4,167.8 105.0,167.5 C87.3,167.1 71.4,155.8 65.5,139.1 C61.6,128.0 63.8,115.6 71.1,106.4 C78.4,97.2 89.9,92.5 101.4,94.2 C110.8,95.6 118.8,102.1 121.7,111.1 C124.6,120.1 121.9,130.0 114.9,136.5 C107.9,143.0 97.6,145.1 88.7,141.9 C79.8,138.7 73.6,130.7 72.8,121.3 C72.0,111.9 76.8,102.8 85.0,98.1 C93.2,93.4 103.5,93.8 111.3,99.2 C119.1,104.6 123.2,114.2 121.7,123.5 C120.2,132.8 113.3,140.4 104.2,142.7 C95.1,145.0 85.2,141.7 80.0,134.0 C74.8,126.3 75.1,115.6 80.8,108.3 C86.5,101.0 96.7,98.2 105.4,101.5 C114.1,104.8 119.8,113.7 119.3,123.0 C118.8,132.3 112.2,140.3 103.2,142.2 C94.2,144.1 84.4,139.6 79.9,131.5 C75.4,123.4 76.9,112.9 83.5,106.3 C90.1,99.7 100.8,98.0 109.3,102.2 C117.8,106.4 122.7,115.8 121.2,125.1 C119.7,134.4 112.0,142.1 102.7,143.6 C93.4,145.1 83.9,140.1 80.0,131.6" />
          <path d="M12,188 C40,165 72,160 105,172 C138,184 170,170 190,140" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M85,165 C68,145 60,115 75,95 C90,75 125,75 145,95" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="150" cy="90" r="7" />
          <circle cx="170" cy="115" r="5" />
          <circle cx="65" cy="85" r="6" />
          <circle cx="110" cy="65" r="8" />
        </svg>
      </div>
    </aside>
  );
};
