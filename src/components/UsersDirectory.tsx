import React, { useState } from 'react';
import { User, UserRole, Barangay } from '../types';
import { storage } from '../services/storage';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  Building,
  CheckCircle2,
  Calendar,
  Mail,
  UserPlus
} from 'lucide-react';

interface UsersDirectoryProps {
  currentUser: User;
  barangays: Barangay[];
}

export const UsersDirectory: React.FC<UsersDirectoryProps> = ({ currentUser, barangays }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const users = storage.getUsers();

  const getBarangayName = (id?: string) => {
    if (!id) return 'Municipal Headquarters';
    const b = barangays.find((item) => item.id === id);
    return b ? `Brgy. ${b.name}` : `Brgy. ${id}`;
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'lgu_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
            <Shield className="w-3 h-3 text-rose-700" />
            LGU / LDRRMC
          </span>
        );
      case 'barangay':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Building className="w-3 h-3 text-blue-700" />
            BDRRMC Official
          </span>
        );
      case 'citizen':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-700" />
            Citizen Watcher
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
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>UniGuard Users & Personnel Directory</span>
              <span className="text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                {users.length} Registered
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Command console access control, incident verification agents, and citizen responders across Lingayen.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">
              {users.filter((u) => u.role === 'citizen').length} Citizens
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-semibold text-slate-700">
              {users.filter((u) => u.role === 'barangay').length} Barangay
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-700">
              {users.filter((u) => u.role === 'lgu_admin').length} LGU Admin
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="lgu_admin">LGU / LDRRMC</option>
            <option value="barangay">Barangay Officials</option>
            <option value="citizen">Citizens</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black text-sm flex items-center justify-center shadow-inner shrink-0 border border-slate-700">
                  {user.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{user.full_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Role:</span>
                {getRoleBadge(user.role)}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Jurisdiction:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                  {getBarangayName(user.barangay_id)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
