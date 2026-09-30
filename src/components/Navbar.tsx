import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  UserCheck,
  RotateCcw,
  Volume2,
  VolumeX,
  Database,
  Menu,
  X,
  LogOut,
  Radio,
  FileText,
  Building2,
  PhoneCall,
  Shield,
  BarChart2,
  ChevronRight,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsLeft,
  ChevronsRight,
  Home,
  Layers,
  Users,
  Download,
  RefreshCw,
  Bell
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';
import { UniGuardLogo } from './UniGuardLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  onOpenReportModal: () => void;
  onOpenSupabaseModal: () => void;
  isAudioAlertEnabled: boolean;
  setIsAudioAlertEnabled: (enabled: boolean) => void;
  pendingOutboxCount: number;
  onSignOut?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapsed?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  isOnline,
  setIsOnline,
  onOpenReportModal,
  onOpenSupabaseModal,
  isAudioAlertEnabled,
  setIsAudioAlertEnabled,
  pendingOutboxCount,
  onSignOut,
  isSidebarCollapsed = false,
  onToggleSidebarCollapsed,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const users = storage.getUsers();

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = users.find((u) => u.id === e.target.value);
    if (selected) {
      storage.setActiveUserId(selected.id);
      onUserChange(selected);
    }
  };

  const handleCycleRole = () => {
    const currentIndex = users.findIndex((u) => u.id === currentUser.id);
    const nextIndex = (currentIndex + 1) % users.length;
    const nextUser = users[nextIndex];
    if (nextUser) {
      storage.setActiveUserId(nextUser.id);
      onUserChange(nextUser);
    }
  };

  // Dynamic counts for badge indicators
  const reports = storage.getReports();
  const unverifiedCount = reports.filter((r) => r.status === 'unverified').length || 2;
  const advisoriesCount = storage.getAdvisories().length || 3;
  const activeSheltersCount = storage.getEvacuationCenters().filter((c) => c.status === 'open').length || 1;

  // LGU / LDRRMC Navigation Items (matching initial design screenshot exactly)
  const isLgu = currentUser.role === 'lgu_admin';
  const isBarangay = currentUser.role === 'barangay';
  const isCitizen = currentUser.role === 'citizen';

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const advisoriesList = storage.getAdvisories();
  const unreadNotificationsCount = Math.max(
    0,
    advisoriesList.filter((a) => !readNotificationIds.includes(a.id)).length
  );

  interface NavItem {
    id: string;
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navLinks: NavItem[] = isLgu
    ? [
        {
          id: 'home',
          label: 'Home',
          subtitle: 'Command Console',
          icon: Home,
        },
        {
          id: 'incidents',
          label: 'Incidents',
          subtitle: 'Hazard Verification',
          icon: AlertTriangle,
          badge: String(unverifiedCount),
        },
        {
          id: 'advisories',
          label: 'Advisories',
          subtitle: 'Bulletins & Alerts',
          icon: Volume2,
          badge: String(advisoriesCount),
        },
        {
          id: 'shelters',
          label: 'Shelters',
          subtitle: 'Safe Evacuation',
          icon: Building2,
          badge: String(activeSheltersCount),
        },
        {
          id: 'hotlines',
          label: 'Hotlines',
          subtitle: 'Emergency Dispatch',
          icon: PhoneCall,
        },
        {
          id: 'analytics',
          label: 'Analytics',
          subtitle: 'Trends & Stats',
          icon: Layers,
        },
        {
          id: 'users',
          label: 'Users',
          subtitle: 'Personnel Directory',
          icon: Users,
        },
        {
          id: 'audit_log',
          label: 'Audit Log',
          subtitle: 'System Trail',
          icon: FileText,
        },
      ]
    : isCitizen
    ? [
        {
          id: 'home',
          label: 'Home',
          subtitle: 'Safety Overview',
          icon: Home,
        },
        {
          id: 'report_hazard',
          label: 'Report a Hazard',
          subtitle: 'Multi-Hazard Report',
          icon: AlertTriangle,
        },
        {
          id: 'shelters',
          label: 'Shelters',
          subtitle: 'Safe Evacuation',
          icon: Building2,
          badge: '1',
        },
        {
          id: 'hotlines',
          label: 'Hotlines',
          subtitle: 'Emergency Dispatch',
          icon: PhoneCall,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          subtitle: 'Push Alerts',
          icon: Bell,
          badge: '2',
        },
      ]
    : [
        // Barangay portal
        {
          id: 'home',
          label: 'Home',
          subtitle: 'Operations Overview',
          icon: Home,
        },
        {
          id: 'incidents',
          label: 'Incidents',
          subtitle: 'Live Hazards & Triage',
          icon: AlertTriangle,
          badge: String(unverifiedCount),
        },
        {
          id: 'advisories',
          label: 'Advisories',
          subtitle: 'Official Bulletins',
          icon: Volume2,
          badge: String(advisoriesCount),
        },
        {
          id: 'shelters',
          label: 'Shelters',
          subtitle: 'Safe Shelters',
          icon: Building2,
          badge: String(activeSheltersCount),
        },
        {
          id: 'hotlines',
          label: 'Hotlines',
          subtitle: 'Emergency Dispatch',
          icon: PhoneCall,
        },
        {
          id: 'audit_log',
          label: 'Audit Log',
          subtitle: 'Verification Trail',
          icon: FileText,
        },
      ];

  const currentTabItem =
    navLinks.find((item) => item.id === activeTab) ||
    // Fallback aliases for backward compatibility
    (activeTab === 'feed' ? navLinks.find((item) => item.id === 'incidents') : null) ||
    (activeTab === 'evacuation' ? navLinks.find((item) => item.id === 'shelters') : null) ||
    navLinks[0];

  // Botanical / Laurel Decorative Watermark SVG (inspired by the reference vine illustration)
  const BotanicalWatermark = () => (
    <div className="absolute -bottom-2 -left-4 -right-4 pointer-events-none overflow-hidden h-44 opacity-15 text-white select-none z-0">
      <svg
        viewBox="0 0 240 280"
        fill="none"
        className="w-full h-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d="M 35 280 C 45 220 70 185 105 160 C 145 130 155 90 135 30"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 65 280 C 85 230 120 205 165 180 C 195 160 215 130 205 85"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 25 240 C 40 190 35 150 55 110 C 70 80 85 60 80 40"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 105 160 C 95 140 115 125 130 140 C 125 158 112 165 105 160 Z"
          fill="currentColor"
        />
        <path
          d="M 140 120 C 158 100 178 115 165 132 C 148 135 138 125 140 120 Z"
          fill="currentColor"
        />
        <path
          d="M 75 150 C 55 135 68 118 85 125 C 88 142 80 152 75 150 Z"
          fill="currentColor"
        />
        <circle cx="115" cy="180" r="4.5" fill="currentColor" />
        <circle cx="125" cy="176" r="4" fill="currentColor" />
        <circle cx="120" cy="188" r="4" fill="currentColor" />
      </svg>
    </div>
  );

  // Inverted fillet corner above active tab (seamless C1 curvature into U-shaped cutout)
  const CutoutCornerTop = () => (
    <svg
      className="absolute right-0 -top-5 w-5 h-5 pointer-events-none z-20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 0 20 A 20 20 0 0 1 20 0 L 20 20 Z" fill="#f4f6fa" />
    </svg>
  );

  // Inverted fillet corner below active tab (seamless C1 curvature into U-shaped cutout)
  const CutoutCornerBottom = () => (
    <svg
      className="absolute right-0 -bottom-5 w-5 h-5 pointer-events-none z-20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 20 20 A 20 20 0 0 1 0 0 L 20 0 Z" fill="#f4f6fa" />
    </svg>
  );

  // Render Sidebar Content (Maintains exact visual design & matches initial design navigation)
  const renderSidebarContent = (isMobile: boolean = false, collapsed: boolean = false) => {
    if (collapsed && !isMobile) {
      // ==============================================================
      // MINIMIZED MODE: Capsule Icon Dock with Cutout Effect
      // ==============================================================
      return (
        <div className="relative flex flex-col h-full justify-between items-center select-none py-3 z-10">
          {/* Top Logo & Expand Button */}
          <div className="flex flex-col items-center space-y-3 w-full">
            {/* White Circular Floating Badge */}
            <div className="relative group">
              <button
                onClick={() => setActiveTab('home')}
                className="w-12 h-12 rounded-full bg-white shadow-xl shadow-black/25 flex items-center justify-center p-1.5 border-2 border-white/50 ring-4 ring-white/20 hover:scale-105 transition-transform cursor-pointer"
                title="UniGuard DRRM"
              >
                <UniGuardLogo size="xs" />
              </button>
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                UniGuard Command Console
              </div>
            </div>

            {/* Sidebar Expand Action */}
            {onToggleSidebarCollapsed && (
              <button
                onClick={onToggleSidebarCollapsed}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/25 text-rose-100 hover:text-white flex items-center justify-center transition cursor-pointer group relative"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronsRight className="w-4 h-4" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  Expand Sidebar
                </div>
              </button>
            )}

            {/* Navigation Icons with Inverted Cutout Curve */}
            <div className="w-full space-y-1.5 pt-1">
              {navLinks.map((item) => {
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'incidents' && activeTab === 'feed') ||
                  (item.id === 'shelters' && activeTab === 'evacuation');
                const Icon = item.icon;

                return (
                  <div key={item.id} className="relative group w-full">
                    {/* Active Inverted Curves & Seamless Bridge */}
                    {isActive && (
                      <>
                        <CutoutCornerTop />
                        <CutoutCornerBottom />
                        <div className="absolute -right-4 -top-5 -bottom-5 w-5 bg-[#f4f6fa] z-10 pointer-events-none" />
                      </>
                    )}

                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`relative z-20 w-full pl-3 pr-2 py-2.5 rounded-l-2xl transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-[#f4f6fa] text-[#881337] font-black shadow-none mr-0'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                      title={item.label}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative">
                        <Icon className="w-4 h-4" />
                        {item.badge && !isActive && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-[#881337] text-[9px] font-black flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-[#881337] ring-4 ring-[#881337]/20 shrink-0 mr-1" />
                      )}
                    </button>

                    {/* Popover Hover Tooltip */}
                    <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-slate-700/50 flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white leading-tight">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-rose-300 font-medium">{item.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botanical Artwork at the bottom */}
          <BotanicalWatermark />

          {/* Bottom Controls in Minimized Mode */}
          <div className="relative z-10 w-full flex flex-col items-center space-y-2.5 pt-2 border-t border-white/20">
            {/* Offline sync */}
            <button
              onClick={() => {
                setActiveTab('offline_sync');
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer group relative ${
                activeTab === 'offline_sync'
                  ? 'bg-white/30 text-white shadow-xs'
                  : 'bg-black/25 hover:bg-black/40 text-rose-200 hover:text-white'
              }`}
              title="Offline sync"
            >
              <Download className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                Offline sync
              </div>
            </button>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg bg-slate-900/60 border border-cyan-400/40 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0 group relative cursor-pointer"
              title={`${isLgu ? 'Lebron Dwayne Cervantes' : currentUser.full_name}`}
            >
              {isLgu ? 'LD' : currentUser.full_name?.charAt(0) || 'U'}
              <div className="absolute left-full ml-3 px-3 py-1 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="font-bold">{isLgu ? 'Lebron Dwayne Cervantes' : currentUser.full_name}</div>
                <div className="text-[10px] text-cyan-300">{isLgu ? 'LGU / LDRRMC' : currentUser.role}</div>
              </div>
            </div>

            {/* Sign Out */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign out"
                className="w-8 h-8 rounded-lg text-rose-200 hover:text-white hover:bg-white/15 flex items-center justify-center transition cursor-pointer group relative"
              >
                <LogOut className="w-4 h-4" />
                <div className="absolute left-full ml-3 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  Sign out
                </div>
              </button>
            )}

            {/* Force Refresh */}
            <button
              onClick={() => window.location.reload()}
              title="Force Refresh"
              className="w-8 h-8 rounded-lg text-rose-200 hover:text-white hover:bg-white/15 flex items-center justify-center transition cursor-pointer group relative"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <div className="absolute left-full ml-3 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                Force Refresh
              </div>
            </button>
          </div>
        </div>
      );
    }

    // ==============================================================
    // EXPANDED MODE: Exact Design Match to Reference Screenshot
    // ==============================================================
    return (
      <div className="relative flex flex-col h-full justify-between select-none z-10">
        {/* Top Header & Navigation */}
        <div className="space-y-3">
          {/* Top Floating Circular Emblem & Minimize Toggle */}
          <div className="relative pt-2 px-3">
            <div className="flex items-start justify-between">
              <div className="w-8" /> {/* Left Spacer */}

              {/* White Floating Circular Badge */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                  className="w-14 h-14 rounded-full bg-white shadow-2xl shadow-black/35 flex items-center justify-center p-2 border-2 border-white/60 ring-4 ring-white/20 hover:scale-105 transition-transform cursor-pointer group"
                >
                  <UniGuardLogo size="xs" />
                </button>

                <div className="mt-2 text-center">
                  <div className="text-sm font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                    <span>UniGuard</span>
                  </div>
                  <p className="text-[10px] text-cyan-200/90 font-mono tracking-wider uppercase font-semibold">
                    COMMAND CONSOLE
                  </p>
                </div>
              </div>

              {/* Minimize / Close Button */}
              <div className="w-8 flex justify-end">
                {!isMobile && onToggleSidebarCollapsed && (
                  <button
                    onClick={onToggleSidebarCollapsed}
                    className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Minimize sidebar"
                    aria-label="Minimize sidebar"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>
                )}

                {isMobile && (
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-white hover:bg-white/10 cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Hazard Report Action Pill */}
          <div className="px-4 pt-0.5">
            <button
              onClick={() => {
                onOpenReportModal();
                if (isMobile) setMobileMenuOpen(false);
              }}
              className="w-full bg-white/95 hover:bg-white text-[#881337] font-black py-2 px-3 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/50 hover:scale-[1.02] active:scale-[0.98] text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-ping" />
              <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />
              <span>Report Hazard Now</span>
            </button>
          </div>

          {/* Navigation Links with the Iconic Cutout Notch */}
          <div className="pt-1">
            <div className="space-y-0.5">
              {navLinks.map((item) => {
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'incidents' && activeTab === 'feed') ||
                  (item.id === 'shelters' && activeTab === 'evacuation');
                const Icon = item.icon;

                return (
                  <div key={item.id} className="relative group">
                    {/* SVG Cutout Fillet Corners & Seamless Right Bridge */}
                    {isActive && (
                      <>
                        <CutoutCornerTop />
                        <CutoutCornerBottom />
                        <div className="absolute -right-4 -top-5 -bottom-5 w-5 bg-[#f4f6fa] z-10 pointer-events-none" />
                      </>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        if (isMobile) setMobileMenuOpen(false);
                      }}
                      className={`relative z-20 w-full text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-[#f4f6fa] text-[#881337] font-black pl-5 pr-4 py-2.5 rounded-l-full shadow-none'
                          : 'text-white/85 hover:text-white hover:bg-white/10 px-5 py-2 rounded-2xl mx-1 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            isActive ? 'text-[#881337]' : 'text-rose-100 group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <span
                            className={`text-xs sm:text-sm tracking-tight truncate block ${
                              isActive ? 'text-[#881337] font-black' : 'text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Right Edge: Badge count & Active indicator dot */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-xs px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'text-[#881337] font-black bg-[#881337]/10'
                                : 'text-rose-200/90 font-medium'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {isActive ? (
                          <div className="w-2 h-2 rounded-full bg-[#881337] ring-4 ring-[#881337]/20 shadow-xs" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-75 transition-opacity text-rose-200" />
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botanical Watermark at the bottom of the capsule */}
        <BotanicalWatermark />

        {/* Bottom Section Matching Initial Design Screenshot */}
        <div className="relative z-10 px-4 pb-3 pt-2 space-y-1.5 border-t border-white/20">
          {/* Offline Sync Action */}
          <button
            onClick={() => {
              setActiveTab('offline_sync');
            }}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl transition cursor-pointer text-xs font-semibold group ${
              activeTab === 'offline_sync'
                ? 'bg-white/20 text-white font-bold'
                : 'text-rose-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <Download className="w-4 h-4 text-rose-200 group-hover:text-white shrink-0" />
            <span className="truncate">Offline sync</span>
            {pendingOutboxCount > 0 && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white text-[#881337]">
                {pendingOutboxCount}
              </span>
            )}
          </button>

          <div className="border-t border-white/15 my-1" />

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-slate-900/60 border border-cyan-400/40 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
              {isLgu ? 'LD' : currentUser.full_name?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {isLgu ? 'Lebron Dwayne Cervantes' : currentUser.full_name}
              </div>
              <div className="text-[10px] text-cyan-200/80 font-mono tracking-wide truncate">
                {isLgu ? 'LGU / LDRRMC' : currentUser.role === 'barangay' ? 'BDRRMC Official' : 'Citizen Watcher'}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-rose-100 hover:text-white hover:bg-white/10 transition cursor-pointer text-xs font-semibold group"
            >
              <LogOut className="w-4 h-4 text-rose-200 group-hover:text-white shrink-0" />
              <span>Sign out</span>
            </button>
          )}

          {/* Force Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-rose-100 hover:text-white hover:bg-white/10 transition cursor-pointer text-xs font-semibold group"
          >
            <RefreshCw className="w-4 h-4 text-rose-200 group-hover:text-white shrink-0" />
            <span>Force Refresh</span>
          </button>

          {/* Build Version Tag */}
          <div className="px-3 pt-0.5">
            <p className="text-[10px] text-white/50 font-mono">build 2026-09-19.4</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR: Floating Red-to-Burgundy Capsule Container     */}
      {/* Featuring White Circle Emblem, Cutout Tab & Botanical Watermark */}
      {/* ============================================================== */}
      <aside
        className={`hidden md:flex fixed left-3 top-3 bottom-3 ${
          isSidebarCollapsed ? 'w-24' : 'w-64 lg:w-72'
        } bg-gradient-to-b from-[#dc2626] via-[#881337] to-[#450a0a] text-white z-50 flex-col transition-all duration-300 ease-in-out shadow-2xl shadow-rose-950/30 overflow-y-auto overflow-x-visible border-l-4 border-t-4 border-b-4 border-white/90 rounded-l-[36px] rounded-r-[24px]`}
      >
        {renderSidebarContent(false, isSidebarCollapsed)}
      </aside>

      {/* ============================================================== */}
      {/* MOBILE SLIDE-OVER DRAWER (Matches the Red-Burgundy Capsule)     */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] my-2 ml-2 h-[calc(100vh-1rem)] bg-gradient-to-b from-[#dc2626] via-[#881337] to-[#450a0a] text-white rounded-[32px] border-4 border-white/90 flex flex-col justify-between overflow-hidden z-10 shadow-2xl">
            {renderSidebarContent(true, false)}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TOP HEADER BAR (Clean, modern companion header for content area)*/}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/90 shadow-2xs">
        {/* Top Emergency Status Micro-Bar */}
        <div className="bg-slate-900 text-slate-100 px-4 sm:px-6 lg:px-8 py-1 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#b91c1c] text-white tracking-wider animate-pulse">
              LDRRMC LINGAYEN
            </span>
            <span className="text-slate-300 text-[11px] truncate">
              Disaster Risk Reduction & Management Operations Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('offline_sync')}
              className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:opacity-85 transition-opacity"
              title="Open Offline Sync Center"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
              <span className="text-slate-300 hidden sm:inline">
                {isOnline ? 'Network Synced' : 'Offline Cached'}
              </span>
              {pendingOutboxCount > 0 && (
                <span className="bg-[#b91c1c] text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {pendingOutboxCount} outbox
                </span>
              )}
            </div>

            <span className="text-slate-600 hidden sm:inline">|</span>

            <span className="text-[11px] text-slate-300 font-semibold hidden md:inline">
              Lingayen, Pangasinan
            </span>
          </div>
        </div>

        {/* Main Action Bar */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">
            {/* Left: Mobile hamburger, Desktop sidebar toggle & Active section title */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden cursor-pointer"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Minimize/Expand Toggle in Top Bar */}
              {onToggleSidebarCollapsed && (
                <button
                  onClick={onToggleSidebarCollapsed}
                  className="hidden md:inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-[#881337] hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-all cursor-pointer shadow-2xs group"
                  title={isSidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
                  aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4 text-[#881337]" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4 text-slate-600 group-hover:text-[#881337]" />
                  )}
                  <span className="text-[11px] font-bold ml-1.5 text-slate-700 group-hover:text-[#881337] hidden xl:inline">
                    {isSidebarCollapsed ? 'Expand' : 'Minimize'}
                  </span>
                </button>
              )}

              <div className="flex flex-col min-w-0">
                <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2 truncate">
                  <span className="text-[#881337]">{currentTabItem.label}</span>
                  <span className="hidden sm:inline text-slate-400 font-normal text-xs">/</span>
                  <span className="hidden sm:inline text-slate-500 font-medium text-xs truncate">
                    {currentTabItem.subtitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions & Persona Switcher */}
            <div className="flex items-center gap-2.5 relative">
              {/* Quick Persona Switcher in header */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 rounded-xl py-1 px-2.5 border border-slate-200 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#881337]" />
                <select
                  value={currentUser.id}
                  onChange={handleRoleSelect}
                  className="bg-transparent font-bold text-slate-900 border-none focus:outline-hidden cursor-pointer text-xs"
                >
                  <option value="usr_lgu_admin">LGU / LDRRMC: Lebron Dwayne Cervantes</option>
                  <option value="usr_barangay_libsong">Barangay Libsong: Kag. Elena Reyes</option>
                  <option value="usr_barangay_poblacion">Barangay Poblacion: Capt. Fernandez</option>
                  <option value="usr_citizen_1">Resident: Juan Dela Cruz</option>
                  <option value="usr_citizen_2">Resident: Maria Santos</option>
                </select>
              </div>

              {/* Barangay Portal Top Right: ONLY Notifications */}
              {isBarangay ? (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen((prev) => !prev)}
                    className="relative flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-[#b91c1c] hover:bg-[#991b1b] shadow-xs hover:shadow-md transition-all cursor-pointer ring-2 ring-red-400/20"
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="bg-white text-[#b91c1c] text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown for Barangay Portal */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-red-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3.5 bg-red-50/80 border-b border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#b91c1c] text-white flex items-center justify-center shadow-2xs">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 leading-tight">
                              Emergency Notifications
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium">
                              Municipality of Lingayen LDRRMC
                            </p>
                          </div>
                        </div>

                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={() => {
                              setReadNotificationIds(advisoriesList.map((a) => a.id));
                            }}
                            className="text-[10px] font-bold text-[#b91c1c] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-red-50">
                        {advisoriesList.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications right now.
                          </div>
                        ) : (
                          advisoriesList.map((adv) => {
                            const isRead = readNotificationIds.includes(adv.id);
                            return (
                              <div
                                key={adv.id}
                                onClick={() => {
                                  if (!isRead) {
                                    setReadNotificationIds((prev) => [...prev, adv.id]);
                                  }
                                  setActiveTab('advisories');
                                  setNotificationsOpen(false);
                                }}
                                className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-red-50/60 ${
                                  !isRead ? 'bg-red-50/25' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                                    {adv.severity}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {new Date(adv.created_at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                  {adv.title}
                                </h5>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                                  {adv.content}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                        <button
                          onClick={() => {
                            setActiveTab('advisories');
                            setNotificationsOpen(false);
                          }}
                          className="text-xs font-bold text-[#b91c1c] hover:underline cursor-pointer"
                        >
                          Open Advisories Center →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Non-barangay (LGU / Resident) Report Hazard Button */
                <button
                  onClick={onOpenReportModal}
                  className="bg-[#b91c1c] hover:bg-[#991b1b] text-white px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black shadow-xs hover:shadow-md transition flex items-center gap-1.5 cursor-pointer ring-2 ring-red-400/20"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span className="whitespace-nowrap">Report Hazard</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
