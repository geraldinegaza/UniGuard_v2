import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  IncidentReport,
  Barangay,
  User,
  IncidentStatus,
  SystemAuditLog,
  HazardType
} from '../types';
import { storage } from '../services/storage';
import {
  ShieldAlert,
  ShieldCheck,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Send,
  FileText,
  History,
  Building,
  Check,
  X,
  Filter,
  ArrowRight,
  Search,
  Radio,
  Bell,
  ChevronDown,
  Eye,
  MapPin,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';

interface AdminTriageProps {
  reports: IncidentReport[];
  barangays: Barangay[];
  currentUser: User;
  onReportsUpdated: () => void;
  onNavigateTab?: (tab: string) => void;
  onSelectReport?: (report: IncidentReport) => void;
}

// Consistent incident code generator e.g. UG-2026-0002
function formatIncidentCode(reportId: string, index: number): string {
  if (reportId === 'rep_100a') return 'UG-2026-0002';
  if (reportId === 'rep_100b') return 'UG-2026-0001';
  const match = reportId.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `UG-2026-${String(num).padStart(4, '0')}`;
  }
  return `UG-2026-${String(index + 1).padStart(4, '0')}`;
}

// Format relative time (e.g., "1d ago", "10h 51m ago", "45m ago")
function formatRelativeTime(dateString: string): string {
  const diffMs = Math.max(0, Date.now() - new Date(dateString).getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) {
    const remMinutes = diffMinutes % 60;
    return `${diffHours}h ${remMinutes > 0 ? `${remMinutes}m ` : ''}ago`;
  }
  return `${diffDays}d ago`;
}

// Map hazard severity to 4-bar indicator and label
function getSeverityInfo(hazardType: HazardType | string): {
  level: number;
  label: 'EMERGENCY' | 'WARNING' | 'ADVISORY';
} {
  switch (hazardType) {
    case 'Emergency SOS':
    case 'Storm Surge':
    case 'Fire':
    case 'Flood':
      return { level: 4, label: 'EMERGENCY' };
    case 'Typhoon / Strong Winds':
    case 'Downed Powerline':
    case 'Landslide':
      return { level: 3, label: 'WARNING' };
    default:
      return { level: 2, label: 'ADVISORY' };
  }
}

export const AdminTriage: React.FC<AdminTriageProps> = ({
  reports,
  barangays,
  currentUser,
  onReportsUpdated,
  onNavigateTab,
  onSelectReport,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'audit'>('queue');
  // Status filter tabs matching screenshot: All, Reported (unverified), Verified, Response Dispatched, Resolved
  const [statusFilter, setStatusFilter] = useState<'all' | 'unverified' | 'verified' | 'dispatched' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<IncidentReport | null>(null);

  // Dispatch & Resolution Modals
  const [dispatchModalReport, setDispatchModalReport] = useState<IncidentReport | null>(null);
  const [assignedTeam, setAssignedTeam] = useState('BDRRMC Quick Response Rescue Team');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [resolveModalReport, setResolveModalReport] = useState<IncidentReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const isLgu = currentUser.role === 'lgu_admin';
  const isBarangay = currentUser.role === 'barangay';

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

  // Helper to get Barangay Name
  const getBarangayName = (barangayId: string) => {
    const b = barangays.find((brgy) => brgy.id === barangayId);
    return b ? b.name : 'Bonuan Gueset';
  };

  // Area-scoped filtering: If Barangay official, scope to their jurisdiction
  const areaFilteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (isBarangay && currentUser.barangay_id) {
        return r.barangay_id === currentUser.barangay_id;
      }
      return true; // LGU sees all
    });
  }, [reports, isBarangay, currentUser.barangay_id]);

  // Counts for the 5 filter buttons from screenshot:
  // All | Reported | Verified | Response Dispatched | Resolved
  const counts = useMemo(() => {
    return {
      all: areaFilteredReports.length,
      reported: areaFilteredReports.filter((r) => r.status === 'unverified').length,
      verified: areaFilteredReports.filter((r) => r.status === 'verified').length,
      dispatched: areaFilteredReports.filter((r) => r.status === 'dispatched').length,
      resolved: areaFilteredReports.filter((r) => r.status === 'resolved').length,
    };
  }, [areaFilteredReports]);

  // Filtered reports matching status tab and search query
  const filteredReports = useMemo(() => {
    let result = [...areaFilteredReports];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r, idx) => {
        const code = formatIncidentCode(r.id, idx).toLowerCase();
        const hazard = r.hazard_type.toLowerCase();
        const desc = r.description.toLowerCase();
        const brgy = getBarangayName(r.barangay_id).toLowerCase();
        const reporter = r.reporter_name.toLowerCase();
        const team = (r.assigned_team || '').toLowerCase();
        return (
          code.includes(q) ||
          hazard.includes(q) ||
          desc.includes(q) ||
          brgy.includes(q) ||
          reporter.includes(q) ||
          team.includes(q)
        );
      });
    }

    // Sort newest first
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [areaFilteredReports, statusFilter, searchQuery, barangays]);

  // Handlers
  const handleVerifyManual = (report: IncidentReport) => {
    const res = storage.updateIncidentStatus(report.id, 'verified', currentUser, {
      dispatch_notes: `Manually verified by ${currentUser.full_name} (${currentUser.role.toUpperCase()})`,
    });
    setActionNotice(res.message);
    onReportsUpdated();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalReport) return;

    const res = storage.updateIncidentStatus(dispatchModalReport.id, 'dispatched', currentUser, {
      assigned_team: assignedTeam,
      dispatch_notes: dispatchNotes || 'Response personnel mobilized to ground scene.',
    });

    setActionNotice(res.message);
    setDispatchModalReport(null);
    setDispatchNotes('');
    onReportsUpdated();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalReport) return;

    const res = storage.updateIncidentStatus(resolveModalReport.id, 'resolved', currentUser, {
      resolution_notes: resolutionNotes || 'Hazard cleared and verified safe by field inspectors.',
    });

    setActionNotice(res.message);
    setResolveModalReport(null);
    setResolutionNotes('');
    onReportsUpdated();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const auditLogs = storage.getAuditLogs();

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Command Console Top Bar (Search, Shortcut ⌘K, Live Feed, Alerts) */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Branding / Breadcrumb */}
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
                {isLgu ? 'LGU JURISDICTION' : `BRGY. ${currentUser.barangay_id?.toUpperCase()}`}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Municipality of Lingayen, Pangasinan
            </p>
          </div>
        </div>

        {/* Center: Search incidents, responders, or locations + ⌘K shortcut */}
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

        {/* Right Actions: Live Feed Button & Notifications */}
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
            onClick={() => setActiveSubTab(activeSubTab === 'queue' ? 'audit' : 'queue')}
            className={`p-2 rounded-xl border transition-colors cursor-pointer relative ${
              activeSubTab === 'audit'
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-white text-slate-600 hover:text-red-600 border-red-200 hover:bg-red-50/50'
            }`}
            title="System Audit Log"
          >
            <History className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Action Flash Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="cursor-pointer text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Main Incident Queue View */}
      {activeSubTab === 'queue' ? (
        <div className="space-y-4">
          {/* Section Title & Description */}
          <div className="px-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Incident Queue
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track every report through reported, verified, response dispatched and resolved.
            </p>
          </div>

          {/* Filter Tabs (All, Reported, Verified, Response Dispatched, Resolved) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* Tab: All */}
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                statusFilter === 'all'
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-red-200 hover:bg-red-50/60'
              }`}
            >
              <span>All</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  statusFilter === 'all' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700'
                }`}
              >
                {counts.all}
              </span>
            </button>

            {/* Tab: Reported (Unverified) */}
            <button
              onClick={() => setStatusFilter('unverified')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                statusFilter === 'unverified'
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-red-200 hover:bg-red-50/60'
              }`}
            >
              <span>Reported</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  statusFilter === 'unverified' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700'
                }`}
              >
                {counts.reported}
              </span>
            </button>

            {/* Tab: Verified */}
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                statusFilter === 'verified'
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-red-200 hover:bg-red-50/60'
              }`}
            >
              <span>Verified</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  statusFilter === 'verified' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700'
                }`}
              >
                {counts.verified}
              </span>
            </button>

            {/* Tab: Response Dispatched */}
            <button
              onClick={() => setStatusFilter('dispatched')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                statusFilter === 'dispatched'
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-red-200 hover:bg-red-50/60'
              }`}
            >
              <span>Response Dispatched</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  statusFilter === 'dispatched' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700'
                }`}
              >
                {counts.dispatched}
              </span>
            </button>

            {/* Tab: Resolved */}
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                statusFilter === 'resolved'
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-red-200 hover:bg-red-50/60'
              }`}
            >
              <span>Resolved</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  statusFilter === 'resolved' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700'
                }`}
              >
                {counts.resolved}
              </span>
            </button>
          </div>

          {/* 3. Incidents Table Queue (Matching Features from Screenshot in Red) */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-xs overflow-hidden">
            {/* Table Header Row */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-red-50/30 border-b border-red-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <div className="col-span-2">STATUS</div>
              <div className="col-span-4">HAZARD / DESCRIPTION</div>
              <div className="col-span-2">BARANGAY</div>
              <div className="col-span-1 text-center">CORROBORATION</div>
              <div className="col-span-1">AGE</div>
              <div className="col-span-2">SEVERITY</div>
            </div>

            {/* Table Rows */}
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Incidents in this Queue</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? `No matching incident records found for "${searchQuery}".`
                    : 'All incident tickets in this category have been processed or moved.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-red-50">
                {filteredReports.map((report, index) => {
                  const incidentCode = formatIncidentCode(report.id, index);
                  const brgyName = getBarangayName(report.barangay_id);
                  const severity = getSeverityInfo(report.hazard_type);
                  const isEmergency = severity.label === 'EMERGENCY';
                  const isSelected = selectedIncidentDetail?.id === report.id;

                  // Status badge label and style
                  const statusLabel =
                    report.status === 'unverified'
                      ? 'REPORTED'
                      : report.status === 'verified'
                      ? 'VERIFIED'
                      : report.status === 'dispatched'
                      ? 'DISPATCHED'
                      : 'RESOLVED';

                  return (
                    <div
                      key={report.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-red-50/60' : 'hover:bg-red-50/20'
                      }`}
                    >
                      {/* Desktop Grid Layout */}
                      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                        {/* 1. STATUS */}
                        <div className="col-span-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider border uppercase ${
                              report.status === 'unverified'
                                ? 'bg-white text-red-700 border-red-300 shadow-2xs'
                                : report.status === 'verified'
                                ? 'bg-red-50 text-red-800 border-red-300 font-extrabold'
                                : report.status === 'dispatched'
                                ? 'bg-red-600 text-white border-red-700 shadow-2xs font-extrabold'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        {/* 2. HAZARD / DESCRIPTION */}
                        <div className="col-span-4 min-w-0">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 text-red-600 shrink-0">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                  {incidentCode}
                                </span>
                              </div>
                              <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">
                                {report.hazard_type}
                              </h3>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {report.description}
                              </p>
                              {report.assigned_team && (
                                <p className="text-[10px] font-bold text-red-700 mt-1 flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-red-600" />
                                  <span>Assigned: {report.assigned_team}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3. BARANGAY */}
                        <div className="col-span-2 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {brgyName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {brgyName}
                          </div>
                        </div>

                        {/* 4. CORROBORATION */}
                        <div className="col-span-1 text-center">
                          <span
                            className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              report.corroboration_count >= 3
                                ? 'bg-red-600 text-white'
                                : report.corroboration_count > 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}
                          >
                            {report.corroboration_count}/3
                          </span>
                        </div>

                        {/* 5. AGE */}
                        <div className="col-span-1 text-xs text-slate-500 font-medium">
                          {formatRelativeTime(report.created_at)}
                        </div>

                        {/* 6. SEVERITY */}
                        <div className="col-span-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* 4-Bar indicator in Red */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4].map((barIndex) => (
                                <span
                                  key={barIndex}
                                  className={`w-1 h-3.5 rounded-2xs transition-colors ${
                                    barIndex <= severity.level ? 'bg-red-600' : 'bg-red-100'
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Severity Label in Red */}
                            <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                              {severity.label}
                            </span>
                          </div>

                          {/* Quick Action Button */}
                          <div className="flex items-center gap-1.5">
                            {report.status === 'unverified' && (
                              <button
                                onClick={() => handleVerifyManual(report)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Verify Incident"
                              >
                                Verify
                              </button>
                            )}
                            {report.status === 'verified' && (
                              <button
                                onClick={() => {
                                  setDispatchModalReport(report);
                                  setDispatchNotes('');
                                }}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Dispatch Responders"
                              >
                                Dispatch
                              </button>
                            )}
                            {report.status === 'dispatched' && (
                              <button
                                onClick={() => {
                                  setResolveModalReport(report);
                                  setResolutionNotes('');
                                }}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Resolve Incident"
                              >
                                Resolve
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setSelectedIncidentDetail(
                                  selectedIncidentDetail?.id === report.id ? null : report
                                )
                              }
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Toggle details"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  isSelected ? 'rotate-180 text-red-600' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mobile / Compact Card View */}
                      <div className="lg:hidden p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                report.status === 'unverified'
                                  ? 'bg-white text-red-700 border-red-300'
                                  : report.status === 'verified'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : report.status === 'dispatched'
                                  ? 'bg-red-600 text-white border-red-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {statusLabel}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {incidentCode}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4].map((barIndex) => (
                                <span
                                  key={barIndex}
                                  className={`w-1 h-3 rounded-2xs ${
                                    barIndex <= severity.level ? 'bg-red-600' : 'bg-red-100'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-black uppercase text-red-600">
                              {severity.label}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase">
                            {report.hazard_type}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {report.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                            <span>{brgyName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-red-700">
                              {report.corroboration_count}/3 confirms
                            </span>
                            <span>•</span>
                            <span>{formatRelativeTime(report.created_at)}</span>
                          </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-50">
                          {report.status === 'unverified' && (
                            <button
                              onClick={() => handleVerifyManual(report)}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Verify
                            </button>
                          )}
                          {report.status === 'verified' && (
                            <button
                              onClick={() => {
                                setDispatchModalReport(report);
                                setDispatchNotes('');
                              }}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          {report.status === 'dispatched' && (
                            <button
                              onClick={() => {
                                setResolveModalReport(report);
                                setResolutionNotes('');
                              }}
                              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setSelectedIncidentDetail(
                                selectedIncidentDetail?.id === report.id ? null : report
                              )
                            }
                            className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 cursor-pointer"
                          >
                            {isSelected ? 'Hide' : 'Details'}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Incident Details Drawer */}
                      {isSelected && (
                        <div className="px-6 py-4 bg-red-50/30 border-t border-red-100 text-xs space-y-3 animate-in fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-2xs">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Reporter</p>
                              <p className="font-bold text-slate-800 mt-0.5">{report.reporter_name}</p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Coordinates: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                              </p>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-2xs">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Corroboration Engine</p>
                              <p className="font-bold text-red-700 mt-0.5">
                                {report.corroboration_count} of 3 required confirmations
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {report.corroboration_count >= 3
                                  ? 'Auto-corroborated via GPS proximity quorum'
                                  : 'Awaiting additional citizen field reports'}
                              </p>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-2xs">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Dispatch / Team</p>
                              <p className="font-bold text-slate-800 mt-0.5">
                                {report.assigned_team || 'Pending assignment'}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1 truncate">
                                {report.dispatch_notes || 'No dispatch notes recorded'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              {onSelectReport && (
                                <button
                                  onClick={() => onSelectReport(report)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-white hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                                  <span>View on Operations Map</span>
                                </button>
                              )}
                            </div>

                            <span className="text-[11px] text-slate-400">
                              Ticket Code: <strong className="font-mono text-slate-700">{incidentCode}</strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 4. Audit Trail Log View (Accessible via clock button) */
        <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-red-100">
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                UniGuard System Audit & State Machine Logs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable event stream for LDRRMC incident verification & dispatch actions
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('queue')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Back to Incident Queue</span>
            </button>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-red-100 bg-red-50/20 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        log.event_type === 'crowd_corroboration_auto_verify'
                          ? 'bg-red-600 text-white border-red-700'
                          : log.event_type === 'emergency_broadcast'
                          ? 'bg-red-600 text-white border-red-700'
                          : 'bg-white text-red-800 border-red-200'
                      }`}
                    >
                      {log.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-slate-800">Actor: {log.actor_name}</span>
                  </div>
                  <p className="text-slate-600">{log.description}</p>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Dispatch Modal (Pure Red Accent) */}
      {dispatchModalReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <h3 className="font-black text-slate-900 text-base">
                Dispatch DRRM Response Unit
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Mobilizing teams for {dispatchModalReport.hazard_type} in {getBarangayName(dispatchModalReport.barangay_id)}
            </p>

            <form onSubmit={handleDispatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Response Unit
                </label>
                <select
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full text-xs font-semibold bg-red-50/40 border border-red-200 rounded-xl p-2.5 focus:border-red-500 outline-hidden"
                >
                  <option value="BDRRMC Quick Response Rescue Team">
                    BDRRMC Quick Response Rescue Team
                  </option>
                  <option value="Bureau of Fire Protection (BFP Lingayen)">
                    Bureau of Fire Protection (BFP Lingayen)
                  </option>
                  <option value="PANELCO I Power Restoration Crew">
                    PANELCO I Power Restoration Crew
                  </option>
                  <option value="Lingayen Municipal Engineering / Heavy Clearing">
                    Lingayen Municipal Engineering / Heavy Clearing
                  </option>
                  <option value="Philippine Coast Guard Water Rescue">
                    Philippine Coast Guard Water Rescue
                  </option>
                  <option value="Red Cross Emergency Paramedics">
                    Red Cross Emergency Paramedics
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dispatch Orders / Tactical Instructions
                </label>
                <textarea
                  rows={3}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="e.g. Bring 2 motorized rubber boats and water pumps; proceed to coastal zone perimeter..."
                  className="w-full text-xs p-2.5 border border-red-200 rounded-xl focus:border-red-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalReport(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Resolve Incident Modal */}
      {resolveModalReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-red-600" />
              <h3 className="font-black text-slate-900 text-base">
                Mark Incident as Resolved
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Closing incident {resolveModalReport.hazard_type} in {getBarangayName(resolveModalReport.barangay_id)}
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resolution Summary / Post-Action Report
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Flood waters receded, road obstruction cleared, area safe for traffic."
                  className="w-full text-xs p-2.5 border border-red-200 rounded-xl focus:border-red-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalReport(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Incident Cleared</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
