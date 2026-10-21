import React, { useState } from 'react';
import {
  Bell,
  RefreshCw,
  CheckCircle2,
  Crown,
  UserX,
  Users,
  AlertTriangle,
  Receipt,
  Info,
  Clock,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';

export default function NotificationsView() {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    setActiveMenu,
    setCustomerViewTab
  } = useSaloon();

  // Active filter tab: 'all' | 'unread' | 'membership' | 'inactive' | 'billing' | 'system'
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshNotifications();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Filter notifications according to selected tab
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !item.isRead;
    if (activeTab === 'membership') return item.category === 'membership';
    if (activeTab === 'inactive') return item.category === 'inactive';
    if (activeTab === 'billing') return item.category === 'billing';
    if (activeTab === 'system') return item.category === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCategoryIcon = (category, type) => {
    switch (category) {
      case 'membership':
        return <Crown size={18} className="text-[#C59B27]" />;
      case 'inactive':
        return <UserX size={18} className="text-[#3B82F6]" />;
      case 'billing':
        return <Receipt size={18} className="text-[#10B981]" />;
      case 'system':
        return type === 'danger'
          ? <AlertTriangle size={18} className="text-[#EF4444]" />
          : <Info size={18} className="text-[#8B5CF6]" />;
      default:
        return <Bell size={18} className="text-[#C59B27]" />;
    }
  };

  const getCategoryBadgeClass = (category, type) => {
    switch (category) {
      case 'membership':
        return 'bg-[#FAF6EA] text-[#B58D20] border-[#D4AF37]/30';
      case 'inactive':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]/30';
      case 'billing':
        return 'bg-[#ECFDF5] text-[#059669] border-[#6EE7B7]/30';
      case 'system':
        return type === 'danger'
          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]/30'
          : 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]/30';
      default:
        return 'bg-[#FAF8F2] text-[#646875] border-[#E0DCCE]';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'membership': return 'Membership Expiry';
      case 'inactive': return 'Inactive Customer';
      case 'billing': return 'Billing Alert';
      case 'system': return 'System Activity';
      default: return 'Salon Alert';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Card matching user reference */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF6EA] border border-[#D4AF37]/30 text-[#C59B27] flex items-center justify-center shadow-2xs shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
              Notification Center
            </h2>
            <p className="text-xs sm:text-sm text-[#646875] mt-1">
              Automated alerts for membership expiries, inactive customers & salon activity
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#18191B] bg-[#FAF8F2] hover:bg-[#F2EDE0] border border-[#E0DCCE] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Check size={14} className="text-[#10B981]" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#646875] hover:text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FCA5A5]/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Clear all</span>
            </button>
          )}

          <button
            id="btn-refresh-notifications"
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E0DCCE] bg-white text-xs font-bold text-[#18191B] hover:bg-[#FAF8F2] hover:border-[#D4AF37] transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw size={14} className={`text-[#646875] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Navigation */}
      <div className="bg-white px-4 sm:px-6 py-2 rounded-2xl border border-[#EFECE1] shadow-sm overflow-x-auto">
        <div className="flex items-center gap-6 min-w-max border-b border-transparent">
          {[
            { id: 'all', label: 'All Notifications', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'membership', label: 'Membership Expiry' },
            { id: 'inactive', label: 'Inactive Customers' },
            { id: 'billing', label: 'Billing' },
            { id: 'system', label: 'System' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-notif-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'text-[#18191B] font-extrabold'
                    : 'text-[#646875] hover:text-[#18191B]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive
                        ? 'bg-[#18191B] text-[#D4AF37]'
                        : 'bg-[#F2EDE0] text-[#646875]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B58D20] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden min-h-[380px] p-6 flex flex-col">
        {filteredNotifications.length === 0 ? (
          /* Empty State matching reference screenshot */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#10B981]/25 flex items-center justify-center text-[#10B981] mb-4 shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
              No Notifications Found
            </h3>
            <p className="text-xs text-[#646875] mt-1.5 max-w-md">
              You're all caught up! There are no active alerts for this view.
            </p>
          </div>
        ) : (
          /* List of Notification Cards */
          <div className="space-y-3 animate-fade-in">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.isRead;
              return (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    isUnread
                      ? 'bg-[#FCFBF8] border-[#E8DFC8] shadow-xs hover:border-[#D4AF37]'
                      : 'bg-white border-[#EFECE1] opacity-85 hover:opacity-100 hover:border-[#E0DCCE]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Category Icon Container */}
                    <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(notif.category, notif.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Category Tag */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(notif.category, notif.type)}`}>
                          {getCategoryLabel(notif.category)}
                        </span>

                        {isUnread && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                            New
                          </span>
                        )}

                        <span className="text-[11px] text-[#9499A8] flex items-center gap-1 font-mono">
                          <Clock size={11} /> {notif.time}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-[#18191B]">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-[#646875] leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Options */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    {notif.actionTarget && (
                      <button
                        onClick={() => {
                          if (notif.category === 'inactive' && setCustomerViewTab) {
                            setCustomerViewTab('inactive');
                          }
                          setActiveMenu(notif.actionTarget);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#18191B] text-white hover:bg-[#383F4C] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>{notif.actionLabel || 'View'}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    {isUnread && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="p-2 rounded-xl text-[#646875] hover:text-[#10B981] hover:bg-[#ECFDF5] transition-all cursor-pointer"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2 rounded-xl text-[#9499A8] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
