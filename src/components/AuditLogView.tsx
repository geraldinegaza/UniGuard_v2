import React, { useState } from 'react';
import { SystemAuditLog, User } from '../types';
import { storage } from '../services/storage';
import {
  FileText,
  Search,
  Filter,
  Clock,
  ShieldAlert,
  Radio,
  Truck,
  CheckCircle,
  DownloadCloud,
  Activity,
  Calendar
} from 'lucide-react';

interface AuditLogViewProps {
  currentUser: User;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const logs = storage.getAuditLogs();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || log.event_type === filterType;
    return matchesSearch && matchesType;
  });

  const getEventBadge = (type: SystemAuditLog['event_type']) => {
    switch (type) {
      case 'emergency_broadcast':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Radio className="w-3 h-3 text-rose-600" />
            Emergency Broadcast
          </span>
        );
      case 'status_dispatch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Truck className="w-3 h-3 text-amber-600" />
            Team Dispatch
          </span>
        );
      case 'status_resolve':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Incident Resolved
          </span>
        );
      case 'crowd_corroboration_auto_verify':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldAlert className="w-3 h-3 text-blue-600" />
            Auto-Verified
          </span>
        );
      case 'offline_sync':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <DownloadCloud className="w-3 h-3 text-purple-600" />
            Offline Sync
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            <Activity className="w-3 h-3 text-slate-600" />
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#881337] text-white flex items-center justify-center shadow-md shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>UniGuard Operational Audit Trail</span>
              <span className="text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                {logs.length} Events Recorded
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable chain of DRRM dispatches, verification logs, early warning broadcasts, and offline sync cycles.
            </p>
          </div>
        </div>

        {/* Realtime Active Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600">Audit Logging Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by description, actor, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="all">All Events ({logs.length})</option>
            <option value="emergency_broadcast">Emergency Broadcasts</option>
            <option value="status_dispatch">Dispatches</option>
            <option value="status_resolve">Resolutions</option>
            <option value="crowd_corroboration_auto_verify">Auto-Verifications</option>
            <option value="offline_sync">Offline Syncs</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No audit records found matching your filters.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {getEventBadge(log.event_type)}
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    {log.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">
                      Actor: <span className="font-bold text-slate-900">{log.actor_name}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">Target: {log.target_id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono shrink-0 sm:text-right">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
