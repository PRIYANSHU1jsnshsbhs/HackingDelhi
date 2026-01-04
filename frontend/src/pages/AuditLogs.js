import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Clock, User, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/audit/logs`, {
          withCredentials: true
        });
        setLogs(response.data);
      } catch (error) {
        toast.error('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--saffron))]"></div>
      </div>
    );
  }

  return (
    <div data-testid="audit-logs" className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-base mt-1 text-gray-600">Complete tracking of all system actions</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Badge variant="outline" className="text-xs">
            {logs.length} entries
          </Badge>
        </div>

        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={log.audit_id || index}
              data-testid={`audit-log-${index}`}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">{log.action}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(log.timestamp)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{log.user_name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {log.user_id}
                  </Badge>
                </div>
              </div>

              {log.details && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Details:</p>
                  <pre className="text-xs text-gray-700 mt-1 bg-white p-2 rounded">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs available</p>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> All actions performed in this system are logged for compliance and security audit purposes.
          Logs are immutable and tamper-proof.
        </p>
      </Card>
    </div>
  );
}

export default AuditLogs;