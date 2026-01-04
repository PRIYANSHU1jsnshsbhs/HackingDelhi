import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { AlertCircle, Play } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function PolicySimulation() {
  const [incomeThreshold, setIncomeThreshold] = useState([100000]);
  const [casteFilter, setCasteFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        income_threshold: incomeThreshold[0],
        caste_filter: casteFilter === 'all' ? null : casteFilter,
        region_filter: regionFilter === 'all' ? null : regionFilter
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/policy/simulate`,
        payload,
        { withCredentials: true }
      );

      setResults(response.data);
      toast.success('Simulation completed');
    } catch (error) {
      toast.error('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const regionData = results?.region_distribution
    ? Object.entries(results.region_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div data-testid="policy-simulation" className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Policy Simulation</h1>
        <p className="text-base mt-1 text-gray-600">Estimate policy impact on population segments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Simulation Parameters</h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="income-threshold" className="text-sm font-medium mb-2 block">
                Income Threshold: ₹{incomeThreshold[0].toLocaleString()}
              </Label>
              <Slider
                id="income-threshold"
                data-testid="income-slider"
                min={10000}
                max={500000}
                step={10000}
                value={incomeThreshold}
                onValueChange={setIncomeThreshold}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Households earning below this amount will be eligible
              </p>
            </div>

            <div>
              <Label htmlFor="caste-filter" className="text-sm font-medium mb-2 block">
                Caste Category
              </Label>
              <Select value={casteFilter} onValueChange={setCasteFilter}>
                <SelectTrigger id="caste-filter" data-testid="caste-filter">
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

            <div>
              <Label htmlFor="region-filter" className="text-sm font-medium mb-2 block">
                Region
              </Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger id="region-filter" data-testid="region-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                  <SelectItem value="East">East</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                  <SelectItem value="Central">Central</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              data-testid="run-simulation-btn"
              onClick={runSimulation}
              disabled={loading}
              className="w-full"
            >
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

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-yellow-800">
                Simulation logic will be finalized post backend integration. Current results are estimates.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Impact Assessment</h2>
          
          {!results ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Play className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Run a simulation to see results</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Population</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {results.total_population.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Eligible Population</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {results.eligible_population.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Eligibility Rate</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {results.eligibility_percentage}%
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#4ECDC4" name="Eligible Population" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Simulation Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Income Threshold:</span>
                    <span className="font-medium">₹{incomeThreshold[0].toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Caste Filter:</span>
                    <span className="font-medium">{casteFilter === 'all' ? 'All Categories' : casteFilter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region Filter:</span>
                    <span className="font-medium">{regionFilter === 'all' ? 'All Regions' : regionFilter}</span>
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