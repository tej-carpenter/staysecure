import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/audit-logs');
        setLogs(response.data.logs || []);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div className="p-6">Loading audit logs...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Audit Logs
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg">
          <thead>
            <tr>
              <th className="p-3 text-left">Timestamp</th>
              <th className="p-3 text-left">Actor</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Resource</th>
              <th className="p-3 text-left">Details</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t">
                <td className="p-3">
                  {new Date(log.timestamp).toLocaleString()}
                </td>

                <td className="p-3">
                  {log.actorEmail || log.actorId}
                </td>

                <td className="p-3">
                  {log.actorRole}
                </td>

                <td className="p-3 font-medium">
                  {log.action}
                </td>

                <td className="p-3">
                  {log.resourceType} / {log.resourceId}
                </td>

                <td className="p-3">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;