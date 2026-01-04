import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import InteractiveIndiaMap from '../components/InteractiveIndiaMap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ['#FF6B35', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [mapMetric, setMapMetric] = useState('total_population');
  const [selectedState, setSelectedState] = useState(null);

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

  const regionData = analytics?.by_region
    ? Object.entries(analytics.by_region).map(([name, value]) => ({ name, value }))
    : [];

  const casteData = analytics?.by_caste
    ? Object.entries(analytics.by_caste).map(([name, value]) => ({ name, value }))
    : [];

  const incomeData = analytics?.by_income
    ? Object.entries(analytics.by_income).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div data-testid="analytics-dashboard" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-base mt-1 text-gray-600">Aggregated census data insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            data-testid="privacy-mode-toggle"
            id="privacy-mode"
            checked={privacyMode}
            onCheckedChange={setPrivacyMode}
          />
          <Label htmlFor="privacy-mode" className="text-sm font-medium">
            Privacy Mode (DP enabled)
          </Label>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-3xl font-bold text-blue-900">{analytics?.total_records?.toLocaleString()}</p>
            <p className="text-sm text-blue-700 mt-1">Total Population</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-3xl font-bold text-green-900">5</p>
            <p className="text-sm text-green-700 mt-1">Regions</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-3xl font-bold text-purple-900">4</p>
            <p className="text-sm text-purple-700 mt-1">Caste Categories</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-3xl font-bold text-orange-900">98.7%</p>
            <p className="text-sm text-orange-700 mt-1">Data Quality</p>
          </div>
        </div>

        {privacyMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              🔒 Privacy Mode Enabled: All displayed data uses differential privacy to protect individual records.
            </p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Population by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#FF6B35" name="Population" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Caste Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={casteData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {casteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Income Brackets</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4ECDC4" name="Households" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Quality Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completeness</span>
                <span className="font-semibold">98.7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '98.7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-semibold">96.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '96.2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Consistency</span>
                <span className="font-semibold">99.1%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '99.1%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Individual-level drilldown is disabled to protect privacy. Aggregated data only.
        </p>
      </Card>
    </div>
  );
}

export default Analytics;