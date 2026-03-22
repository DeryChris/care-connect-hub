// src/components/layout/TopBar.tsx
// Includes a live notification bell with dropdown panel.

import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, Bell, Clock, Sun, Moon, MessageSquare, CheckCheck, Trash2, X, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalSearch from '@/components/GlobalSearch';
import { useEffect, useRef, useState } from 'react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from '@/hooks';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/services';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/users/create': 'Add User',
  '/departments': 'Departments',
  '/tasks': 'Task Management',
  '/tasks/create': 'Add Task',
  '/inventory': 'Inventory',
  '/inventory/create': 'Add Item',
  '/patients': 'Patients',
  '/patients/create': 'Add Patient',
  '/appointments': 'Appointments',
  '/appointments/create': 'New Appointment',
  '/laboratory': 'Laboratory',
  '/pharmacy': 'Pharmacy',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/opd': 'OPD',
  '/ipd': 'IPD',
  '/radiology': 'Radiology',
  '/billing': 'Billing',
  '/knowledge': 'Knowledge Base',
  '/wiki': 'Internal Wiki',
  '/documents': 'Document Management',
  '/kms-review': 'KMS Review',
};

// Relative time
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Icon by notification type
function NotifIcon({ type }: { type: NotificationItem['type'] }) {
  if (type === 'comment') return <MessageSquare className="h-4 w-4 text-primary" />;
  if (type === 'reply')   return <MessageSquare className="h-4 w-4 text-blue-500" />;
  return <Info className="h-4 w-4 text-amber-500" />;
}

// ── Notification panel ────────────────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { data } = useNotifications();
  const notifications = (data?.data ?? []) as NotificationItem[];
  const unread = notifications.filter(n => !n.is_read);

  const markRead    = useMarkNotificationRead();
  const markAll     = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const handleClick = (n: NotificationItem) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.link) { navigate(n.link); onClose(); }
  };

  return (
    <div
      className="
        absolute right-0 top-full mt-2 z-50
        w-[360px] max-w-[calc(100vw-2rem)]
        bg-card border border-border/60 rounded-2xl shadow-2xl
        flex flex-col overflow-hidden
      "
      style={{ animation: 'overlayIn 0.15s cubic-bezier(0.16,1,0.3,1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Notifications</span>
          {unread.length > 0 && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground">
              {unread.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread.length > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-muted"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="max-h-[420px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-20" />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {notifications.map(n => (
              <div
                key={n.id}
                className={cn(
                  'flex gap-3 px-4 py-3 cursor-pointer transition-colors group',
                  n.is_read ? 'hover:bg-muted/40' : 'bg-primary/5 hover:bg-primary/10',
                )}
                onClick={() => handleClick(n)}
              >
                {/* Icon */}
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  n.is_read ? 'bg-muted' : 'bg-primary/10',
                )}>
                  <NotifIcon type={n.type} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className={cn('text-sm leading-snug', !n.is_read && 'font-semibold text-foreground')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground">{relativeTime(n.created_at)}</p>
                </div>

                {/* Delete */}
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all shrink-0 self-start mt-0.5"
                  onClick={e => { e.stopPropagation(); deleteNotif.mutate(n.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ── TopBar ─────────────────────────────────────────────────────────────────────
export function TopBar() {
  const { user, logout }             = useAuth();
  const { settings, updateSettings } = useSettings();
  const location                     = useLocation();
  const [time, setTime]              = useState(new Date());
  const [notifOpen, setNotifOpen]    = useState(false);
  const notifRef                     = useRef<HTMLDivElement>(null);

  const { data: notifData } = useNotifications();
  const notifications = (notifData?.data ?? []) as NotificationItem[];
  const unreadCount   = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  const pageTitle = routeTitles[location.pathname] ||
    (location.pathname.includes('/edit') ? 'Edit' : 'HMIS');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 sm:gap-4 border-b border-border bg-card px-3 sm:px-4 shadow-sm">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />

      <div className="flex-1 flex items-center gap-3 min-w-0">
        <h2 className="font-display text-base sm:text-lg font-semibold text-foreground truncate">{pageTitle}</h2>
        <div className="hidden sm:block flex-1">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Time — desktop only */}
        <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Dark/light toggle */}
        <Button
          variant="ghost" size="icon"
          onClick={() => updateSettings('darkMode', !settings.darkMode)}
          className="text-muted-foreground hover:text-foreground"
          title={settings.darkMode ? 'Light mode' : 'Dark mode'}
        >
          {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
              notifOpen
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            onClick={() => setNotifOpen(v => !v)}
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        {/* User avatar + name — desktop */}
        <div className="hidden md:flex items-center gap-2 pl-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost" size="icon"
          onClick={logout}
          className="text-muted-foreground hover:text-red-600"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.97) translateY(-4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </header>
  );
}