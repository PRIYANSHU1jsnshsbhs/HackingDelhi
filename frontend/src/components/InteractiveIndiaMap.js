import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Simplified India state paths with approximate coordinates
// In production, use detailed GeoJSON data
const INDIA_STATES = {
  "Jammu and Kashmir": { path: "M 180 50 L 220 45 L 230 60 L 215 75 L 180 70 Z", cx: 205, cy: 60 },
  "Himachal Pradesh": { path: "M 215 75 L 230 75 L 235 85 L 220 90 Z", cx: 225, cy: 81 },
  "Punjab": { path: "M 200 80 L 220 80 L 220 95 L 205 95 Z", cx: 210, cy: 87 },
  "Haryana": { path: "M 210 95 L 230 95 L 230 110 L 215 110 Z", cx: 220, cy: 102 },
  "Delhi": { path: "M 220 105 L 225 105 L 225 110 L 220 110 Z", cx: 222, cy: 107 },
  "Uttarakhand": { path: "M 230 85 L 245 85 L 250 100 L 235 100 Z", cx: 240, cy: 92 },
  "Uttar Pradesh": { path: "M 230 100 L 285 100 L 290 120 L 285 140 L 235 140 L 230 120 Z", cx: 257, cy: 120 },
  "Rajasthan": { path: "M 190 110 L 230 110 L 235 140 L 200 160 L 180 140 Z", cx: 207, cy: 135 },
  "Gujarat": { path: "M 150 160 L 200 160 L 195 200 L 145 195 Z", cx: 172, cy: 178 },
  "Madhya Pradesh": { path: "M 200 160 L 280 160 L 285 185 L 275 200 L 195 200 Z", cx: 240, cy: 180 },
  "Maharashtra": { path: "M 195 200 L 275 200 L 265 250 L 190 245 Z", cx: 232, cy: 223 },
  "Chhattisgarh": { path: "M 275 185 L 305 185 L 310 215 L 285 220 L 275 200 Z", cx: 290, cy: 200 },
  "Odisha": { path: "M 305 200 L 330 200 L 335 235 L 310 240 L 305 220 Z", cx: 318, cy: 218 },
  "West Bengal": { path: "M 310 140 L 340 140 L 350 165 L 335 175 L 330 155 L 315 155 Z", cx: 328, cy: 152 },
  "Jharkhand": { path: "M 285 165 L 310 165 L 315 185 L 305 200 L 285 190 Z", cx: 297, cy: 180 },
  "Bihar": { path: "M 285 140 L 320 140 L 320 165 L 285 165 Z", cx: 302, cy: 152 },
  "Sikkim": { path: "M 340 130 L 350 130 L 350 140 L 340 140 Z", cx: 345, cy: 135 },
  "Arunachal Pradesh": { path: "M 360 100 L 400 100 L 405 125 L 365 125 Z", cx: 382, cy: 112 },
  "Nagaland": { path: "M 375 130 L 395 130 L 395 145 L 375 145 Z", cx: 385, cy: 137 },
  "Manipur": { path: "M 380 150 L 395 150 L 395 165 L 380 165 Z", cx: 387, cy: 157 },
  "Mizoram": { path: "M 370 170 L 385 170 L 385 185 L 370 185 Z", cx: 377, cy: 177 },
  "Tripura": { path: "M 355 165 L 370 165 L 370 178 L 355 178 Z", cx: 362, cy: 171 },
  "Meghalaya": { path: "M 350 150 L 370 150 L 370 163 L 350 163 Z", cx: 360, cy: 156 },
  "Assam": { path: "M 335 135 L 375 135 L 375 155 L 350 155 L 340 145 Z", cx: 357, cy: 145 },
  "Andhra Pradesh": { path: "M 250 250 L 295 250 L 300 290 L 255 290 Z", cx: 275, cy: 270 },
  "Telangana": { path: "M 250 235 L 280 235 L 285 255 L 250 255 Z", cx: 265, cy: 245 },
  "Karnataka": { path: "M 210 250 L 250 250 L 250 300 L 205 295 Z", cx: 230, cy: 273 },
  "Goa": { path: "M 195 245 L 210 245 L 210 260 L 195 260 Z", cx: 202, cy: 252 },
  "Kerala": { path: "M 205 295 L 230 295 L 230 340 L 210 340 Z", cx: 220, cy: 317 },
  "Tamil Nadu": { path: "M 230 290 L 280 290 L 280 330 L 235 335 L 230 310 Z", cx: 255, cy: 310 }
};

function InteractiveIndiaMap({ metric = 'total_population', onStateClick }) {
  const [stateData, setStateData] = useState({});
  const [hoveredState, setHoveredState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const getColor = (state) => {
    const data = stateData[state];
    if (!data) return '#E5E7EB';

    let value;
    if (metric === 'total_population') {
      value = data.total_population;
    } else if (metric === 'review') {
      value = (data.review / data.total_population) * 100;
    } else if (metric === 'priority') {
      value = (data.priority / data.total_population) * 100;
    } else if (metric === 'avg_income') {
      value = data.avg_income;
    }

    // Orange-yellow gradient based on value intensity
    if (metric === 'total_population') {
      const max = Math.max(...Object.values(stateData).map(d => d.total_population));
      const intensity = value / max;
      if (intensity > 0.7) return '#FF6B35'; // Dark orange
      if (intensity > 0.5) return '#FF8C42'; // Orange
      if (intensity > 0.3) return '#FFB84D'; // Light orange
      if (intensity > 0.1) return '#FFD166'; // Yellow
      return '#FFF3B0'; // Light yellow
    } else if (metric === 'review' || metric === 'priority') {
      if (value > 20) return '#DC2626'; // Red for high
      if (value > 15) return '#FF6B35'; // Orange
      if (value > 10) return '#FFB84D'; // Light orange
      if (value > 5) return '#FFD166'; // Yellow
      return '#4ADE80'; // Green for low
    } else if (metric === 'avg_income') {
      if (value > 120000) return '#4ADE80'; // Green for high income
      if (value > 90000) return '#FFD166'; // Yellow
      if (value > 60000) return '#FFB84D'; // Orange
      return '#FF6B35'; // Red for low income
    }

    return '#E5E7EB';
  };

  const handleMouseMove = (e, state) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setHoveredState(state);
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  const handleStateClick = (state) => {
    if (onStateClick) {
      onStateClick(state, stateData[state]);
    }
  };

  const formatNumber = (num) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox="0 0 500 400"
        className="w-full h-auto"
        style={{ maxHeight: '500px' }}
      >
        {/* India Map States */}
        {Object.entries(INDIA_STATES).map(([stateName, stateInfo]) => (
          <g key={stateName}>
            <path
              d={stateInfo.path}
              fill={getColor(stateName)}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="transition-all duration-200 cursor-pointer hover:opacity-80"
              onMouseMove={(e) => handleMouseMove(e, stateName)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleStateClick(stateName)}
              style={{
                filter: hoveredState === stateName ? 'brightness(1.1)' : 'none',
                strokeWidth: hoveredState === stateName ? '2.5' : '1.5'
              }}
            />
          </g>
        ))}

        {/* State Labels for major states */}
        {['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'Rajasthan'].map(state => {
          const stateInfo = INDIA_STATES[state];
          return (
            <text
              key={`label-${state}`}
              x={stateInfo.cx}
              y={stateInfo.cy}
              textAnchor="middle"
              className="text-[8px] font-semibold fill-gray-700 pointer-events-none"
            >
              {state.length > 10 ? state.substring(0, 8) + '...' : state}
            </text>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredState && stateData[hoveredState] && (
        <div
          className="absolute z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 pointer-events-none"
          style={{
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y - 80}px`,
            minWidth: '220px'
          }}
        >
          <h3 className="font-bold text-gray-900 mb-2 border-b pb-1">{hoveredState}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Population:</span>
              <span className="font-semibold text-blue-700">
                {formatNumber(stateData[hoveredState].total_population)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Normal:</span>
              <span className="font-semibold text-green-600">
                {formatNumber(stateData[hoveredState].normal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Under Review:</span>
              <span className="font-semibold text-orange-600">
                {formatNumber(stateData[hoveredState].review)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              <span className="font-semibold text-red-600">
                {formatNumber(stateData[hoveredState].priority)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t">
              <span className="text-gray-600">Avg Income:</span>
              <span className="font-semibold text-purple-600">
                ₹{formatNumber(stateData[hoveredState].avg_income)}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t text-xs text-gray-500 italic">
            Click to view details
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveIndiaMap;
