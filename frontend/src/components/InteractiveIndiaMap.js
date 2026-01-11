import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// India GeoJSON URL (using open source data)
const INDIA_TOPO_JSON =
  "https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson";

function InteractiveIndiaMap({ metric = 'total_population', onStateClick }) {
  const [stateData, setStateData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchStateData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/analytics/states`, {
          withCredentials: true
        });
        setStateData(response.data);
      } catch (error) {
        console.error('Failed to fetch state data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStateData();
  }, []);

  const getColor = (stateName) => {
    const data = stateData[stateName];
    if (!data) return '#E5E7EB';

    let value;
    let max;

    // Calculate max for each metric for proper scaling
    const allData = Object.values(stateData);

    if (metric === 'total_population') {
      value = data.total_population;
      max = Math.max(...allData.map(d => d.total_population));
    } else if (metric === 'review') {
      value = data.review;
      max = Math.max(...allData.map(d => d.review));
    } else if (metric === 'priority') {
      value = data.priority;
      max = Math.max(...allData.map(d => d.priority));
    } else if (metric === 'avg_income') {
      value = data.avg_income;
      max = Math.max(...allData.map(d => d.avg_income));
    } else if (metric === 'welfare_score') {
      value = data.avg_welfare_score || 0;
      max = Math.max(...allData.map(d => d.avg_welfare_score || 0));
    } else if (metric === 'scheme_leakage') {
      value = data.scheme_leakage_count || 0;
      max = Math.max(...allData.map(d => d.scheme_leakage_count || 0));
    }

    // Calculate intensity
    const intensity = max > 0 ? value / max : 0;

    // Colors based on metric type
    if (metric === 'avg_income' || metric === 'welfare_score') {
      // Green gradient for positive metrics (higher is better)
      if (intensity > 0.7) return '#15803d'; // Dark green
      if (intensity > 0.5) return '#22c55e'; // Green
      if (intensity > 0.3) return '#86efac'; // Light green
      if (intensity > 0.1) return '#bbf7d0'; // Very light green
      return '#dcfce7'; // Lightest green
    } else if (metric === 'priority' || metric === 'scheme_leakage' || metric === 'review') {
      // Red gradient for concern metrics (higher is worse)
      if (intensity > 0.7) return '#dc2626'; // Dark red
      if (intensity > 0.5) return '#ef4444'; // Red
      if (intensity > 0.3) return '#f87171'; // Light red
      if (intensity > 0.1) return '#fca5a5'; // Very light red
      return '#fecaca'; // Lightest red
    } else {
      // Orange gradient for neutral metrics (population)
      if (intensity > 0.7) return '#FF6B35'; // Dark orange
      if (intensity > 0.5) return '#FF8C42'; // Orange
      if (intensity > 0.3) return '#FFB84D'; // Light orange
      if (intensity > 0.1) return '#FFD166'; // Yellow
      return '#FFF3B0'; // Light yellow
    }
  };

  const formatNumber = (num) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString() || '0';
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'total_population': return 'Population';
      case 'review': return 'Under Review';
      case 'priority': return 'Priority Cases';
      case 'avg_income': return 'Avg Income';
      case 'welfare_score': return 'Welfare Score';
      case 'scheme_leakage': return 'Scheme Leakage';
      default: return 'Population';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 850,
          center: [78.5, 22.5],
        }}
        width={800}
        height={500}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Geographies geography={INDIA_TOPO_JSON}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.ST_NM || geo.properties.NAME_1 || geo.properties.name;
              const data = stateData[stateName];
              const fillColor = getColor(stateName);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: fillColor,
                      stroke: "#2C3E50",
                      strokeWidth: 1.5,
                      outline: "none",
                      opacity: 0.8,
                    },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={(event) => {
                    if (data) {
                      setTooltip({
                        name: stateName,
                        ...data,
                      });
                      setTooltipPosition({
                        x: event.clientX,
                        y: event.clientY,
                      });
                    }
                  }}
                  onMouseMove={(event) => {
                    setTooltipPosition({
                      x: event.clientX,
                      y: event.clientY,
                    });
                  }}
                  onMouseLeave={() => {
                    setTooltip(null);
                  }}
                  onClick={() => {
                    if (onStateClick && data) {
                      onStateClick(stateName, data);
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white shadow-xl rounded-lg p-4 border border-gray-200 pointer-events-none min-w-[220px]"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y + 15}px`,
          }}
        >
          <div className="space-y-3">
            <p className="font-bold text-gray-900 text-base border-b pb-2">{tooltip.name}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Total Population:</span>
                <span className="font-semibold text-blue-700">
                  {formatNumber(tooltip.total_population)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Normal Records:</span>
                <span className="font-semibold text-green-600">
                  {formatNumber(tooltip.normal)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Under Review:</span>
                <span className="font-semibold text-orange-600">
                  {formatNumber(tooltip.review)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Priority Cases:</span>
                <span className="font-semibold text-red-600">
                  {formatNumber(tooltip.priority)}
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t">
                <span className="text-gray-600">Avg Income:</span>
                <span className="font-semibold text-purple-600">
                  ₹{formatNumber(tooltip.avg_income)}/mo
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Welfare Score:</span>
                <span className="font-semibold text-teal-600">
                  {tooltip.avg_welfare_score?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Scheme Leakage:</span>
                <span className="font-semibold text-red-500">
                  {formatNumber(tooltip.scheme_leakage_count)} cases
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          {getMetricLabel()}
        </p>
        <div className="space-y-2">
          {(metric === 'avg_income' || metric === 'welfare_score') ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#15803d' }}></div>
                <span className="text-xs text-gray-600">High (Good)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#86efac' }}></div>
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dcfce7' }}></div>
                <span className="text-xs text-gray-600">Low</span>
              </div>
            </>
          ) : (metric === 'priority' || metric === 'scheme_leakage' || metric === 'review') ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                <span className="text-xs text-gray-600">High (Concern)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f87171' }}></div>
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fecaca' }}></div>
                <span className="text-xs text-gray-600">Low</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF6B35' }}></div>
                <span className="text-xs text-gray-600">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFB84D' }}></div>
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFF3B0' }}></div>
                <span className="text-xs text-gray-600">Low</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200"></div>
            <span className="text-xs text-gray-600">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveIndiaMap;
