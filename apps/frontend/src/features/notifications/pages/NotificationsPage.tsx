import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { fetchNotifications } from '@/services/mockApi';

export function NotificationsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });

  return (
    <div className="space-y-6">
      <Panel title="Notifications" subtitle="Connected alerts, acknowledgement status and follow-up actions">
        <div className="space-y-4">
          {isLoading
            ? <p className="text-slate-400">Loading notifications…</p>
            : data?.map((notification) => (
                <div key={notification.id} className="rounded-3xl border border-white/10 bg-maintix-surfaceLight p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{notification.message}</p>
                      <p className="text-sm text-slate-500">{notification.category} • {notification.time}</p>
                    </div>
                    <Badge variant={notification.status === 'Unread' ? 'warning' : 'success'}>{notification.status}</Badge>
                  </div>
                </div>
              ))}
        </div>
      </Panel>
    </div>
  );
}
