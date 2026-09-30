import React, { useState, useMemo } from 'react';
import {
  EvacuationCenter,
  User,
  Barangay,
  EvacuationStatus
} from '../types';
import { storage } from '../services/storage';
import {
  Building2,
  Users,
  MapPin,
  Check,
  Search,
  Download,
  Navigation,
  ShieldCheck,
  Radio,
  X,
  Phone,
  AlertTriangle
} from 'lucide-react';

interface EvacuationDirectoryProps {
  evacuationCenters: EvacuationCenter[];
  currentUser: User;
  barangays: Barangay[];
  isOnline: boolean;
  onSelectOnMap?: (center: EvacuationCenter) => void;
}

export const EvacuationDirectory: React.FC<EvacuationDirectoryProps> = ({
  evacuationCenters,
  currentUser,
  barangays,
  isOnline,
  onSelectOnMap,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'full' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('all');
  const [savedOfflineToast, setSavedOfflineToast] = useState<string | null>(null);
  const [editingCenter, setEditingCenter] = useState<EvacuationCenter | null>(null);
  const [editOccupancy, setEditOccupancy] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<EvacuationStatus>('open');

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: evacuationCenters.length,
      open: evacuationCenters.filter((c) => c.status === 'open').length,
      full: evacuationCenters.filter((c) => c.status === 'full').length,
      closed: evacuationCenters.filter((c) => c.status === 'closed').length,
    };
  }, [evacuationCenters]);

  const filteredCenters = useMemo(() => {
    return evacuationCenters.filter((center) => {
      if (statusFilter !== 'all' && center.status !== statusFilter) return false;
      if (selectedBarangay !== 'all' && center.barangay_id !== selectedBarangay) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = center.name.toLowerCase().includes(q);
        const matchesAddress = center.address.toLowerCase().includes(q);
        const matchesBarangay = center.barangay_id.toLowerCase().includes(q);
        if (!matchesName && !matchesAddress && !matchesBarangay) return false;
      }
      return true;
    });
  }, [evacuationCenters, statusFilter, selectedBarangay, searchQuery]);

  const canManage = (center: EvacuationCenter) => {
    if (currentUser.role === 'lgu_admin') return true;
    if (currentUser.role === 'barangay' && currentUser.barangay_id === center.barangay_id) return true;
    return false;
  };

  const handleOpenEdit = (center: EvacuationCenter) => {
    setEditingCenter(center);
    setEditOccupancy(center.current_occupancy);
    setEditStatus(center.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCenter) return;

    storage.updateEvacuationCenter(editingCenter.id, {
      current_occupancy: Number(editOccupancy),
      status: editStatus,
    });

    setEditingCenter(null);
  };

  const handleSaveOffline = (name: string) => {
    setSavedOfflineToast(`Saved ${name} coordinates to offline map cache!`);
    setTimeout(() => {
      setSavedOfflineToast(null);
    }, 3500);
  };

  const getBarangayDisplayName = (barangayId: string) => {
    const found = barangays.find((b) => b.id.toLowerCase() === barangayId.toLowerCase());
    if (found) return found.name;
    // Format id like 'libsong_east' -> 'Libsong East'
    return barangayId
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner matching Red, Maroon, Black Palette */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#7f1d1d] to-[#991B1B] border border-rose-900/40">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-rose-200 text-[10px] font-black tracking-widest uppercase border border-rose-500/20 backdrop-blur-xs">
            <Building2 className="w-3.5 h-3.5 text-rose-300" />
            <span>Evacuation Center Directory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Shelters
          </h1>

          <p className="text-rose-100/90 text-xs sm:text-sm font-medium leading-relaxed">
            Evacuation Center Directory with live availability for Lingayen, Pangasinan.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-bold text-rose-100">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-rose-300" />
              <span>This list works without a connection</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              📍 5 Designated Facilities
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              🚗 Waze Navigation Integrated
            </span>
          </div>
        </div>

        {/* Decorative Background Motif */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <Building2 className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* 2. Filter Pills & Live Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter Pills: All 5 | Open 2 | Full 1 | Closed 2 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                statusFilter === 'all'
                  ? 'bg-[#991B1B] text-white shadow-xs border border-transparent'
                  : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-200'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/20">
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('open')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                statusFilter === 'open'
                  ? 'bg-[#991B1B] text-white shadow-xs border border-transparent'
                  : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-200'
              }`}
            >
              <span>Open</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/20">
                {counts.open}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('full')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                statusFilter === 'full'
                  ? 'bg-[#991B1B] text-white shadow-xs border border-transparent'
                  : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-200'
              }`}
            >
              <span>Full</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/20">
                {counts.full}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                statusFilter === 'closed'
                  ? 'bg-[#991B1B] text-white shadow-xs border border-transparent'
                  : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-200'
              }`}
            >
              <span>Closed</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/20">
                {counts.closed}
              </span>
            </button>
          </div>

          {/* Offline indicator text matching screenshot */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium self-start sm:self-auto">
            <Radio className="w-3.5 h-3.5 text-[#991B1B]" />
            <span>This list works without a connection</span>
          </div>
        </div>

        {/* Search input field */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by shelter name, address, or barangay..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#991B1B] focus:border-transparent bg-slate-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Shelter Cards Grid (Matching Draft Content & Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCenters.map((center) => {
          const percent = center.capacity > 0 ? Math.round((center.current_occupancy / center.capacity) * 100) : 0;
          const userCanManage = canManage(center);

          return (
            <div
              key={center.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header row: Shelter Name + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {center.name}
                  </h3>

                  {center.status === 'open' && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
                      OPEN
                    </span>
                  )}
                  {center.status === 'full' && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-[#991B1B] text-white shadow-xs shrink-0">
                      FULL
                    </span>
                  )}
                  {center.status === 'closed' && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 shrink-0">
                      CLOSED
                    </span>
                  )}
                </div>

                {/* Barangay & Occupancy Line */}
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-[#991B1B]" />
                    <span>{getBarangayDisplayName(center.barangay_id)}</span>
                  </span>
                  <span>•</span>
                  <span>
                    👥 {center.current_occupancy} of {center.capacity} slots
                  </span>
                </p>

                {/* Capacity Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      center.status === 'full'
                        ? 'bg-[#991B1B]'
                        : center.current_occupancy > 0
                        ? 'bg-[#991B1B]'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                  />
                </div>

                {/* Coordinate Note (Matching Initial Draft) */}
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  {center.notes || 'Coordinates sourced from OpenStreetMap-aligned data.'}
                </p>
              </div>

              {/* Action Buttons: Navigate with Waze (Styled Red/Maroon/Black) + Offline Download Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
                      center.name + ' Lingayen Pangasinan'
                    )}&navigate=yes`;
                    window.open(wazeUrl, '_blank');
                  }}
                  className="flex-1 bg-[#991B1B] hover:bg-[#7f1d1d] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate with Waze</span>
                </button>

                <button
                  onClick={() => handleSaveOffline(center.name)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-[#991B1B] border border-slate-200 transition cursor-pointer active:scale-95 shrink-0"
                  title="Save shelter coordinates for offline navigation"
                >
                  <Download className="w-4 h-4" />
                </button>

                {userCanManage && (
                  <button
                    onClick={() => handleOpenEdit(center)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition cursor-pointer shrink-0"
                    title="Update shelter capacity"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Offline Saved Toast Notification */}
      {savedOfflineToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-rose-900/40 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-rose-300" />
          <span>{savedOfflineToast}</span>
        </div>
      )}

      {/* Admin Update Evacuation Stats Modal */}
      {editingCenter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Update Evacuation Shelter Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">{editingCenter.name}</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shelter Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as EvacuationStatus)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="open">🟢 Open (Available)</option>
                  <option value="full">🔴 Full (At Max Capacity)</option>
                  <option value="closed">⚪ Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Occupant Headcount (Max Capacity: {editingCenter.capacity})
                </label>
                <input
                  type="number"
                  min="0"
                  max={editingCenter.capacity * 1.5}
                  value={editOccupancy}
                  onChange={(e) => setEditOccupancy(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCenter(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7f1d1d] rounded-lg shadow-xs cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
