import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface AuditLog {
  id: string;
  table_name: string;
  action: string;
  record_id: string;
  old_data?: any;
  new_data?: any;
  created_at: string;
}

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatData = (data: any) => {
    if (!data) return null;
    return Object.entries(data)
      .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  if (loading) {
    return <div>Loading audit logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="border-l-2 border-gray-200 pl-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                  <span className="text-sm font-medium">{log.table_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
                {log.action === 'UPDATE' && log.old_data && log.new_data && (
                  <div className="text-xs text-muted-foreground">
                    <div>Before: {formatData(log.old_data)}</div>
                    <div>After: {formatData(log.new_data)}</div>
                  </div>
                )}
                {log.action === 'INSERT' && log.new_data && (
                  <div className="text-xs text-muted-foreground">
                    Added: {formatData(log.new_data)}
                  </div>
                )}
                {log.action === 'DELETE' && log.old_data && (
                  <div className="text-xs text-muted-foreground">
                    Deleted: {formatData(log.old_data)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};