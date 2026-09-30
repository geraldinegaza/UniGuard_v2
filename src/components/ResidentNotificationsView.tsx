import React, { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface ResidentNotificationsViewProps {
  onNavigateTab?: (tab: string) => void;
}

const STORAGE_KEY_READ_NOTIFS = 'uniguard_resident_read_notifs_v1';

export const ResidentNotificationsView: React.FC<ResidentNotificationsViewProps> = () => {
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    try {
      const isRead = localStorage.getItem(STORAGE_KEY_READ_NOTIFS);
      return isRead === 'true' ? 0 : 0; // Default matches initial draft (0)
    } catch {
      return 0;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    try {
      localStorage.setItem(STORAGE_KEY_READ_NOTIFS, 'true');
    } catch {
      // ignore
    }
    setToastMessage('All notifications marked as read.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Corner / Header of the Screen (Matching Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Push Notifications delivered to this device, including alerts received while the app was closed.
          </p>
        </div>

        {/* Top-Right Corner Action Button (Matching Screenshot) */}
        <button
          onClick={handleMarkAllRead}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7f1d1d] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* 2. Delivery Card (Matching Screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
          Delivery
        </h2>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3 flex items-center justify-between">
            <span className="font-medium text-slate-600">Unread</span>
            <span className="font-mono font-bold text-sm text-[#991B1B]">
              {unreadCount}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="font-medium text-slate-600">Delivered today</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              5
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="font-medium text-slate-600">Delivery channel</span>
            <span className="font-mono font-bold text-xs sm:text-sm text-[#991B1B]">
              Push + offline inbox
            </span>
          </div>
        </div>
      </div>

      {/* 3. Delivery Channel Notice Callout (Matching Screenshot) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium shadow-2xs">
        Alerts are delivered even when the app is closed, and are queued for the offline inbox when there is no signal.
      </div>

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-rose-900/40 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCheck className="w-4 h-4 text-rose-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
