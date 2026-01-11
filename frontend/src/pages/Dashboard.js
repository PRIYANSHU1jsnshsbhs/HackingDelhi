import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { BarChart3, Users, AlertTriangle, CheckCircle, Home, TrendingUp, ShieldAlert } from 'lucide-react';
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

  const formatNumber = (num) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString() || '0';
  };

  const stats = [
    {
      title: 'Total Records',
      value: formatNumber(analytics?.total_records || 0),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Pending Review',
      value: formatNumber(analytics?.pending_review || 0),
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      title: 'Verified Records',
      value: formatNumber(analytics?.verified_records || 0),
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Total Households',
      value: formatNumber(analytics?.total_households || 0),
      icon: Home,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  const additionalStats = [
    {
      title: 'Priority Cases',
      value: formatNumber(analytics?.priority_cases || 0),
      icon: ShieldAlert,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Avg Income',
      value: `₹${formatNumber(analytics?.avg_income || 0)}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Scheme Leakage',
      value: `${analytics?.scheme_leakage_rate || 0}%`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Avg Welfare Score',
      value: analytics?.avg_welfare_score?.toFixed(2) || '0.00',
      icon: BarChart3,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    }
  ];

  return (
    <div data-testid="dashboard" className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-base mt-1 text-gray-600">Role: {user?.role?.replace('_', ' ').toUpperCase()}</p>
      </div>

      {/* Main Stats */}
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

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {additionalStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 govt-card">
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Integrity</span>
              <span className="status-badge status-normal">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blockchain Status</span>
              <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pending Integration</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ML Audit System</span>
              <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pending Integration</span>
            </div>
          </div>
        </Card>

        {/* Data Quality Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completeness</span>
                <span className="font-medium text-gray-900">{analytics?.data_quality?.completeness || 98.7}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics?.data_quality?.completeness || 98.7}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-medium text-gray-900">{analytics?.data_quality?.accuracy || 96.2}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analytics?.data_quality?.accuracy || 96.2}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Consistency</span>
                <span className="font-medium text-gray-900">{analytics?.data_quality?.consistency || 99.1}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analytics?.data_quality?.consistency || 99.1}%` }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Access */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/review"
            className="block px-4 py-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
          >
            <p className="font-medium text-gray-900">Review Queue</p>
            <p className="text-sm text-gray-600">{formatNumber(analytics?.pending_review || 0)} records pending</p>
          </a>
          <a
            href="/analytics"
            className="block px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <p className="font-medium text-gray-900">Analytics Dashboard</p>
            <p className="text-sm text-gray-600">View population insights</p>
          </a>
          <a
            href="/policy"
            className="block px-4 py-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <p className="font-medium text-gray-900">Policy Simulation</p>
            <p className="text-sm text-gray-600">Run impact assessments</p>
          </a>
          <a
            href="/audit"
            className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <p className="font-medium text-gray-900">Audit Logs</p>
            <p className="text-sm text-gray-600">View system activity</p>
          </a>
        </div>
      </Card>

      {/* State-wise Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">State-wise Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics?.by_state && Object.entries(analytics.by_state).map(([state, count]) => (
            <div key={state} className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
              <p className="text-2xl font-bold text-[hsl(var(--navy))]">{formatNumber(count)}</p>
              <p className="text-sm text-gray-600 mt-1">{state}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Caste Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Caste Category Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {analytics?.by_caste && Object.entries(analytics.by_caste).map(([caste, count]) => {
            const total = analytics?.total_records || 1;
            const percentage = ((count / total) * 100).toFixed(1);
            const colors = {
              'General': 'from-blue-50 to-blue-100 border-blue-200',
              'OBC': 'from-green-50 to-green-100 border-green-200',
              'SC': 'from-yellow-50 to-yellow-100 border-yellow-200',
              'ST': 'from-purple-50 to-purple-100 border-purple-200'
            };
            return (
              <div key={caste} className={`text-center p-4 bg-gradient-to-br ${colors[caste] || 'from-gray-50 to-gray-100'} rounded-lg border`}>
                <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
                <p className="text-sm text-gray-600 mt-1">{caste}</p>
                <p className="text-xs text-gray-500">{formatNumber(count)} people</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;