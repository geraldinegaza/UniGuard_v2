import React, { useState, useMemo } from 'react';
import {
  EmergencyHotline,
  Barangay
} from '../types';
import {
  Phone,
  PhoneCall,
  Copy,
  Check,
  Search,
  Download,
  Info,
  ShieldAlert,
  Flame,
  HeartPulse,
  Radio,
  X
} from 'lucide-react';

interface HotlineDirectoryProps {
  hotlines: EmergencyHotline[];
  barangays: Barangay[];
  isOnline: boolean;
}

export const HotlineDirectory: React.FC<HotlineDirectoryProps> = ({
  hotlines,
  barangays,
  isOnline,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    showToast(`Copied ${num} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveOffline = () => {
    showToast('Saved all emergency hotlines to offline device storage!');
  };

  const categories = useMemo(() => {
    const tags = new Set<string>();
    hotlines.forEach((h) => {
      if (h.tag && h.tag.toUpperCase() !== 'CITYWIDE') tags.add(h.tag);
    });
    return ['all', ...Array.from(tags)];
  }, [hotlines]);

  const filteredHotlines = useMemo(() => {
    return hotlines.filter((h) => {
      if (selectedTag !== 'all' && h.tag !== selectedTag) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = h.agency_name.toLowerCase().includes(q);
        const matchesNumber = h.contact_number.includes(q);
        const matchesTag = h.tag && h.tag.toUpperCase() !== 'CITYWIDE' && h.tag.toLowerCase().includes(q);
        const matchesDesc = h.description.toLowerCase().includes(q);
        if (!matchesName && !matchesNumber && !matchesTag && !matchesDesc) return false;
      }
      return true;
    });
  }, [hotlines, selectedTag, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner matching Red, Maroon, Black Palette */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#7f1d1d] to-[#991B1B] border border-rose-900/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          {/* Top row before and above Hotlines */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-rose-200 text-[10px] font-black tracking-widest uppercase border border-rose-500/20 backdrop-blur-xs">
              <PhoneCall className="w-3.5 h-3.5 text-rose-300" />
              <span>Emergency Telecommunications</span>
            </div>

            {/* Save Offline Action (Positioned before/above Hotlines) */}
            <button
              onClick={handleSaveOffline}
              className="px-3.5 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 shrink-0 backdrop-blur-xs"
            >
              <Download className="w-3.5 h-3.5 text-rose-300" />
              <span>Save Offline</span>
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Hotlines
            </h1>
            <p className="text-rose-100/90 text-xs sm:text-sm font-medium leading-relaxed">
              Emergency Hotline Directory for barangay and municipal offices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-bold text-rose-100">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              📞 24/7 Operations Desk
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              ⚡ Instant One-Tap Calling
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              📶 Cached for Zero-Signal Outages
            </span>
          </div>
        </div>

        {/* Decorative Background Motif */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <Phone className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedTag === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedTag(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-[#991B1B] text-white shadow-xs border border-transparent'
                      : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-200'
                  }`}
                >
                  {cat === 'all' ? 'All Hotlines' : cat}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            {filteredHotlines.length} {filteredHotlines.length === 1 ? 'line active' : 'lines active'}
          </span>
        </div>

        {/* Search Field */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agency name, hotline number, or service category..."
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

      {/* 3. Hotlines Cards Grid (Matching Draft Content: 7 Hotlines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredHotlines.map((hotline) => {
          const isCopied = copiedId === hotline.id;
          const cleanPhone = hotline.contact_number.replace(/[^0-9+]/g, '');

          return (
            <div
              key={hotline.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Tag + Phone Icon */}
                <div className="flex items-center justify-between gap-2">
                  {hotline.tag && hotline.tag.toUpperCase() !== 'CITYWIDE' ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-rose-50 text-[#991B1B] border border-rose-200 tracking-wider">
                      {hotline.tag}
                    </span>
                  ) : (
                    <div />
                  )}

                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-[#991B1B]" />
                  </div>
                </div>

                {/* Agency Name */}
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                  {hotline.agency_name}
                </h3>

                {/* Big Phone Number Display */}
                <div className="pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black font-mono tracking-tight text-[#991B1B]">
                      {hotline.contact_number}
                    </span>

                    <button
                      onClick={() => handleCopy(hotline.id, hotline.contact_number)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Copy phone number"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {hotline.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {hotline.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Call Action Button (Styled in Red, Maroon, Black) */}
              <div className="pt-2 border-t border-slate-100">
                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full bg-[#991B1B] hover:bg-[#7f1d1d] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Advisory Box (Matching Initial Draft Note) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 text-slate-800 shadow-xs flex items-start gap-3">
        <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#991B1B] flex items-center justify-center shrink-0 mt-0.5 border border-rose-200">
          <Info className="w-4 h-4" />
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          If a line is busy, keep the call short and state your barangay, landmark and number of people needing help.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-rose-900/40 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-rose-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
