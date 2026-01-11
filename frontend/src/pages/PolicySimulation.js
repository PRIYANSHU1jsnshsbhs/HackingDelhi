import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area } from 'recharts';
import { Play, AlertCircle, TrendingUp, Users, Wallet, Target, ShieldCheck, Home, Briefcase, Map } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import PolicySimulationMap from '../components/PolicySimulationMap';
import PincodePointsMap from '../components/PincodePointsMap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ['#FF6B35', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#9b59b6', '#e74c3c', '#2ecc71'];

function PolicySimulation() {
    const [incomeThreshold, setIncomeThreshold] = useState([50000]);
    const [casteFilter, setCasteFilter] = useState('all');
    const [regionFilter, setRegionFilter] = useState('all');
    const [sexFilter, setSexFilter] = useState('all');
    const [occupationFilter, setOccupationFilter] = useState('all');
    const [housingTypeFilter, setHousingTypeFilter] = useState('all');
    const [householdSizeMin, setHouseholdSizeMin] = useState([1]);
    const [householdSizeMax, setHouseholdSizeMax] = useState([10]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [mapView, setMapView] = useState('state'); // 'state' or 'pincode'

    const runSimulation = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/policy/simulate`,
                {
                    income_threshold: incomeThreshold[0],
                    caste_filter: casteFilter !== 'all' ? casteFilter : null,
                    region_filter: regionFilter !== 'all' ? regionFilter : null,
                    sex_filter: sexFilter !== 'all' ? sexFilter : null,
                    occupation_filter: occupationFilter !== 'all' ? occupationFilter : null,
                    housing_type_filter: housingTypeFilter !== 'all' ? housingTypeFilter : null,
                    household_size_min: householdSizeMin[0],
                    household_size_max: householdSizeMax[0]
                },
                { withCredentials: true }
            );
            setResults(response.data);
            toast.success('Simulation completed successfully');
        } catch (error) {
            console.error('Simulation failed:', error);
            toast.error('Failed to run simulation');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num?.toLocaleString() || '0';
    };

    // Process data for charts
    const stateData = results?.region_distribution
        ? Object.entries(results.region_distribution).map(([name, value]) => ({ name, value }))
        : [];

    const casteData = results?.caste_distribution
        ? Object.entries(results.caste_distribution).map(([name, value]) => ({ name, value }))
        : [];

    const sexData = results?.sex_distribution
        ? Object.entries(results.sex_distribution).map(([name, value]) => ({ name, value }))
        : [];

    const occupationData = results?.occupation_distribution
        ? Object.entries(results.occupation_distribution).map(([name, value]) => ({ name, value }))
        : [];

    const housingData = results?.housing_distribution
        ? Object.entries(results.housing_distribution).map(([name, value]) => ({ name, value }))
        : [];

    const incomeData = results?.income_brackets
        ? Object.entries(results.income_brackets).map(([name, value]) => ({ name, value }))
        : [];

    const ageData = results?.age_groups
        ? Object.entries(results.age_groups).map(([name, value]) => ({ name, value }))
        : [];

    const householdSizeData = results?.household_size_distribution
        ? Object.entries(results.household_size_distribution).map(([name, value]) => ({ name: `${name} members`, value }))
        : [];

    // Impact metrics for radar chart
    const impactMetrics = results ? [
        { metric: 'Coverage', value: Math.min(100, results.eligibility_percentage * 1.2), baseline: 50 },
        { metric: 'Cost Efficiency', value: Math.max(0, 100 - results.eligibility_percentage), baseline: 60 },
        { metric: 'Poverty Reduction', value: Math.min(100, results.eligibility_percentage * 0.9), baseline: 45 },
        { metric: 'Social Impact', value: Math.min(100, results.eligibility_percentage * 1.1), baseline: 55 },
        { metric: 'Admin Feasibility', value: Math.max(30, 100 - results.eligibility_percentage * 0.5), baseline: 70 },
        { metric: 'Targeting Accuracy', value: Math.min(95, 70 + results.eligibility_percentage * 0.3), baseline: 65 }
    ] : [];

    const radarData = impactMetrics.map(m => ({
        subject: m.metric,
        A: m.value,
        B: m.baseline,
        fullMark: 100
    }));

    const monthlyBenefitPerPerson = 1500;
    const estimatedBudget = results ? results.eligible_population * monthlyBenefitPerPerson * 12 : 0;

    return (
        <div data-testid="policy-simulation" className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Policy Simulation</h1>
                <p className="text-base mt-1 text-gray-600">Estimate policy impact on population segments</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Simulation Parameters */}
                <Card className="p-6 lg:col-span-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Parameters</h2>

                    <div className="space-y-4">
                        {/* Income Threshold */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Income: ₹{incomeThreshold[0].toLocaleString()}/mo
                            </Label>
                            <Slider
                                min={10000}
                                max={500000}
                                step={10000}
                                value={incomeThreshold}
                                onValueChange={setIncomeThreshold}
                            />
                        </div>

                        {/* Household Size Range */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs mb-1 block">HH Size Min: {householdSizeMin[0]}</Label>
                                <Slider min={1} max={10} step={1} value={householdSizeMin} onValueChange={setHouseholdSizeMin} />
                            </div>
                            <div>
                                <Label className="text-xs mb-1 block">HH Size Max: {householdSizeMax[0]}</Label>
                                <Slider min={1} max={10} step={1} value={householdSizeMax} onValueChange={setHouseholdSizeMax} />
                            </div>
                        </div>

                        {/* State Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-1 block">State</Label>
                            <Select value={regionFilter} onValueChange={setRegionFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All States</SelectItem>
                                    <SelectItem value="Bihar">Bihar</SelectItem>
                                    <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Caste Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-1 block">Caste Category</Label>
                            <Select value={casteFilter} onValueChange={setCasteFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="OBC">OBC</SelectItem>
                                    <SelectItem value="SC">SC</SelectItem>
                                    <SelectItem value="ST">ST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sex Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-1 block">Sex</Label>
                            <Select value={sexFilter} onValueChange={setSexFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Occupation Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-1 block">Occupation</Label>
                            <Select value={occupationFilter} onValueChange={setOccupationFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Occupations</SelectItem>
                                    <SelectItem value="agriculture">Agriculture</SelectItem>
                                    <SelectItem value="service">Service</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="labor">Labor</SelectItem>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Housing Type Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-1 block">Housing Type</Label>
                            <Select value={housingTypeFilter} onValueChange={setHousingTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="pucca">Pucca</SelectItem>
                                    <SelectItem value="semi-pucca">Semi-Pucca</SelectItem>
                                    <SelectItem value="kutcha">Kutcha</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={runSimulation} disabled={loading} className="w-full">
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Running...
                                </div>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Run Simulation
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-yellow-800">
                                Uses actual census data. Budget estimates are indicative.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Impact Assessment */}
                <Card className="p-6 lg:col-span-3">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Impact Assessment</h2>

                    {!results ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Play className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">Run a simulation to see results</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                                    <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-blue-900">{formatNumber(results.total_population)}</p>
                                    <p className="text-xs text-gray-600">Total</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                                    <Target className="h-4 w-4 text-green-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-green-900">{formatNumber(results.eligible_population)}</p>
                                    <p className="text-xs text-gray-600">Eligible</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                                    <TrendingUp className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-purple-900">{results.eligibility_percentage}%</p>
                                    <p className="text-xs text-gray-600">Coverage</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg text-center">
                                    <Wallet className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-orange-900">₹{formatNumber(estimatedBudget)}</p>
                                    <p className="text-xs text-gray-600">Budget/Year</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg text-center">
                                    <Briefcase className="h-4 w-4 text-teal-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-teal-900">₹{formatNumber(results.avg_income_eligible)}</p>
                                    <p className="text-xs text-gray-600">Avg Income</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg text-center">
                                    <Home className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-indigo-900">{results.avg_welfare_eligible}</p>
                                    <p className="text-xs text-gray-600">Welfare Score</p>
                                </div>
                            </div>

                            {/* India Map Visualization */}
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Map className="h-4 w-4 text-orange-600" />
                                        Geographic Distribution
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        <div className="flex bg-white rounded-md border border-gray-200 p-1">
                                            <button
                                                onClick={() => setMapView('state')}
                                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mapView === 'state'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                State Heatmap
                                            </button>
                                            <button
                                                onClick={() => setMapView('pincode')}
                                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mapView === 'pincode'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Pincode Density
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="min-h-[400px]">
                                    {mapView === 'state' ? (
                                        <PolicySimulationMap
                                            stateFilter={regionFilter}
                                            simulationData={results}
                                            colorMetric="eligible"
                                            onStateClick={(stateName) => {
                                                setRegionFilter(stateName);
                                                toast.info(`Filtered to ${stateName}. Click "Run Simulation" to update.`);
                                            }}
                                        />
                                    ) : (
                                        <div className="relative">
                                            <PincodePointsMap
                                                stateFilter={regionFilter}
                                                colorMetric="eligible"
                                                incomeThreshold={incomeThreshold[0]}
                                                casteFilter={casteFilter}
                                                sexFilter={sexFilter}
                                                occupationFilter={occupationFilter}
                                                housingTypeFilter={housingTypeFilter}
                                                householdSizeMin={householdSizeMin[0]}
                                                householdSizeMax={householdSizeMax[0]}
                                                onPointClick={(point) => {
                                                    toast.info(`Pincode ${point.pincode}: ${point.eligible_pct}% eligible under current criteria`);
                                                }}
                                            />
                                            <div className="mt-2 text-xs text-center text-gray-500 bg-white/50 p-1 rounded">
                                                Dots show pockets of population eligible under ALL current filters (Income, Caste, Occupation, etc.)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Charts Row 1 */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">State-wise</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={stateData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                                            <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 8 }} />
                                            <Tooltip formatter={(v) => formatNumber(v)} />
                                            <Bar dataKey="value" fill="#4ECDC4" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Caste Distribution</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={casteData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>
                                                {casteData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => formatNumber(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Sex Distribution</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={sexData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                                <Cell fill="#3b82f6" />
                                                <Cell fill="#f472b6" />
                                            </Pie>
                                            <Tooltip formatter={(v) => formatNumber(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Charts Row 2 */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Income Brackets</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={incomeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                                            <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 8 }} />
                                            <Tooltip formatter={(v) => formatNumber(v)} />
                                            <Area type="monotone" dataKey="value" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.6} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Age Groups</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={ageData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                                            <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 8 }} />
                                            <Tooltip formatter={(v) => formatNumber(v)} />
                                            <Bar dataKey="value" fill="#9b59b6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Occupation</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={occupationData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>
                                                {occupationData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => formatNumber(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Charts Row 3 */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Housing Type</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={housingData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name }) => name}>
                                                {housingData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => formatNumber(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Household Size</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={householdSizeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 7 }} />
                                            <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 8 }} />
                                            <Tooltip formatter={(v) => formatNumber(v)} />
                                            <Bar dataKey="value" fill="#2ecc71" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Policy Impact</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 7 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 7 }} />
                                            <Radar name="Policy" dataKey="A" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.5} />
                                            <Radar name="Baseline" dataKey="B" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.3} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                    Applied Filters
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                                    <div>
                                        <span className="text-gray-500">Income</span>
                                        <p className="font-medium">≤₹{incomeThreshold[0].toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">State</span>
                                        <p className="font-medium">{regionFilter === 'all' ? 'All' : regionFilter}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Caste</span>
                                        <p className="font-medium">{casteFilter === 'all' ? 'All' : casteFilter}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Sex</span>
                                        <p className="font-medium">{sexFilter === 'all' ? 'All' : sexFilter}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Occupation</span>
                                        <p className="font-medium">{occupationFilter === 'all' ? 'All' : occupationFilter}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Housing</span>
                                        <p className="font-medium">{housingTypeFilter === 'all' ? 'All' : housingTypeFilter}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">HH Size</span>
                                        <p className="font-medium">{householdSizeMin[0]}-{householdSizeMax[0]}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default PolicySimulation;
