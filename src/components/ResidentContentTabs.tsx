import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  HeartHandshake,
  BookOpen,
  HelpCircle,
  Package,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Waves,
  Flame,
  Check,
  Search,
  Info,
  UserCheck,
  IdCard,
  Building,
  User,
  Maximize2,
  Minimize2,
  X,
  Filter
} from 'lucide-react';
import { Barangay, User as UserType } from '../types';

interface ReliefDistributionHub {
  id: string;
  barangay: string;
  location: string;
  schedule: string;
  status: 'Distributing Now' | 'Scheduled' | 'Completed';
  items: string[];
  contactPerson: string;
  beneficiariesCount: number;
}

const ALL_LINGAYEN_BARANGAYS = [
  'All',
  'Aliwekwek',
  'Baay',
  'Balangobong',
  'Balococ',
  'Bantayan',
  'Basing',
  'Capandanan',
  'Domalandan Center',
  'Domalandan East',
  'Domalandan West',
  'Dorongan',
  'Dulag',
  'Estanza',
  'Lasip',
  'Libsong East',
  'Libsong West',
  'Malawa',
  'Malimpuec',
  'Maniboc',
  'Matalava',
  'Naguelguel',
  'Namolan',
  'Pangapisan North',
  'Pangapisan Sur',
  'Poblacion',
  'Quibaol',
  'Rosario',
  'Sabangan',
  'Talogtog',
  'Tonton',
  'Tumbar',
  'Wawa',
] as const;

export const ResidentReliefView: React.FC<{ barangays: Barangay[]; currentUser: UserType }> = ({
  barangays,
  currentUser,
}) => {
  // Determine user's home barangay from account
  const userBarangayName = useMemo(() => {
    if (currentUser?.barangay_id) {
      const match = ALL_LINGAYEN_BARANGAYS.find(
        (b) =>
          b.toLowerCase() === currentUser.barangay_id?.toLowerCase() ||
          currentUser.barangay_id?.toLowerCase().includes(b.toLowerCase())
      );
      if (match) return match;
    }
    return 'Poblacion'; // Default for citizen account
  }, [currentUser]);

  // Automatic default based on user's account, with option to choose All or per barangay
  const [selectedBarangay, setSelectedBarangay] = useState<string>(() => userBarangayName);
  const [isBarangayDropdownOpen, setIsBarangayDropdownOpen] = useState<boolean>(false);
  const [barangaySearchFilter, setBarangaySearchFilter] = useState<string>('');
  const [isScheduleMinimized, setIsScheduleMinimized] = useState<boolean>(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBarangayDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep synced if user switches demo persona
  useEffect(() => {
    if (userBarangayName) {
      setSelectedBarangay(userBarangayName);
    }
  }, [userBarangayName]);

  const [searchBeneficiaryQuery, setSearchBeneficiaryQuery] = useState<string>('');
  const [beneficiarySearchResult, setBeneficiarySearchResult] = useState<{
    searched: boolean;
    found: boolean;
    name?: string;
    barangay?: string;
    controlNo?: string;
    status?: string;
  } | null>(null);

  // Active relief distribution hubs in Lingayen
  const activeHubs: ReliefDistributionHub[] = [
    {
      id: 'hub-poblacion',
      barangay: 'Poblacion',
      location: 'Lingayen Municipal Civic Center, Avenida Rizal East',
      schedule: 'Daily: 8:00 AM - 5:00 PM',
      status: 'Distributing Now',
      items: [
        '5kg NFA Iron-Fortified Rice',
        '6 Canned Fish & Corned Beef',
        'Family Hygiene & Sanitation Pack',
        '10L Potable Mineral Water',
      ],
      contactPerson: 'MSWDO Desk - (075) 633-5702',
      beneficiariesCount: 420,
    },
    {
      id: 'hub-maniboc',
      barangay: 'Maniboc',
      location: 'Maniboc Barangay Covered Court & Evacuation Center',
      schedule: 'Mon - Sat: 9:00 AM - 4:00 PM',
      status: 'Distributing Now',
      items: [
        'Family Food Pack (DSWD Specification)',
        'Ready-to-Eat Emergency Meals',
        'Infant Care & Diaper Kit',
        'First Aid Antiseptic Supplies',
      ],
      contactPerson: 'Brgy. Health Desk - 0917-888-1234',
      beneficiariesCount: 285,
    },
    {
      id: 'hub-libsong-east',
      barangay: 'Libsong East',
      location: 'Libsong East Elementary School Multi-Purpose Gymnasium',
      schedule: 'Tue, Thu, Sat: 8:30 AM - 3:00 PM',
      status: 'Scheduled',
      items: [
        'Rice & Dry Goods Ration',
        'Water Purification Tablets',
        'Sanitation Kit & Soap Bars',
        'Thermal Emergency Blankets',
      ],
      contactPerson: 'Barangay Relief Coordinator - 0920-555-7890',
      beneficiariesCount: 190,
    },
    {
      id: 'hub-pangapisan-north',
      barangay: 'Pangapisan North',
      location: 'Pangapisan North Community Multi-Purpose Center',
      schedule: 'Daily during Calamity Status: 8:00 AM - 4:30 PM',
      status: 'Distributing Now',
      items: [
        'Standard Food Pack',
        'Fortified Energy Biscuits',
        'Emergency Solar Lantern',
        'Clean Water Jerrycan',
      ],
      contactPerson: 'LDRRMO Relief Liaison Desk',
      beneficiariesCount: 215,
    },
    {
      id: 'hub-baay',
      barangay: 'Baay',
      location: 'Baay Barangay Hall & Covered Auditorium',
      schedule: 'Mon, Wed, Fri: 9:00 AM - 3:00 PM',
      status: 'Scheduled',
      items: [
        'Family Food Pack',
        'Instant Noodles & Canned Goods',
        'Basic Hygiene Pack',
      ],
      contactPerson: 'BDRRMC Baay Committee on Relief',
      beneficiariesCount: 160,
    },
    {
      id: 'hub-domalandan-center',
      barangay: 'Domalandan Center',
      location: 'Domalandan Center Integrated School Gymnasium',
      schedule: 'Daily: 8:30 AM - 4:00 PM',
      status: 'Distributing Now',
      items: [
        '5kg Rice & Canned Goods',
        'Hygiene Kit',
        'Mineral Drinking Water',
      ],
      contactPerson: 'Domalandan Center Relief Desk',
      beneficiariesCount: 175,
    },
  ];

  // Sample masterlist of authorized beneficiaries for verification checker
  const sampleBeneficiaryMasterlist = [
    { name: 'Juan Dela Cruz', barangay: 'Poblacion', controlNo: 'MSWDO-POB-0142', status: 'Authorized - Ready for Pickup' },
    { name: 'Maria Santos', barangay: 'Maniboc', controlNo: 'MSWDO-MAN-0089', status: 'Authorized - Ready for Pickup' },
    { name: 'Roberto Gomez', barangay: 'Baay', controlNo: 'MSWDO-BAA-0034', status: 'Authorized - Ready for Pickup' },
    { name: 'Elena Ramos', barangay: 'Libsong East', controlNo: 'MSWDO-LBE-0201', status: 'Authorized - Scheduled for Thu' },
    { name: 'Antonio Reyes', barangay: 'Pangapisan North', controlNo: 'MSWDO-PAN-0112', status: 'Authorized - Ready for Pickup' },
    { name: 'Teresa Aquino', barangay: 'Domalandan Center', controlNo: 'MSWDO-DOC-0058', status: 'Authorized - Ready for Pickup' },
  ];

  const handleBeneficiarySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchBeneficiaryQuery.trim()) return;

    const query = searchBeneficiaryQuery.trim().toLowerCase();
    const found = sampleBeneficiaryMasterlist.find(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.controlNo.toLowerCase().includes(query) ||
        query.includes(b.name.toLowerCase())
    );

    if (found) {
      setBeneficiarySearchResult({
        searched: true,
        found: true,
        name: found.name,
        barangay: found.barangay,
        controlNo: found.controlNo,
        status: found.status,
      });
    } else {
      setBeneficiarySearchResult({
        searched: true,
        found: false,
      });
    }
  };

  // Filter distribution hubs by selected barangay
  const filteredHubs = useMemo(() => {
    if (selectedBarangay === 'All') return activeHubs;
    return activeHubs.filter(
      (hub) => hub.barangay.toLowerCase() === selectedBarangay.toLowerCase()
    );
  }, [selectedBarangay]);

  // Filter barangays inside dropdown search
  const searchableBarangays = useMemo(() => {
    if (!barangaySearchFilter.trim()) return ALL_LINGAYEN_BARANGAYS;
    const q = barangaySearchFilter.toLowerCase().trim();
    return ALL_LINGAYEN_BARANGAYS.filter((b) => b.toLowerCase().includes(q));
  }, [barangaySearchFilter]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner matching Red, Maroon, Burgundy, Black Palette */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#7f1d1d] to-[#991B1B] border border-rose-900/40">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-rose-200 text-[10px] font-black tracking-widest uppercase border border-rose-500/20 backdrop-blur-xs">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />
            <span>Relief Assistance Information</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Relief Distribution
          </h1>

          <p className="text-rose-100/90 text-xs sm:text-sm font-medium leading-relaxed">
            Per-barangay relief schedules, eligibility, required documents, and the authorized-beneficiary list. Filter by your barangay.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-bold text-rose-100">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              🏛️ LGU Lingayen MSWDO
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              📦 DSWD Standard Family Food Packs
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              📍 32 Barangays Monitored
            </span>
          </div>
        </div>

        {/* Decorative Background Motif */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <Package className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* 2. Sleek Dropdown Filter (Automatic User Barangay + Option to View All or Per Barangay) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#991B1B]" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Barangay Relief Filter
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span>Account Home:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-[#991B1B] font-bold border border-rose-200">
              Brgy. {userBarangayName}
            </span>
          </div>
        </div>

        {/* Dropdown Selector Component */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsBarangayDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs font-bold text-slate-900 shadow-2xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#991B1B]"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2 h-2 rounded-full bg-[#991B1B] shrink-0" />
              <span className="truncate">
                {selectedBarangay === 'All'
                  ? 'All Lingayen Barangays (View All Active Distribution Hubs)'
                  : `Barangay ${selectedBarangay}`}
              </span>
              {selectedBarangay === userBarangayName && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-[#991B1B] shrink-0">
                  Your Barangay (Auto-detected)
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                isBarangayDropdownOpen ? 'rotate-180 text-[#991B1B]' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu Popover */}
          {isBarangayDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Search Inside Dropdown */}
              <div className="px-3 pb-2 pt-1 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={barangaySearchFilter}
                    onChange={(e) => setBarangaySearchFilter(e.target.value)}
                    placeholder="Search 32 Lingayen barangays..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#991B1B]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Barangay Options List */}
              <div className="max-h-60 overflow-y-auto py-1">
                {/* Option: View All */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBarangay('All');
                    setIsBarangayDropdownOpen(false);
                    setBarangaySearchFilter('');
                  }}
                  className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedBarangay === 'All'
                      ? 'bg-rose-50 text-[#991B1B] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🌐</span>
                    <span>All Lingayen Barangays (View All Active Schedules)</span>
                  </span>
                  {selectedBarangay === 'All' && <Check className="w-3.5 h-3.5 text-[#991B1B]" />}
                </button>

                {/* Option: Quick shortcut to user's registered barangay if not 'All' */}
                {userBarangayName && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBarangay(userBarangayName);
                      setIsBarangayDropdownOpen(false);
                      setBarangaySearchFilter('');
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer border-y border-slate-100 ${
                      selectedBarangay === userBarangayName
                        ? 'bg-rose-50 text-[#991B1B] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🏠</span>
                      <span>Barangay {userBarangayName}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-100 text-[#991B1B]">
                        Your Registered Barangay
                      </span>
                    </span>
                    {selectedBarangay === userBarangayName && (
                      <Check className="w-3.5 h-3.5 text-[#991B1B]" />
                    )}
                  </button>
                )}

                {/* List of 32 Barangays */}
                {searchableBarangays
                  .filter((b) => b !== 'All')
                  .map((bName) => {
                    const isCurrent = selectedBarangay.toLowerCase() === bName.toLowerCase();
                    const isUserHome = userBarangayName.toLowerCase() === bName.toLowerCase();
                    return (
                      <button
                        key={bName}
                        type="button"
                        onClick={() => {
                          setSelectedBarangay(bName);
                          setIsBarangayDropdownOpen(false);
                          setBarangaySearchFilter('');
                        }}
                        className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-rose-50 text-[#991B1B] font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>Barangay {bName}</span>
                          {isUserHome && (
                            <span className="text-[9px] font-bold text-[#991B1B] bg-rose-100 px-1.5 py-0.2 rounded-full">
                              Your Barangay
                            </span>
                          )}
                        </span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-[#991B1B]" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Relief Distribution Schedules (With Minimized Pane and View All Option, Matching Filter Feed) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Header matching Filter Feed layout */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#991B1B]" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Relief Distribution Schedules
              </h2>
              <p className="text-[11px] text-slate-500">
                {selectedBarangay === 'All'
                  ? `Showing all active municipal hubs (${filteredHubs.length} active)`
                  : `Filtered for Barangay ${selectedBarangay}`}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Minimize / Expand toggle + Square Red View All Button */}
          <div className="flex items-center gap-2.5">
            {/* Minimize / Expand Toggle Button */}
            <button
              onClick={() => setIsScheduleMinimized((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isScheduleMinimized ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expand List</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Minimize</span>
                </>
              )}
            </button>

            {/* Red Square Button with View All text below (Exact match to Filter Feed!) */}
            <div className="flex flex-col items-center shrink-0 ml-1">
              <button
                onClick={() => setIsViewAllModalOpen(true)}
                className="w-9 h-9 rounded-lg bg-[#991B1B] hover:bg-[#7f1d1d] text-white flex items-center justify-center transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                title="View All Relief Schedules"
                aria-label="View All Relief Schedules"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
              <span className="text-[10px] text-slate-500 font-semibold tracking-tight leading-none mt-1 select-none">
                View All
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Body: Normal or Minimized Scroll Pane (Matching Filter Feed scroll pane) */}
        {!isScheduleMinimized && (
          <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto">
            {filteredHubs.length === 0 ? (
              /* Empty State */
              <div className="p-8 sm:p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#991B1B] mx-auto flex items-center justify-center">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  No Active Distribution for {selectedBarangay}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Check another barangay or contact your barangay desk for pending schedule advisories.
                </p>
                <button
                  onClick={() => setSelectedBarangay('All')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  View All Active Distribution Hubs
                </button>
              </div>
            ) : (
              /* Active Distribution Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHubs.map((hub) => (
                  <div
                    key={hub.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-black uppercase text-[#991B1B] tracking-wider">
                            Brgy. {hub.barangay}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{hub.location}</h4>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                            hub.status === 'Distributing Now'
                              ? 'bg-[#991B1B] text-white shadow-xs'
                              : 'bg-slate-900 text-rose-200'
                          }`}
                        >
                          {hub.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{hub.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700">{hub.contactPerson}</span>
                        </div>
                      </div>

                      {/* Standard Relief Pack Inclusions */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#991B1B]" />
                          <span>Standard Relief Pack Inclusions:</span>
                        </p>
                        <ul className="text-[11px] text-slate-600 space-y-1">
                          {hub.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Free Government Aid</span>
                      <span className="font-bold text-[#991B1B] text-[11px]">
                        Authorized Beneficiaries: ~{hub.beneficiariesCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* When Minimized: Compact Banner with quick stats and expand button */}
        {isScheduleMinimized && (
          <div className="p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">
              Relief schedules minimized ({filteredHubs.length} distribution {filteredHubs.length === 1 ? 'hub' : 'hubs'} active for {selectedBarangay})
            </span>
            <button
              onClick={() => setIsScheduleMinimized(false)}
              className="text-[#991B1B] font-bold hover:underline cursor-pointer"
            >
              Expand to View Cards
            </button>
          </div>
        )}
      </div>

      {/* View All Relief Schedules Modal */}
      {isViewAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-rose-300" />
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    All Municipal Relief Distribution Schedules
                  </h3>
                  <p className="text-xs text-rose-200/80">
                    Comprehensive schedule overview across Lingayen barangays
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeHubs.map((hub) => (
                  <div
                    key={hub.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-black uppercase text-[#991B1B] tracking-wider">
                            Brgy. {hub.barangay}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{hub.location}</h4>
                        </div>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                            hub.status === 'Distributing Now'
                              ? 'bg-[#991B1B] text-white shadow-xs'
                              : 'bg-slate-900 text-rose-200'
                          }`}
                        >
                          {hub.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{hub.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700">{hub.contactPerson}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#991B1B]" />
                          <span>Standard Relief Pack Inclusions:</span>
                        </p>
                        <ul className="text-[11px] text-slate-600 space-y-1">
                          {hub.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Free Government Aid</span>
                      <span className="font-bold text-[#991B1B] text-[11px]">
                        Authorized Beneficiaries: ~{hub.beneficiariesCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Official Lingayen MSWDO & DSWD Relief Registry</span>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Structured Cards: Eligibility Criteria & Required Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Eligibility Criteria */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#991B1B] flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Eligibility & Allocation Criteria
              </h3>
              <p className="text-[11px] text-slate-500">Lingayen MSWDO Calamity Guidelines</p>
            </div>
          </div>

          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
              <span>
                <strong>1 Food Pack Per Household:</strong> Allocation is limited to one complete family ration per registered household per distribution cycle.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
              <span>
                <strong>Priority Express Counters:</strong> Senior citizens, PWDs, pregnant women, and solo parents receive dedicated express assistance.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
              <span>
                <strong>Vulnerable Sector Prioritization:</strong> Families in evacuated coastal and low-lying river areas receive primary deployment.
              </span>
            </li>
          </ul>
        </div>

        {/* Card B: Required Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Required Documents for Claiming
              </h3>
              <p className="text-[11px] text-slate-500">Bring any valid proof of residency</p>
            </div>
          </div>

          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong>Valid Government-Issued ID:</strong> PhilSys National ID, Voter’s ID, Driver’s License, Senior Citizen ID, or PWD ID.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong>Barangay Certificate / Calamity Slip:</strong> Proof of residency issued by your respective Lingayen Barangay Hall or BDRRMC.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong>Authorization Letter (If Claiming on Behalf):</strong> Signed letter + photocopy of beneficiary ID + claimant's valid ID.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 5. Authorized-Beneficiary Masterlist Checker Tool */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#991B1B]" />
              <span>Authorized-Beneficiary Masterlist Verification</span>
            </h3>
            <p className="text-xs text-slate-500">
              Search your family name or control number to verify claim authorization before proceeding to the hub.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-[#991B1B] border border-rose-200 self-start sm:self-auto">
            Official Municipal Database
          </span>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleBeneficiarySearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchBeneficiaryQuery}
              onChange={(e) => setSearchBeneficiaryQuery(e.target.value)}
              placeholder="Enter household name (e.g. Juan Dela Cruz) or Control No..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#991B1B] focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7f1d1d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            Check Masterlist
          </button>
        </form>

        {/* Search Result Feedback */}
        {beneficiarySearchResult && (
          <div className="pt-2 animate-in fade-in duration-150">
            {beneficiarySearchResult.found ? (
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#991B1B] font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Beneficiary Record Verified on Official Masterlist</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 font-semibold pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Beneficiary Name</span>
                    <span>{beneficiarySearchResult.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Registered Barangay</span>
                    <span>Brgy. {beneficiarySearchResult.barangay}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Control Number</span>
                    <span className="font-mono text-slate-900">{beneficiarySearchResult.controlNo}</span>
                  </div>
                </div>
                <div className="pt-1 text-[11px] text-[#991B1B] font-bold">
                  Status: {beneficiarySearchResult.status}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-800">No Record Found for "{searchBeneficiaryQuery}"</p>
                <p className="text-slate-500 text-[11px]">
                  If your household was recently affected or evacuated, please present your Barangay Residency Certificate at your local Barangay Relief Desk for on-site registration.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Notice Banner: Claiming on Behalf of a Named Beneficiary (Matching Screenshot Content) */}
      <div className="rounded-2xl border border-rose-900/30 bg-gradient-to-r from-slate-950 via-slate-900 to-[#7f1d1d] p-4 sm:p-5 text-white shadow-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-black text-rose-100">Notice for Authorized Representatives:</p>
          <p className="text-slate-300 leading-relaxed">
            If you are claiming on behalf of a named beneficiary, the distribution desk will check you against the authorized-names list. Search it from the verification tool above and ensure you have a signed authorization letter and proof of identification ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ResidentGuidesView: React.FC = () => {
  const [selectedHazard, setSelectedHazard] = useState<string>('Flood');
  const [selectedPhase, setSelectedPhase] = useState<'Before' | 'During' | 'After'>('Before');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isHazardDropdownOpen, setIsHazardDropdownOpen] = useState<boolean>(false);
  const [hazardSearchFilter, setHazardSearchFilter] = useState<string>('');
  const hazardDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hazardDropdownRef.current && !hazardDropdownRef.current.contains(event.target as Node)) {
        setIsHazardDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ALL_HAZARDS = [
    'Flood',
    'River Overflow',
    'Drainage Blockage',
    'Storm Surge',
    'Coastal Erosion',
    'Strong Wind / Typhoon Damage',
    'Fallen Tree',
    'Landslide / Soil Erosion',
    'Earthquake',
    'Road Damage',
    'Vehicular Accident',
    'Fire',
    'Electrical / Power Line Hazard',
    'General',
  ] as const;

  const filteredHazards = useMemo(() => {
    if (!hazardSearchFilter.trim()) return ALL_HAZARDS;
    const q = hazardSearchFilter.toLowerCase().trim();
    return ALL_HAZARDS.filter((h) => h.toLowerCase().includes(q));
  }, [hazardSearchFilter]);

  const goBagItems = [
    '3-day supply of drinking water (1 gallon per person per day)',
    'Non-perishable canned food & manual can opener',
    'First aid kit with prescription medications & antiseptic',
    'Flashlight with extra batteries & solar/crank radio',
    'Whistle to signal for help during rescue',
    'Waterproof pouch for birth certificates, IDs & land titles',
    'Cell phone with power bank and charging cables',
    'Multi-purpose pocket knife and emergency blanket',
  ];

  const toggleCheck = (idx: number) => {
    setCompletedItems((prev) => ({
      ...prev,
      [`bag-${idx}`]: !prev[`bag-${idx}`],
    }));
  };

  // Structured guides for Before, During, and After across Lingayen hazard profiles
  const guideData: Record<
    string,
    {
      Before: { priorities: string[]; doNots: string[]; contact: string };
      During: { priorities: string[]; doNots: string[]; contact: string };
      After: { priorities: string[]; doNots: string[]; contact: string };
    }
  > = {
    Flood: {
      Before: {
        priorities: [
          'Monitor PAGASA flood bulletins and Lingayen MDRRMC localized sirens.',
          'Elevate major electrical appliances, breaker switches, and food rations above flood line.',
          'Secure family emergency go-bag and move livestock/pets to designated evacuation staging grounds.',
          'Identify the quickest elevated route to your Barangay Evacuation Center.',
        ],
        doNots: [
          'Do not stack sandbags against fragile walls or glass doors.',
          'Do not leave low-lying drainage exits clogged with household debris.',
        ],
        contact: 'Lingayen MDRRMO Operations: (075) 633-5702',
      },
      During: {
        priorities: [
          'Switch off main electrical breaker and gas tanks before floodwaters enter.',
          'Evacuate immediately if water enters residential grounds or BDRRMC issues Signal 2/3 preemptive orders.',
          'Stay on higher floors or sturdy structural centers if trapped by sudden rising surges.',
          'Wave brightly colored cloth or blow whistle to guide LDRRMO rubber boat rescuers.',
        ],
        doNots: [
          'Never attempt to walk, swim, or drive through flowing floodwaters (6 inches of moving water can knock you down).',
          'Never touch submerged electrical appliances or downed wire poles.',
        ],
        contact: 'Emergency Dispatch & Water Rescue: 911 / (075) 633-5702',
      },
      After: {
        priorities: [
          'Return home only when local authorities officially issue the "All Clear" advisory.',
          'Boil drinking water for at least 3 to 5 minutes before consumption to prevent leptospirosis and cholera.',
          'Photograph structural flood damage for LGU disaster compensation and insurance verification.',
          'Wear rubber boots and thick gloves when shoveling mud and debris.',
        ],
        doNots: [
          'Do not turn electrical mains back on until inspected by a licensed electrician or PANELCO technician.',
          'Do not consume food that came into contact with contaminated floodwaters.',
        ],
        contact: 'Lingayen Rural Health Unit (RHU): (075) 542-8111',
      },
    },
    'River Overflow': {
      Before: {
        priorities: [
          'Track Agno River water level marker boards at Poblacion, Pangapisan, and Baay bridges.',
          'Anchor riverbank small-craft bangkas securely away from main river channels.',
          'Pack vital family documents in waterproof dry-pouches.',
        ],
        doNots: [
          'Do not build temporary dwellings on Agno riverbank easements.',
          'Do not ignore municipal early siren signals (Orange / Red alert).',
        ],
        contact: 'Agno River Basin Flood Watch: (075) 633-5702',
      },
      During: {
        priorities: [
          'Move away from riverbank embankments; rushing currents cause sudden soil scouring.',
          'Proceed immediately inland to your designated multi-purpose covered gymnasium.',
          'Report uncontained dike breaches to the LDRRMO dispatch desk.',
        ],
        doNots: ['Never stand on bridges or riverbanks to watch overflowing currents.'],
        contact: 'MDRRMC River Rescue Unit: 911',
      },
      After: {
        priorities: [
          'Check riverbank foundations for erosion and sinkholes before re-entering houses.',
          'Cooperate with MSWDO relief distribution teams at your evacuation hub.',
        ],
        doNots: ['Do not swim or wash clothes in river floodwaters contaminated with silt and agricultural runoff.'],
        contact: 'LGU Municipal Engineer: (075) 632-4337',
      },
    },
    'Storm Surge': {
      Before: {
        priorities: [
          'Observe PAGASA storm surge alerts for coastal barangays (Libsong, Maniboc, Pangapisan North, Sabangan).',
          'Move small boats and fish farm cages at Lingayen beachfront inland.',
          'Evacuate at least 500 meters inland or to designated multi-story evacuation shelters.',
        ],
        doNots: ['Do not remain at shoreline cottages or beach resorts during gale warnings.'],
        contact: 'Philippine Coast Guard Lingayen: (075) 542-2311',
      },
      During: {
        priorities: [
          'Seek shelter on the second floor or higher in reinforced concrete structures.',
          'Fasten all doors, windows, and storm shutters.',
        ],
        doNots: ['Never go to the shoreline or breakwaters to witness storm surge waves.'],
        contact: 'PCG / MDRRMO Maritime Rescue: 911',
      },
      After: {
        priorities: [
          'Beware of receding water hazards, debris, sharp shells, and undermined seawalls.',
          'Report missing community members immediately to BDRRMC desks.',
        ],
        doNots: ['Do not enter ocean waters until the storm surge warning is officially canceled.'],
        contact: 'Lingayen Police Station: (075) 542-7100',
      },
    },
    'Electrical / Power Line Hazard': {
      Before: {
        priorities: [
          'Trim tree branches growing within 3 meters of overhead power cables.',
          'Inspect household breaker panels for burnt fuses and grounded connections.',
        ],
        doNots: ['Do not attempt DIY trimming of branches touching high-voltage electrical lines.'],
        contact: 'PANELCO I Customer Service: (075) 632-1544',
      },
      During: {
        priorities: [
          'Maintain a minimum distance of at least 10 meters (33 feet) from any fallen or sparking wire.',
          'Alert neighbors and place warning markers or chairs around fallen lines until linemen arrive.',
          'If a powerline drops on your vehicle, remain inside and call emergency dispatch.',
        ],
        doNots: [
          'Never touch puddles of water touching or adjacent to a downed wire.',
          'Never use conductive metal or damp wood to move fallen cables.',
        ],
        contact: 'PANELCO I Emergency Linemen: (075) 632-1544 / 911',
      },
      After: {
        priorities: [
          'Wait for PANELCO I official restoration clearance before switching on major appliances.',
          'Have flood-soaked meters and circuit breakers inspected by certified technicians.',
        ],
        doNots: ['Do not plug in appliances that were exposed to floodwaters or heavy rainwater.'],
        contact: 'BFP Lingayen Fire Prevention Desk: (075) 542-7080',
      },
    },
    Fire: {
      Before: {
        priorities: [
          'Inspect kitchen LPG gas hoses for leaks using soapy water bubbles.',
          'Equip your home with at least one ABC dry-chemical fire extinguisher and smoke alarms.',
          'Practice primary and secondary home escape routes with all family members.',
        ],
        doNots: ['Do not octopus-plug heavy appliances into a single electrical extension outlet.'],
        contact: 'BFP Lingayen Fire Station: (075) 542-7080',
      },
      During: {
        priorities: [
          'Remember PASS: Pull the pin, Aim at base of fire, Squeeze handle, Sweep side to side.',
          'Crawl low under smoke toward exits; cleaner air remains near the floor.',
          'Feel doors with the back of your hand before opening; if hot, use secondary escape window.',
          'Shout "SUNOG!" to alert neighbors and activate BFP dispatch immediately.',
        ],
        doNots: [
          'Never throw water on kitchen grease cooking oil or electrical circuit fires.',
          'Never re-enter a burning building to retrieve belongings once you have exited.',
        ],
        contact: 'BFP Lingayen Hotline: (075) 542-7080 / 911',
      },
      After: {
        priorities: [
          'Seek medical attention for smoke inhalation and burn injuries at Lingayen District Hospital.',
          'Cooperate with Bureau of Fire Protection arson investigators on site.',
        ],
        doNots: ['Do not re-enter burned homes until certified structurally sound by municipal building officials.'],
        contact: 'Lingayen District Hospital: (075) 542-7170',
      },
    },
  };

  // Fallback for hazards with baseline NDRRMC guidelines
  const activeGuide = guideData[selectedHazard] || {
    Before: {
      priorities: [
        `Assess household vulnerability to ${selectedHazard.toLowerCase()} in your barangay zone.`,
        'Keep emergency battery radio and portable power bank fully charged.',
        'Review the location of your nearest designated barangay evacuation center.',
      ],
      doNots: [
        'Do not propagate unverified rumors or social media panic.',
        'Do not wait until the last minute before executing precautionary family safety measures.',
      ],
      contact: 'Lingayen MDRRMO Dispatch: (075) 633-5702',
    },
    During: {
      priorities: [
        'Remain calm and stay tuned to official LGU Lingayen and MDRRMC radio advisories.',
        'Prioritize personal safety and protective shelter over material possessions.',
        'Contact emergency dispatch immediately if rescue or medical aid is required.',
      ],
      doNots: [
        'Do not venture outdoors into hazardous sectors without protective equipment.',
        'Do not block municipal roads needed by responding rescue vehicles.',
      ],
      contact: 'National Emergency Dispatch: 911',
    },
    After: {
      priorities: [
        'Perform a visual safety inspection of your residence before resuming normal activities.',
        'Report hazardous road blockages, snapped wires, or structural fractures to your Barangay Captain.',
        'Assist injured or vulnerable neighbors (elderly, children, PWDs).',
      ],
      doNots: ['Do not tamper with damaged municipal infrastructure or utility poles.'],
      contact: 'Mayor\'s Office Public Assistance Desk: (075) 632-4337',
    },
  };

  const currentPhaseData = activeGuide[selectedPhase];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner matching Red, Maroon, Black Palette */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#7f1d1d] to-[#991B1B] border border-rose-900/40">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-rose-200 text-[10px] font-black tracking-widest uppercase border border-rose-500/20 backdrop-blur-xs">
            <BookOpen className="w-3.5 h-3.5 text-rose-300" />
            <span>Disaster Preparedness</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Disaster Preparedness Guides
          </h1>

          <p className="text-rose-100/90 text-xs sm:text-sm font-medium leading-relaxed">
            Step-by-step guidance for the hazards that affect Lingayen, Pangasinan. Pick a hazard, then read the Before / During / After tab.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-bold text-rose-100">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              🛡️ 14 Hazard Types Covered
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              ⏱️ 3 Operational Lifecycle Phases
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              📍 Lingayen Localized Protocols
            </span>
          </div>
        </div>

        {/* Decorative Background Motif */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* 2. Hazard Selector Category Pills (All 14 Hazards from Initial Draft) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Preparedness Guides</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            Active Hazard: <strong className="text-[#991B1B]">{selectedHazard}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Pick a hazard, then read the Before / During / After tab.
        </p>

        {/* Dropdown Selector Component for Picking a Hazard */}
        <div ref={hazardDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsHazardDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs font-bold text-slate-900 shadow-2xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#991B1B]"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2 h-2 rounded-full bg-[#991B1B] shrink-0" />
              <span className="truncate">{selectedHazard}</span>
              <span className="text-[10px] font-semibold text-slate-400">
                (Click to switch hazard)
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                isHazardDropdownOpen ? 'rotate-180 text-[#991B1B]' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu Popover */}
          {isHazardDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Search Inside Dropdown */}
              <div className="px-3 pb-2 pt-1 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={hazardSearchFilter}
                    onChange={(e) => setHazardSearchFilter(e.target.value)}
                    placeholder="Search hazard type..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#991B1B]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Hazards Options List */}
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredHazards.map((hName) => {
                  const isCurrent = selectedHazard === hName;
                  return (
                    <button
                      key={hName}
                      type="button"
                      onClick={() => {
                        setSelectedHazard(hName);
                        setIsHazardDropdownOpen(false);
                        setHazardSearchFilter('');
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-rose-50 text-[#991B1B] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>{hName}</span>
                      </span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#991B1B]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Three Phase Selection Tabs (Before / During / After) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {(['Before', 'During', 'After'] as const).map((phase) => {
            const isPhaseActive = selectedPhase === phase;
            return (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center cursor-pointer active:scale-98 ${
                  isPhaseActive
                    ? 'bg-[#991B1B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{phase}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Actionable Guide Display Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-[#991B1B] text-white">
                {selectedPhase} Action Protocol
              </span>
              <span className="text-xs font-bold text-slate-500">• {selectedHazard}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              Standard {selectedPhase} Procedures: {selectedHazard}
            </h3>
          </div>

          <div className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-fit">
            📞 {currentPhaseData.contact}
          </div>
        </div>

        {/* Priority Steps */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#991B1B]" />
            <span>Essential Action Checklist ({selectedPhase})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentPhaseData.priorities.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-md bg-[#991B1B] text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Do NOTs */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#991B1B] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#991B1B]" />
            <span>Critical Precautions (What NOT to Do)</span>
          </h4>
          <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc font-medium">
            {currentPhaseData.doNots.map((warn, idx) => (
              <li key={idx} className="leading-relaxed">
                {warn}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Interactive 72-Hour Emergency Go-Bag Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#991B1B]" />
              <span>Interactive 72-Hour Emergency Go-Bag Checklist</span>
            </h3>
            <p className="text-xs text-slate-500">
              Prepare this bag ahead of storm warnings and keep it by your front door.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
            {Object.values(completedItems).filter(Boolean).length} / {goBagItems.length} Packed
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {goBagItems.map((item, idx) => {
            const isChecked = !!completedItems[`bag-${idx}`];
            return (
              <label
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-3 cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-rose-50/60 border-rose-200 text-slate-800'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                    isChecked
                      ? 'bg-[#991B1B] border-[#991B1B] text-white'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className={isChecked ? 'line-through text-slate-500' : ''}>{item}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ResidentFaqsView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const faqs = [
    {
      id: 'faq-1',
      category: 'Disaster Alerts',
      question: 'How does the community hazard corroboration system work?',
      answer:
        'When a citizen reports an incident (such as flooding, storm surge, or a downed powerline), it enters the queue as "Unverified". Other residents within the area can tap "I Can Confirm This". Once 3 unique citizens corroborate the observation, the report is auto-verified and prioritized for emergency response dispatch.',
    },
    {
      id: 'faq-2',
      category: 'Relief & Shelters',
      question: 'Where is the nearest evacuation center to my home in Lingayen?',
      answer:
        'Lingayen maintains 18 designated barangay evacuation facilities including the Lingayen Municipal Civic Center, Libsong Elementary School, and Maniboc Covered Court. You can view real-time capacity and occupancy under the "Shelters" tab in your navigation menu.',
    },
    {
      id: 'faq-3',
      category: 'Offline & Sync',
      question: 'What should I do if cell networks and internet are completely down?',
      answer:
        'UniGuard functions offline as a Progressive Web App (PWA). You can still draft and submit hazard reports, view cached emergency hotlines, and consult preparedness guides. Once cellular data or municipal Wi-Fi reconnects, your queued reports automatically synchronize with the central LDRRMC dispatch desk.',
    },
    {
      id: 'faq-4',
      category: 'Emergency Hotlines',
      question: 'How can our family request urgent medical or rescue assistance?',
      answer:
        'Call the Lingayen MDRRMO Dispatch Desk immediately at (075) 633-5702 or the National Emergency Hotline 911. For fires, contact BFP Lingayen at (075) 542-7080. Emergency medical teams and rescue boats are stationed 24/7 at the Lingayen Municipal Operations Center.',
    },
    {
      id: 'faq-5',
      category: 'Disaster Alerts',
      question: 'What do PAGASA Tropical Cyclone Wind Signals (TCWS) mean for Lingayen?',
      answer:
        'Signal #1: Winds of 39-61 km/h expected within 36 hours. Signal #2: Winds of 62-88 km/h within 24 hours (sea travel and coastal fishing suspended). Signal #3: Storm conditions within 18 hours (mandatory preemptive evacuation of low-lying coastal and Agno riverbank barangays).',
    },
    {
      id: 'faq-6',
      category: 'Relief & Shelters',
      question: 'Are relief goods and evacuation shelters free of charge?',
      answer:
        'Yes. All emergency food packs, potable drinking water, medical aid, and evacuation shelter accommodations provided by the Local Government Unit of Lingayen and DSWD are 100% free of charge to all affected residents.',
    },
    {
      id: 'faq-7',
      category: 'Relief & Shelters',
      question: 'What documents are required when claiming family food packs?',
      answer:
        'Bring any valid government-issued ID (PhilSys National ID, Voter’s ID, Senior/PWD ID) or a Barangay Certificate of Residency. If claiming on behalf of a named beneficiary, bring an authorization letter and a photocopy of the beneficiary’s ID.',
    },
  ];

  const categories = ['All', 'Disaster Alerts', 'Relief & Shelters', 'Offline & Sync', 'Emergency Hotlines'];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesQuery;
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner matching Red, Maroon, Black Palette */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#7f1d1d] to-[#991B1B] border border-rose-900/40">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-rose-200 text-[10px] font-black tracking-widest uppercase border border-rose-500/20 backdrop-blur-xs">
            <HelpCircle className="w-3.5 h-3.5 text-rose-300" />
            <span>Frequently Asked Questions</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Help Center
          </h1>

          <p className="text-rose-100/90 text-xs sm:text-sm font-medium leading-relaxed">
            Frequently asked questions answered by the LGU. Clear guidance on emergency alerts, relief distribution, and resident services in Lingayen, Pangasinan.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-bold text-rose-100">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              🏛️ Official LGU Lingayen Help Desk
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              💡 {faqs.length} Verified Answers
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
              📞 24/7 Operations Support
            </span>
          </div>
        </div>

        {/* Decorative Background Motif */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <HelpCircle className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Help Center Search</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'article available' : 'articles available'}
          </span>
        </div>

        {/* Search Input Box (Matching Initial Draft "Search FAQs...") */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#991B1B] focus:border-transparent bg-slate-50"
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

        {/* Quick Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? 'bg-[#991B1B] hover:bg-[#7f1d1d] text-white shadow-xs border border-transparent'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FAQ Accordion List or Clean Empty State (Matching Screenshot) */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          /* Empty State matching initial draft: "No FAQs yet / The LGU has not published any FAQs." */
          <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-14 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-[#991B1B] mx-auto flex items-center justify-center">
              <HelpCircle className="w-7 h-7" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900">
              No FAQs yet
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `No FAQs found matching "${searchQuery}". Try a different keyword or contact the LGU desk.`
                : 'The LGU has not published any FAQs in this category.'}
            </p>

            {(searchQuery || selectedCategory !== 'All') && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Accordion Articles */
          filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all hover:border-slate-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#991B1B] border border-rose-100 flex items-center justify-center shrink-0 font-black text-xs">
                      Q{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B] block">
                        {faq.category}
                      </span>
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {faq.question}
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#991B1B] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    <p className="pl-10 text-slate-700 font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Bottom Support Contact Card */}
      <div className="rounded-2xl border border-rose-900/30 bg-gradient-to-r from-slate-950 via-slate-900 to-[#7f1d1d] p-4 sm:p-5 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-black text-rose-100 text-xs sm:text-sm">
            Still have questions or need immediate assistance?
          </p>
          <p className="text-slate-300 text-xs">
            The Lingayen MDRRMO emergency hotline desk is open 24/7 for resident inquiries.
          </p>
        </div>

        <a
          href="tel:0756335702"
          className="px-4 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7f1d1d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 text-center"
        >
          Call MDRRMO (075) 633-5702
        </a>
      </div>
    </div>
  );
};
