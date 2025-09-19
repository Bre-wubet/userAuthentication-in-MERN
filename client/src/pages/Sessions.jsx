import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, MonitorPause, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Sessions() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery('sessions', () => userAPI.getUserSessions());

  const revokeMutation = useMutation((id) => userAPI.revokeSession(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('sessions');
      toast.success('Session revoked');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to revoke session'),
  });

  const sessions = data?.data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-gray-500">Loading sessions...</div>
            ) : error ? (
              <div className="text-red-600">{error?.response?.data?.message || 'Failed to load sessions'}</div>
            ) : sessions.length === 0 ? (
              <div className="text-gray-500 flex items-center"><MonitorPause className="h-4 w-4 mr-2" />No active sessions</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {sessions.map((s) => (
                  <li key={s.id} className="py-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{s.device || 'Unknown device'} • {s.ip || 'IP unknown'}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />Last active {new Date(s.updatedAt || s.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => revokeMutation.mutate(s.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


