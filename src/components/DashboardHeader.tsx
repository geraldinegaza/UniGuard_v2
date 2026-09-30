import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  ChevronDown,
  Download,
  Filter,
  AlertTriangle,
  Menu,
  X,
  Radio,
  Check,
  Search,
  Sparkles,
  LayoutGrid,
  Bell,
  User as UserIcon,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { Barangay, User } from '../types';
import { storage } from '../services/storage';

export interface DashboardHeaderProps {
  topView: 'Overview' | 'Trends' | 'Analytics';
  setTopView: (view: 'Overview' | 'Trends' | 'Analytics') => void;
  selectedBarangay: string;
  setSelectedBarangay: (b: string) => void;
  barangays: Barangay[];
  onOpenExportModal: () => void;
  onOpenReportModal: () => void;
  onToggleMobileSidebar?: () => void;
  isOnline: boolean;
  totalActiveHazards: number;
  currentUser?: User;
  onSignOut?: () => void;
  onUserChange?: (user: User) => void;
  setActiveTab?: (tab: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  topView,
  setTopView,
  selectedBarangay,
  setSelectedBarangay,
  barangays,
  onOpenExportModal,
  onOpenReportModal,
  onToggleMobileSidebar,
  isOnline,
  totalActiveHazards,
  currentUser,
  onSignOut,
  onUserChange,
  setActiveTab,
}) => {
  const isResident = currentUser?.role === 'citizen';
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [hasMarkedRead, setHasMarkedRead] = useState(false);

  const deliveredAlerts = [
    {
      id: 'notif-1',
      title: 'Signal No. 2 Tropical Storm Warning',
      agency: 'Lingayen MDRRMO',
      time: '08:30 AM',
      description: 'Gale warning active for coastal waters. Fisherfolk advised against sailing.',
    },
    {
      id: 'notif-2',
      title: 'Evacuation Center Readiness Notice',
      agency: 'LDRRMC Lingayen',
      time: '09:15 AM',
      description: 'Libsong Elementary and Civic Center shelters are open and staffed with relief supplies.',
    },
    {
      id: 'notif-3',
      title: 'Coastal High Tide Warning',
      agency: 'Coast Guard Sub-Station',
      time: '10:45 AM',
      description: 'High tide peak at 1.4m. Low-lying streets in Brgy. Pangapisan may experience ankle-deep inundation.',
    },
    {
      id: 'notif-4',
      title: 'Municipal Relief Goods Distribution',
      agency: "Mayor's Office",
      time: '01:20 PM',
      description: 'Food packs and potable water dispatched to designated barangay staging areas.',
    },
    {
      id: 'notif-5',
      title: 'Heavy Rainfall Thunderstorm Advisory',
      agency: 'PAGASA / MDRRMO',
      time: '03:00 PM',
      description: 'Moderate to heavy rain with lightning expected over the next 2-3 hours.',
    },
  ];

  const handleMarkAllRead = () => {
    setUnreadNotifications(0);
    setHasMarkedRead(true);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBarangayObj = barangays.find((b) => b.id === selectedBarangay);
  const filterLabel =
    selectedBarangay === 'all'
      ? 'All Barangays Selected'
      : `${selectedBarangayObj?.name || selectedBarangay} Selected`;

  return (
    <header className="px-4 sm:px-6 lg:px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/95 backdrop-blur-xs sticky top-0 z-15">
      {/* Brand Lockup */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle Button */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Styled Brand Mark / Icon Badge in Deep Red */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#991B1B] to-[#7f1d1d] shadow-md shadow-red-950/20 flex items-center justify-center text-white shrink-0 ring-4 ring-rose-50">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                UniGuard <span className="text-[#991B1B]">LDRRMC</span>
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-[#991B1B] text-[10px] font-extrabold border border-rose-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse" />
                <span>Lingayen Live Ops</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              Disaster Risk Reduction & Operations Hub • Lingayen
            </p>
          </div>
        </div>

        {/* Quick Report on Mobile */}
        <button
          onClick={onOpenReportModal}
          className="md:hidden p-2 rounded-xl bg-[#991B1B] text-white hover:bg-[#881313] transition-colors cursor-pointer shadow-sm"
          title="Submit Hazard Report"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* 3-Segment Pill Navigation Bar (Hidden for Residents) */}
        {!isResident && (
          <div className="bg-[#991B1B] rounded-full p-1 text-white text-xs font-semibold flex items-center gap-0.5 shadow-md shadow-red-950/15">
            {(['Overview', 'Trends', 'Analytics'] as const).map((view) => {
              const isActive = topView === view;
              return (
                <button
                  key={view}
                  onClick={() => setTopView(view)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap text-xs font-bold ${
                    isActive
                      ? 'bg-white text-[#991B1B] shadow-sm scale-100'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {view}
                </button>
              );
            })}
          </div>
        )}

        {/* Rounded Pill Filter Selector Button ("All Barangays Selected") */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-all cursor-pointer hover:border-slate-300"
          >
            <Filter className="w-3.5 h-3.5 text-[#991B1B]" />
            <span className="truncate max-w-[130px] sm:max-w-[160px]">{filterLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                isFilterDropdownOpen ? 'rotate-180 text-[#991B1B]' : ''
              }`}
            />
          </button>

          {/* Interactive Dropdown Menu */}
          {isFilterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Filter by Barangay Zone
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                <button
                  onClick={() => {
                    setSelectedBarangay('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedBarangay === 'all'
                      ? 'bg-rose-50 text-[#991B1B] font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>All Barangays (Municipality-Wide)</span>
                  {selectedBarangay === 'all' && (
                    <Check className="w-3.5 h-3.5 text-[#991B1B]" />
                  )}
                </button>

                {barangays.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBarangay(b.id);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      selectedBarangay === b.id
                        ? 'bg-rose-50 text-[#991B1B] font-extrabold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{b.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          b.risk_level === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : b.risk_level === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.risk_level}
                      </span>
                    </div>
                    {selectedBarangay === b.id && (
                      <Check className="w-3.5 h-3.5 text-[#991B1B]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Export Action Button (Hidden for Residents) */}
        {!isResident && (
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Export Situation Report & Metrics"
          >
            <Download className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden sm:inline">Export SITREP</span>
            <span className="sm:hidden">Export</span>
          </button>
        )}

        {/* New Report Hazard Primary CTA (Hidden for Residents, who have it in header actions) */}
        {!isResident && (
          <button
            onClick={onOpenReportModal}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#991B1B] hover:bg-[#881313] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>+ Report Hazard</span>
          </button>
        )}

        {/* Resident Header Actions: Menu, Notifications, Caution Symbol, Profile (Right to Left: Profile, Caution, Notifications, Menu) */}
        {isResident && (
          <div ref={actionsRef} className="flex items-center gap-2">
            {/* 1. Menu (4th from right / leftmost of the 4) */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsMenuOpen((prev) => !prev);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isMenuOpen
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Quick Menu"
                aria-label="Quick Menu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              {/* Menu Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Quick Citizen Navigation
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('overview');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>🗺️ Incident Map Radar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('evacuation');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>🏫 Evacuation Shelters</span>
                  </button>
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('hotlines');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>📞 Emergency Hotlines</span>
                  </button>
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('advisories');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>📢 Public Advisories</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Notifications (3rd from right) */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  setIsMenuOpen(false);
                  setIsProfileOpen(false);
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 relative ${
                  isNotificationsOpen
                    ? 'bg-[#991B1B] text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#b91c1c] ring-2 ring-white animate-pulse" />
              </button>

              {/* Notifications Dropdown (Incorporating Image 1 contents in red/maroon/black theme) */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-[420px] bg-slate-950 text-white rounded-3xl border border-rose-900/40 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* 1. Header Banner */}
                  <div className="p-5 bg-gradient-to-br from-slate-950 via-[#7f1d1d] to-[#991B1B] border-b border-rose-900/40 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-black/40 border border-rose-500/20 flex items-center justify-center text-rose-300 shadow-2xs">
                            <Bell className="w-4 h-4" />
                          </div>
                          <h2 className="text-xl font-black text-white tracking-tight">
                            Notifications
                          </h2>
                        </div>

                        {/* Mark All Read Action (from Image 1) */}
                        <button
                          onClick={handleMarkAllRead}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer active:scale-95 shadow-xs backdrop-blur-xs shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 text-rose-300" />
                          <span>{hasMarkedRead ? 'All Read' : 'Mark All Read'}</span>
                        </button>
                      </div>

                      {/* Subtitle (from Image 1) */}
                      <p className="text-rose-100/90 text-xs font-medium leading-relaxed mt-2.5">
                        Push Notifications delivered to this device, including alerts received while the app was closed.
                      </p>
                    </div>

                    {/* Subtle motif */}
                    <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none">
                      <Bell className="w-28 h-28 text-white" />
                    </div>
                  </div>

                  {/* 2. Main Body */}
                  <div className="p-4 space-y-3.5 max-h-[72vh] overflow-y-auto">
                    {/* Delivery Box (from Image 1) */}
                    <div className="bg-black/60 border border-rose-900/40 rounded-2xl p-4 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span className="text-xs font-black uppercase tracking-wider text-rose-200">
                          Delivery
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/40">
                          Active Channel
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-slate-400 font-medium">Unread</span>
                          <span className="font-mono font-bold text-white px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                            {unreadNotifications}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-slate-400 font-medium">Delivered today</span>
                          <span className="font-mono font-bold text-rose-300 px-2.5 py-0.5 rounded-md bg-rose-950/80 border border-rose-800/40">
                            5
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-slate-400 font-medium">Delivery channel</span>
                          <span className="font-mono text-[11px] font-bold text-rose-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Push + offline inbox
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alerts guarantee notice box (from Image 1) */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#7f1d1d]/30 via-slate-900/80 to-black/80 border border-rose-900/40 flex items-start gap-3 text-xs text-rose-100/90 leading-relaxed shadow-xs">
                      <Radio className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                      <p className="text-[11px] leading-relaxed">
                        Alerts are delivered even when the app is closed, and are queued for the offline inbox when there is no signal.
                      </p>
                    </div>

                    {/* Delivered Today Alerts List */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          Delivered Today (5)
                        </span>
                        <span className="text-[10px] text-rose-300 font-bold">
                          Offline Synced
                        </span>
                      </div>

                      <div className="space-y-2">
                        {deliveredAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="p-3 rounded-xl bg-black/40 hover:bg-black/60 border border-rose-900/30 hover:border-rose-700/50 transition-all text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white text-xs truncate">
                                {alert.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {alert.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-snug">
                              {alert.description}
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                              <span className="text-rose-300 font-bold uppercase tracking-wider text-[9px]">
                                {alert.agency}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <Check className="w-3 h-3" />
                                Delivered to device
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Footer Action */}
                  <div className="p-3 bg-black/80 border-t border-rose-900/40">
                    <button
                      onClick={() => {
                        if (setActiveTab) setActiveTab('advisories');
                        setIsNotificationsOpen(false);
                      }}
                      className="w-full py-2.5 text-center text-xs font-bold text-rose-200 hover:text-white bg-rose-950/60 hover:bg-rose-900/60 rounded-xl transition cursor-pointer border border-rose-800/40 active:scale-98 shadow-xs"
                    >
                      View All Advisories & Announcements
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Caution Symbol - Report Hazard (2nd from right) */}
            <div className="relative group">
              <button
                onClick={onOpenReportModal}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-[#b91c1c] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                title="Report Hazard"
                aria-label="Report Hazard"
              >
                <AlertTriangle className="w-4 h-4 text-[#b91c1c]" />
              </button>

              {/* Tooltip on hover saying "Report Hazard" */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                <div className="w-1.5 h-1.5 -mb-0.5 rotate-45 bg-slate-900 border-t border-l border-slate-700" />
                <span className="relative z-10 py-1 px-2.5 text-[10px] font-bold leading-none text-white whitespace-nowrap bg-slate-900 rounded-md shadow-lg border border-slate-700">
                  Report Hazard
                </span>
              </div>
            </div>

            {/* 4. Profile Avatar with Chevron Down Badge (1st from right / Far Right) */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen((prev) => !prev);
                  setIsMenuOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 relative ${
                  isProfileOpen
                    ? 'ring-2 ring-slate-800'
                    : 'hover:ring-2 hover:ring-slate-300'
                } bg-slate-200 text-slate-700`}
                title="User Profile"
                aria-label="User Profile"
              >
                <UserIcon className="w-5 h-5 text-slate-600" />
                {/* Small circular chevron badge in bottom right corner (matching screenshot) */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-xs ring-1.5 ring-white">
                  <ChevronDown className="w-2.5 h-2.5 text-white" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl py-3 px-3 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                      {currentUser?.full_name ? currentUser.full_name[0] : 'J'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.full_name || 'Juan Dela Cruz'}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        {currentUser?.role?.replace('_', ' ') || 'Citizen'}
                      </p>
                    </div>
                  </div>

                  {onUserChange && (
                    <button
                      onClick={() => {
                        const users = storage.getUsers();
                        const currentIndex = users.findIndex((u) => u.id === currentUser?.id);
                        const nextIndex = (currentIndex + 1) % users.length;
                        onUserChange(users[nextIndex]);
                        setIsProfileOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer mb-1"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Switch Demo Role</span>
                      </span>
                    </button>
                  )}

                  {onSignOut && (
                    <button
                      onClick={() => {
                        onSignOut();
                        setIsProfileOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl hover:bg-rose-50 text-[#b91c1c] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#b91c1c]" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
