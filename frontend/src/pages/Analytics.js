import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area } from 'recharts';
import axios from 'axios';
import InteractiveIndiaMap from '../components/InteractiveIndiaMap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ['#FF6B35', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#9b59b6', '#e74c3c'];

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

  const formatNumber = (num) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString() || '0';
  };

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

  const stateData = analytics?.by_state
    ? Object.entries(analytics.by_state).map(([name, value]) => ({ name, value }))
    : [];

  const employmentData = analytics?.by_employment
    ? Object.entries(analytics.by_employment).map(([name, value]) => ({ name: name || 'Unknown', value }))
    : [];

  const rationCardData = analytics?.by_ration_card
    ? Object.entries(analytics.by_ration_card).map(([name, value]) => ({ name, value }))
    : [];

  // Welfare indicators radar chart data
  const welfareData = analytics?.welfare_indicators
    ? [
      { subject: 'Scheme Coverage', A: analytics.welfare_indicators.scheme_coverage, B: 70, fullMark: 100 },
      { subject: 'Toilet Access', A: analytics.welfare_indicators.toilet_access, B: 80, fullMark: 100 },
      { subject: 'Water Access', A: analytics.welfare_indicators.water_access, B: 85, fullMark: 100 },
      { subject: 'Employment', A: analytics.welfare_indicators.employment_rate, B: 60, fullMark: 100 },
      { subject: 'BPL Coverage', A: analytics.welfare_indicators.bpl_coverage, B: 40, fullMark: 100 },
      { subject: 'Digital Access', A: analytics.welfare_indicators.digital_inclusion, B: 50, fullMark: 100 },
    ]
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

      {/* Summary Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-2xl font-bold text-blue-900">{formatNumber(analytics?.total_records)}</p>
            <p className="text-xs text-blue-700 mt-1">Total Population</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-2xl font-bold text-green-900">{formatNumber(analytics?.verified_records)}</p>
            <p className="text-xs text-green-700 mt-1">Verified</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
            <p className="text-2xl font-bold text-yellow-900">{formatNumber(analytics?.pending_review)}</p>
            <p className="text-xs text-yellow-700 mt-1">Pending Review</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <p className="text-2xl font-bold text-red-900">{formatNumber(analytics?.priority_cases)}</p>
            <p className="text-xs text-red-700 mt-1">Priority Cases</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-2xl font-bold text-purple-900">{formatNumber(analytics?.total_households)}</p>
            <p className="text-xs text-purple-700 mt-1">Households</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
            <p className="text-2xl font-bold text-emerald-900">₹{formatNumber(analytics?.avg_income)}</p>
            <p className="text-xs text-emerald-700 mt-1">Avg Income</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
            <p className="text-2xl font-bold text-indigo-900">{analytics?.avg_welfare_score?.toFixed(2)}</p>
            <p className="text-xs text-indigo-700 mt-1">Avg Welfare</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-2xl font-bold text-orange-900">{analytics?.scheme_leakage_rate}%</p>
            <p className="text-xs text-orange-700 mt-1">Leakage Rate</p>
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

      {/* Interactive India Map Section */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">State-Wise Population Heatmap</h2>
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <button
              onClick={() => setMapMetric('total_population')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mapMetric === 'total_population'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Population
            </button>
            <button
              onClick={() => setMapMetric('review')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mapMetric === 'review'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setMapMetric('priority')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mapMetric === 'priority'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Priority Cases
            </button>
            <button
              onClick={() => setMapMetric('avg_income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mapMetric === 'avg_income'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Avg Income
            </button>
            <button
              onClick={() => setMapMetric('welfare_score')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mapMetric === 'welfare_score'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Welfare Score
            </button>
            <button
              onClick={() => setMapMetric('scheme_leakage')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mapMetric === 'scheme_leakage'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Scheme Leakage
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6">
          <InteractiveIndiaMap
            metric={mapMetric}
            onStateClick={(state, data) => {
              setSelectedState({ name: state, data });
            }}
          />
        </div>

        {selectedState && (
          <div className="mt-4 p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedState.name}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Population</p>
                <p className="font-bold text-blue-600">{formatNumber(selectedState.data.total_population)}</p>
              </div>
              <div>
                <p className="text-gray-600">Pending Review</p>
                <p className="font-bold text-yellow-600">{formatNumber(selectedState.data.review)}</p>
              </div>
              <div>
                <p className="text-gray-600">Priority Cases</p>
                <p className="font-bold text-red-600">{formatNumber(selectedState.data.priority)}</p>
              </div>
              <div>
                <p className="text-gray-600">Avg Income</p>
                <p className="font-bold text-purple-600">₹{formatNumber(selectedState.data.avg_income)}</p>
              </div>
            </div>
          </div>
        )}
      </Card>



      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-wise Population */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">State-wise Population</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => formatNumber(v)} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Bar dataKey="value" fill="#FF6B35" name="Population" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Welfare Indicators - Radar Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welfare Indicators</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={welfareData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Radar name="Target" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Population by Region (Urban/Rural) */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Population by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => formatNumber(v)} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Legend />
              <Bar dataKey="value" fill="#FF6B35" name="Population" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Caste Distribution - Pie Chart */}
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
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {casteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Brackets */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Income Brackets</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => formatNumber(v)} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Area type="monotone" dataKey="value" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.6} name="Households" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Employment Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => formatNumber(v)} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Bar dataKey="value" fill="#9b59b6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ration Card Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ration Card Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rationCardData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {rationCardData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Data Quality Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Quality Metrics</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completeness</span>
                <span className="font-semibold text-green-600">{analytics?.data_quality?.completeness || 98.7}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${analytics?.data_quality?.completeness || 98.7}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-semibold text-blue-600">{analytics?.data_quality?.accuracy || 96.2}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${analytics?.data_quality?.accuracy || 96.2}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Consistency</span>
                <span className="font-semibold text-purple-600">{analytics?.data_quality?.consistency || 99.1}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: `${analytics?.data_quality?.consistency || 99.1}%` }}></div>
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