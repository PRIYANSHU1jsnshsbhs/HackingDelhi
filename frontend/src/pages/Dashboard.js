import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { BarChart3, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const { user } = useOutletContext();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/analytics/summary`, {
          withCredentials: true
        });
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--saffron))]"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Records',
      value: analytics?.total_records?.toLocaleString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Pending Review',
      value: '248',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      title: 'Verified Records',
      value: '1.2M',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Analytics Available',
      value: '5 Reports',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div data-testid="dashboard" className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-base mt-1 text-gray-600">Role: {user?.role?.replace('_', ' ').toUpperCase()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 govt-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Integrity</span>
              <span className="status-badge status-normal">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blockchain Status</span>
              <span className="status-badge" style={{backgroundColor: '#fef3c7', color: '#92400e'}}>Pending Integration</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ML Audit System</span>
              <span className="status-badge" style={{backgroundColor: '#fef3c7', color: '#92400e'}}>Pending Integration</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="space-y-2">
            {user?.role === 'supervisor' || user?.role === 'district_admin' ? (
              <a
                href="/review"
                className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">Review Queue</p>
                <p className="text-sm text-gray-600">248 records pending review</p>
              </a>
            ) : null}
            {user?.role === 'state_analyst' || user?.role === 'policy_maker' ? (
              <a
                href="/analytics"
                className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">Analytics Dashboard</p>
                <p className="text-sm text-gray-600">View population insights</p>
              </a>
            ) : null}
            {user?.role === 'policy_maker' ? (
              <a
                href="/policy"
                className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">Policy Simulation</p>
                <p className="text-sm text-gray-600">Run impact assessments</p>
              </a>
            ) : null}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics?.by_region && Object.entries(analytics.by_region).map(([region, count]) => (
            <div key={region} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[hsl(var(--navy))]">{count.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">{region}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;