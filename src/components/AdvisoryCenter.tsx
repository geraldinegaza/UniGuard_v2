import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Advisory,
  User,
  Barangay,
  AdvisorySeverity,
  AdvisoryType
} from '../types';
import { storage } from '../services/storage';
import {
  Bell,
  Radio,
  Search,
  X,
  Send,
  Megaphone,
  Smartphone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Users,
  Eye,
  Check,
  Info,
  ShieldAlert,
  ChevronRight,
  Flag,
  Waves,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface AdvisoryCenterProps {
  advisories: Advisory[];
  currentUser: User;
  barangays: Barangay[];
  onAdvisoryPublished: (advisory: Advisory) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdvisoryCenter: React.FC<AdvisoryCenterProps> = ({
  advisories,
  currentUser,
  barangays,
  onAdvisoryPublished,
  onNavigateTab,
}) => {
  // Compose Form State (for Admin / LDRRMC)
  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [severity, setSeverity] = useState<'Warning' | 'Emergency' | 'Advisory' | 'Notice'>('Warning');
  const [broadcastType, setBroadcastType] = useState<'Emergency' | 'Preparedness' | 'Weather' | 'Evacuation'>('Emergency');
  const [affectedArea, setAffectedArea] = useState<string>('Municipality-wide (Lingayen)');
  const [message, setMessage] = useState('');
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);
  const [selectedPublishedAdvisory, setSelectedPublishedAdvisory] = useState<Advisory | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [pushNotificationToast, setPushNotificationToast] = useState<{ title: string; body: string } | null>(null);

  // Resident Filter State: 'All' | 'Emergency' | 'Warning' | 'Advisory' | 'Preparedness'
  const [residentFilter, setResidentFilter] = useState<'All' | 'Emergency' | 'Warning' | 'Advisory' | 'Preparedness'>('All');
  
  // For Admins: Toggle between Broadcast Console and Resident Feed Preview
  const isAdmin = currentUser.role === 'lgu_admin' || currentUser.role === 'citizen';
  const isBarangay = currentUser.role === 'barangay';
  const [adminViewMode, setAdminViewMode] = useState<'broadcast' | 'resident'>('broadcast');

  // Selected advisory for full modal reading
  const [activeModalAdvisory, setActiveModalAdvisory] = useState<Advisory | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut ⌘K / Ctrl+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Request browser push notification permission if push is enabled
  const handleTogglePush = () => {
    if (!isPushEnabled) {
      setIsPushEnabled(true);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    } else {
      setIsPushEnabled(false);
    }
  };

  const handleClear = () => {
    setAdvisoryTitle('');
    setMessage('');
    setSeverity('Warning');
    setBroadcastType('Emergency');
    setAffectedArea('Municipality-wide (Lingayen)');
  };

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryTitle.trim() || !message.trim()) return;

    let mappedSeverity: AdvisorySeverity = 'high';
    if (severity === 'Emergency') mappedSeverity = 'critical';
    else if (severity === 'Warning') mappedSeverity = 'high';
    else if (severity === 'Advisory') mappedSeverity = 'medium';
    else mappedSeverity = 'low';

    const mappedType: AdvisoryType =
      broadcastType === 'Preparedness' ? 'preparedness' : 'emergency_alert';

    const targetBarangay =
      affectedArea === 'Municipality-wide (Lingayen)' ||
      affectedArea === 'Citywide' ||
      affectedArea === 'Coastal barangays'
        ? null
        : barangays.find((b) => b.name === affectedArea)?.id || null;

    const newAdv = storage.publishAdvisory({
      title: advisoryTitle.trim(),
      content: message.trim(),
      type: mappedType,
      severity: mappedSeverity,
      target_barangay_id: targetBarangay,
      author: currentUser,
    });

    onAdvisoryPublished(newAdv);

    if (isPushEnabled) {
      triggerPushToast(newAdv.title, newAdv.content);
    }

    setActionSuccessNotice(`Broadcast successfully published to residents of ${affectedArea}!`);
    setTimeout(() => setActionSuccessNotice(null), 4000);

    handleClear();
  };

  const triggerPushToast = (titleText: string, bodyText: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`🚨 UniGuard Alert: ${titleText}`, {
            body: bodyText,
            icon: '/shield-alert.svg',
          });
        } catch {
          // Ignore notification constructor errors
        }
      }
    }

    setPushNotificationToast({ title: titleText, body: bodyText });
    setTimeout(() => setPushNotificationToast(null), 6000);
  };

  // Helper to format date cleanly as 9/19/2026
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch {
      return '9/19/2026';
    }
  };

  // Format advisory location text
  const getAdvisoryLocationDisplay = (adv: Advisory) => {
    if (adv.id === 'adv_bonuan_overflow') return 'Bonuan Gueset, Bonuan Boquig';
    if (adv.id === 'adv_coastal_surge') return 'Coastal barangays';
    if (!adv.target_barangay_id) return 'Municipality-wide (Lingayen)';
    const b = barangays.find((brgy) => brgy.id === adv.target_barangay_id);
    return b ? `Brgy. ${b.name}` : 'Municipality-wide (Lingayen)';
  };

  // Format category badge: "Emergency" or "Preparedness"
  const getAdvisoryCategory = (adv: Advisory) => {
    if (adv.type === 'preparedness') return 'Preparedness';
    return 'Emergency';
  };

  // Map advisory to specific visual tag for filter pills
  const getAdvisoryDisplayTag = (adv: Advisory): 'Emergency' | 'Warning' | 'Advisory' | 'Preparedness' => {
    if (adv.type === 'preparedness') return 'Preparedness';
    if (adv.id === 'adv_bonuan_overflow' || adv.severity === 'critical') return 'Emergency';
    if (adv.id === 'adv_class_suspension' || adv.title.toLowerCase().includes('suspension')) return 'Warning';
    if (adv.id === 'adv_coastal_surge' || adv.title.toLowerCase().includes('advisory')) return 'Advisory';
    if (adv.severity === 'high') return 'Warning';
    return 'Advisory';
  };

  // Compute filter pill counts
  const filterCounts = useMemo(() => {
    let all = 0;
    let emergency = 0;
    let warning = 0;
    let advisory = 0;
    let preparedness = 0;

    advisories.forEach((a) => {
      all++;
      const tag = getAdvisoryDisplayTag(a);
      if (tag === 'Emergency') emergency++;
      else if (tag === 'Warning') warning++;
      else if (tag === 'Advisory') advisory++;
      else if (tag === 'Preparedness') preparedness++;
    });

    return { all, emergency, warning, advisory, preparedness };
  }, [advisories]);

  // Status dot color for published item in admin list
  const getStatusDotColor = (adv: Advisory) => {
    if (adv.severity === 'critical') return 'bg-red-600';
    if (adv.severity === 'high') return 'bg-red-500';
    if (adv.type === 'preparedness') return 'bg-red-400';
    return 'bg-red-600';
  };

  // Filter published list by search query & resident pill filter
  const residentFilteredAdvisories = useMemo(() => {
    return advisories.filter((adv) => {
      // 1. Tag Filter
      if (residentFilter !== 'All') {
        const tag = getAdvisoryDisplayTag(adv);
        if (tag !== residentFilter) return false;
      }
      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const loc = getAdvisoryLocationDisplay(adv).toLowerCase();
        const cat = getAdvisoryCategory(adv).toLowerCase();
        const titleMatch = adv.title.toLowerCase().includes(q);
        const contentMatch = adv.content.toLowerCase().includes(q);
        return titleMatch || contentMatch || loc.includes(q) || cat.includes(q);
      }
      return true;
    });
  }, [advisories, residentFilter, searchQuery]);

  // Admin search filtered advisories
  const adminFilteredAdvisories = useMemo(() => {
    if (!searchQuery.trim()) return advisories;
    const q = searchQuery.toLowerCase().trim();
    return advisories.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        getAdvisoryLocationDisplay(a).toLowerCase().includes(q) ||
        getAdvisoryCategory(a).toLowerCase().includes(q)
    );
  }, [advisories, searchQuery]);

  // Determines whether to display the resident card grid
  const showResidentView = isBarangay || (isAdmin && adminViewMode === 'resident');

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Push Notification Toast Notification in Red Civic Theme */}
      {pushNotificationToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white text-slate-900 p-4 rounded-2xl shadow-xl border-2 border-red-500 animate-in slide-in-from-top-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-red-600 text-white shrink-0 mt-0.5 animate-pulse">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-bold uppercase tracking-wider">
                  <span>UNIGUARD BROADCAST</span>
                  <span>•</span>
                  <span>NOW</span>
                </div>
                <h4 className="text-xs font-black text-slate-900 mt-0.5">
                  {pushNotificationToast.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {pushNotificationToast.body}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPushNotificationToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Command Console Top Bar (Search with ⌘K, Live Feed, Notifications) */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                UniGuard Command Console
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                {currentUser.role === 'lgu_admin'
                  ? 'LGU JURISDICTION'
                  : currentUser.role === 'citizen'
                  ? 'CITIZEN DISPATCH'
                  : `BRGY. ${currentUser.barangay_id?.toUpperCase() || 'OFFICIAL'}`}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Municipality of Lingayen, Pangasinan
            </p>
          </div>
        </div>

        {/* Center: Search input + ⌘K */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-red-500 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents, responders, or locations"
              className="w-full pl-10 pr-14 py-2 bg-red-50/30 hover:bg-red-50/50 focus:bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 border border-red-200 focus:border-red-500 rounded-xl transition-all outline-hidden focus:ring-2 focus:ring-red-100"
            />
            <div className="absolute right-3 flex items-center pointer-events-none">
              <kbd className="text-[10px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-12 top-2 text-slate-400 hover:text-red-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Actions: Live Feed Button & Notifications Bell */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={() => setIsLiveFeedActive((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isLiveFeedActive
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveFeedActive ? 'animate-pulse' : ''}`} />
            <span>Live feed</span>
          </button>

          <button
            onClick={handleTogglePush}
            className={`p-2 rounded-xl border transition-colors cursor-pointer relative ${
              isPushEnabled
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-white text-slate-400 border-red-200 hover:bg-red-50/50'
            }`}
            title={isPushEnabled ? 'Push broadcasts active' : 'Push broadcasts disabled'}
          >
            <Bell className="w-4 h-4" />
            {isPushEnabled && (
              <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {/* Action Flash Notice */}
      {actionSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
          <button
            onClick={() => setActionSuccessNotice(null)}
            className="cursor-pointer text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Page Title Header & Admin View Switcher */}
      <div className="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Advisories and Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {showResidentView
              ? 'Official broadcasts from the Municipal Disaster Risk Reduction and Management Office (MDRRMO Lingayen).'
              : 'Publish official broadcasts and preparedness content to residents.'}
          </p>
        </div>

        {/* Admin Toggle between Broadcast Console and Resident Feed */}
        {isAdmin && (
          <div className="flex items-center bg-red-50 p-1 rounded-xl border border-red-200">
            <button
              onClick={() => setAdminViewMode('broadcast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                adminViewMode === 'broadcast'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-700 hover:bg-red-100'
              }`}
            >
              Broadcast Console
            </button>
            <button
              onClick={() => setAdminViewMode('resident')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                adminViewMode === 'resident'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-700 hover:bg-red-100'
              }`}
            >
              Resident Feed
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3A. RESIDENT VIEW: Exact contents and features from Screenshot */}
      {/* ============================================================== */}
      {showResidentView ? (
        <div className="space-y-5 animate-in fade-in">
          {/* Filter Pills with Counts: All 5 | Emergency 1 | Warning 1 | Advisory 1 | Preparedness 2 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* All Pill */}
            <button
              type="button"
              onClick={() => setResidentFilter('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                residentFilter === 'All'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>All</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  residentFilter === 'All' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                }`}
              >
                {filterCounts.all}
              </span>
            </button>

            {/* Emergency Pill */}
            <button
              type="button"
              onClick={() => setResidentFilter('Emergency')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                residentFilter === 'Emergency'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>Emergency</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  residentFilter === 'Emergency' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                }`}
              >
                {filterCounts.emergency}
              </span>
            </button>

            {/* Warning Pill */}
            <button
              type="button"
              onClick={() => setResidentFilter('Warning')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                residentFilter === 'Warning'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>Warning</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  residentFilter === 'Warning' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                }`}
              >
                {filterCounts.warning}
              </span>
            </button>

            {/* Advisory Pill */}
            <button
              type="button"
              onClick={() => setResidentFilter('Advisory')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                residentFilter === 'Advisory'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>Advisory</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  residentFilter === 'Advisory' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                }`}
              >
                {filterCounts.advisory}
              </span>
            </button>

            {/* Preparedness Pill */}
            <button
              type="button"
              onClick={() => setResidentFilter('Preparedness')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                residentFilter === 'Preparedness'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>Preparedness</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  residentFilter === 'Preparedness' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                }`}
              >
                {filterCounts.preparedness}
              </span>
            </button>
          </div>

          {/* Cards Grid in strictly Red Palette */}
          {residentFilteredAdvisories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-12 text-center space-y-2">
              <Megaphone className="w-10 h-10 text-red-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No advisories match this filter</h3>
              <p className="text-xs text-slate-500">Check other categories or reset search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {residentFilteredAdvisories.map((adv) => {
                const tag = getAdvisoryDisplayTag(adv);
                const locationText = getAdvisoryLocationDisplay(adv);
                const categoryText = getAdvisoryCategory(adv);
                const hasImageBanner = adv.id === 'adv_bonuan_overflow';

                return (
                  <div
                    key={adv.id}
                    onClick={() => setActiveModalAdvisory(adv)}
                    className="bg-white rounded-2xl border border-red-100 shadow-xs hover:border-red-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
                  >
                    {/* Top Container on Card 1 (River overflow warning visual banner) */}
                    {hasImageBanner && (
                      <div className="h-32 w-full bg-gradient-to-tr from-[#7f1d1d] via-[#991b1b] to-[#dc2626] relative overflow-hidden flex items-center justify-center p-4">
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]" />
                        <div className="relative text-center space-y-1">
                          <Waves className="w-8 h-8 text-red-200 mx-auto" />
                          <span className="text-[10px] font-bold text-red-100 uppercase tracking-widest block">
                            River Embankment Monitor
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Card Content Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        {/* Tag Badge & Date Row */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Tag Badge in Red Theme */}
                          {tag === 'Emergency' && (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-600 text-white tracking-wider shadow-2xs">
                              EMERGENCY
                            </span>
                          )}
                          {tag === 'Warning' && (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200 tracking-wider">
                              WARNING
                            </span>
                          )}
                          {tag === 'Advisory' && (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 tracking-wider">
                              ADVISORY
                            </span>
                          )}
                          {tag === 'Preparedness' && (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 tracking-wider">
                              PREPAREDNESS
                            </span>
                          )}

                          {/* Date on Right */}
                          <span className="font-mono text-xs text-slate-400 font-medium">
                            {formatDate(adv.created_at)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-red-700 transition-colors">
                          {adv.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {adv.content}
                        </p>
                      </div>

                      {/* Bottom Metadata: Location on Left & Category on Right */}
                      <div className="pt-3 border-t border-red-50 flex items-center justify-between text-[11px] text-slate-500 font-medium gap-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span className="truncate text-slate-700">{locationText}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-slate-600">
                          <Flag className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{categoryText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Advisory Reader Modal */}
          {activeModalAdvisory && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-red-500 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-red-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-600 text-white tracking-wider">
                      {getAdvisoryDisplayTag(activeModalAdvisory)}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      {activeModalAdvisory.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setActiveModalAdvisory(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
                  <p>{activeModalAdvisory.content}</p>
                </div>

                <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 text-[11px] text-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-800">Target Jurisdiction:</span>
                    <span>{getAdvisoryLocationDisplay(activeModalAdvisory)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-800">Date Issued:</span>
                    <span>{formatDate(activeModalAdvisory.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-800">Issuing Authority:</span>
                    <span>{activeModalAdvisory.author_name}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      triggerPushToast(activeModalAdvisory.title, activeModalAdvisory.content);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                  >
                    Send Push Test
                  </button>
                  <button
                    onClick={() => setActiveModalAdvisory(null)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================== */
        /* 3B. ADMIN BROADCAST CONSOLE (Compose & Published Queue)        */
        /* ============================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Compose Broadcast Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-red-100 shadow-xs p-6 relative">
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-600 rounded-tl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-red-100 mb-5">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Compose Broadcast
              </h2>

              <button
                type="button"
                onClick={handleTogglePush}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  isPushEnabled
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-red-600" />
                <span>{isPushEnabled ? 'Push enabled' : 'Push disabled'}</span>
              </button>
            </div>

            <form onSubmit={handlePublishBroadcast} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  ADVISORY TITLE
                </label>
                <input
                  type="text"
                  required
                  value={advisoryTitle}
                  onChange={(e) => setAdvisoryTitle(e.target.value)}
                  placeholder="e.g. River overflow warning: Bonuan Gueset"
                  className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 bg-red-50/20 border border-red-200 rounded-xl p-3 focus:bg-white focus:border-red-500 outline-hidden transition-all focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    SEVERITY
                  </label>
                  <select
                    value={severity}
                    onChange={(e) =>
                      setSeverity(e.target.value as 'Warning' | 'Emergency' | 'Advisory' | 'Notice')
                    }
                    className="w-full text-xs font-semibold text-slate-800 bg-red-50/20 border border-red-200 rounded-xl p-3 focus:bg-white focus:border-red-500 outline-hidden cursor-pointer"
                  >
                    <option value="Warning">Warning</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Advisory">Advisory</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    BROADCAST TYPE
                  </label>
                  <select
                    value={broadcastType}
                    onChange={(e) =>
                      setBroadcastType(
                        e.target.value as 'Emergency' | 'Preparedness' | 'Weather' | 'Evacuation'
                      )
                    }
                    className="w-full text-xs font-semibold text-slate-800 bg-red-50/20 border border-red-200 rounded-xl p-3 focus:bg-white focus:border-red-500 outline-hidden cursor-pointer"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Preparedness">Preparedness</option>
                    <option value="Weather">Weather Warning</option>
                    <option value="Evacuation">Evacuation Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  AFFECTED AREA
                </label>
                <select
                  value={affectedArea}
                  onChange={(e) => setAffectedArea(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-red-50/20 border border-red-200 rounded-xl p-3 focus:bg-white focus:border-red-500 outline-hidden cursor-pointer"
                >
                  <option value="Municipality-wide (Lingayen)">Municipality-wide (Lingayen)</option>
                  <option value="Coastal barangays">Coastal barangays (Lingayen Gulf)</option>
                  {barangays.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.city || 'Lingayen'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  MESSAGE
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write the advisory residents will receive as a push notification."
                  className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 bg-red-50/20 border border-red-200 rounded-xl p-3.5 focus:bg-white focus:border-red-500 outline-hidden transition-all focus:ring-2 focus:ring-red-100"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Keep it short. Residents read this on a lock screen during an emergency.
                </p>
              </div>

              <div className="pt-3 border-t border-red-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Publish Broadcast</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-red-50/50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    Reach {typeof navigator !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' ? '1' : '0'} subscribed devices
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Preview (Top) + Published (Bottom) (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Preview
              </h3>

              <div className="p-4 rounded-2xl bg-red-50/40 border border-red-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">UniGuard</span>
                  <span className="text-[10px] text-slate-400 font-medium">now</span>
                </div>

                <h4 className="text-xs font-black text-slate-900 leading-snug">
                  {advisoryTitle.trim() || 'Advisory title appears here'}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {message.trim() || 'Your message appears here as residents will see it'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider transition-colors ${
                    severity === 'Warning'
                      ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  WARNING
                </span>

                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider transition-colors ${
                    severity === 'Emergency'
                      ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  EMERGENCY
                </span>
              </div>
            </div>

            {/* Published Advisories List */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-xs overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-red-100 bg-red-50/20 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Published
                </h3>
                <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-mono">
                  {adminFilteredAdvisories.length}
                </span>
              </div>

              <div className="divide-y divide-red-50 max-h-[460px] overflow-y-auto">
                {adminFilteredAdvisories.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No advisories match your search.
                  </div>
                ) : (
                  adminFilteredAdvisories.map((adv) => {
                    const locationText = getAdvisoryLocationDisplay(adv);
                    const categoryText = getAdvisoryCategory(adv);
                    const isSelected = selectedPublishedAdvisory?.id === adv.id;

                    return (
                      <div
                        key={adv.id}
                        onClick={() =>
                          setSelectedPublishedAdvisory(isSelected ? null : adv)
                        }
                        className={`p-4 transition-colors cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-red-50/70 border-l-4 border-red-600'
                            : 'hover:bg-red-50/30'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 mt-1 ${getStatusDotColor(
                              adv
                            )}`}
                          />
                          <h4 className="text-xs font-black text-slate-900 leading-snug">
                            {adv.title}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pl-4.5">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                            <span className="font-medium text-slate-700 truncate">
                              {locationText}
                            </span>
                          </div>

                          <span>•</span>

                          <span
                            className={`font-semibold ${
                              categoryText === 'Emergency' ? 'text-red-700' : 'text-slate-600'
                            }`}
                          >
                            {categoryText}
                          </span>

                          <span>•</span>

                          <span className="font-mono text-slate-400">
                            {formatDate(adv.created_at)}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="mt-2.5 pt-2 border-t border-red-100 text-xs text-slate-700 space-y-2 pl-4.5 animate-in fade-in">
                            <p className="leading-relaxed">{adv.content}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                              <span>Author: {adv.author_name}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerPushToast(adv.title, adv.content);
                                }}
                                className="text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
                              >
                                Push Test to Phone
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
