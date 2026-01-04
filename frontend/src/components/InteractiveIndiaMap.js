import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Improved India state paths with better geographical accuracy
const INDIA_STATES = {
  // Northern States
  "Jammu and Kashmir": { 
    path: "M 170 35 L 190 30 L 210 33 L 225 40 L 230 52 L 225 65 L 210 70 L 190 68 L 175 60 L 168 48 Z", 
    cx: 200, cy: 50 
  },
  "Himachal Pradesh": { 
    path: "M 210 70 L 225 68 L 235 75 L 240 85 L 230 92 L 215 90 L 208 82 Z", 
    cx: 222, cy: 80 
  },
  "Punjab": { 
    path: "M 190 68 L 210 70 L 208 82 L 215 90 L 210 100 L 195 100 L 188 88 Z", 
    cx: 202, cy: 85 
  },
  "Haryana": { 
    path: "M 195 100 L 210 100 L 218 108 L 225 118 L 218 125 L 205 122 L 195 115 Z", 
    cx: 210, cy: 112 
  },
  "Delhi": { 
    path: "M 210 108 L 218 108 L 218 115 L 210 115 Z", 
    cx: 214, cy: 111 
  },
  "Uttarakhand": { 
    path: "M 230 92 L 245 92 L 250 102 L 248 112 L 235 112 L 225 102 Z", 
    cx: 238, cy: 102 
  },
  "Uttar Pradesh": { 
    path: "M 218 118 L 248 112 L 268 115 L 290 120 L 295 135 L 290 152 L 275 155 L 245 152 L 225 145 L 218 130 Z", 
    cx: 258, cy: 135 
  },
  
  // Western States
  "Rajasthan": { 
    path: "M 175 115 L 218 118 L 225 145 L 228 165 L 210 182 L 185 178 L 165 165 L 160 140 Z", 
    cx: 195, cy: 150 
  },
  "Gujarat": { 
    path: "M 140 175 L 165 175 L 185 178 L 195 195 L 192 218 L 175 230 L 155 228 L 138 215 L 135 195 Z", 
    cx: 165, cy: 202 
  },
  "Goa": { 
    path: "M 185 258 L 198 258 L 198 272 L 185 272 Z", 
    cx: 191, cy: 265 
  },
  
  // Central States
  "Madhya Pradesh": { 
    path: "M 210 182 L 245 180 L 275 178 L 290 185 L 295 205 L 285 220 L 260 222 L 230 218 L 205 210 L 198 195 Z", 
    cx: 250, cy: 200 
  },
  "Chhattisgarh": { 
    path: "M 285 220 L 310 218 L 320 228 L 322 245 L 312 258 L 295 255 L 285 242 Z", 
    cx: 305, cy: 238 
  },
  
  // Eastern States
  "Bihar": { 
    path: "M 275 155 L 305 152 L 325 155 L 330 168 L 322 178 L 305 180 L 285 175 Z", 
    cx: 305, cy: 165 
  },
  "Jharkhand": { 
    path: "M 285 175 L 305 180 L 315 190 L 318 205 L 310 218 L 295 215 L 285 202 Z", 
    cx: 302, cy: 195 
  },
  "West Bengal": { 
    path: "M 322 178 L 340 175 L 352 182 L 358 198 L 350 215 L 340 218 L 330 210 L 318 205 L 315 190 Z", 
    cx: 338, cy: 195 
  },
  "Odisha": { 
    path: "M 312 258 L 335 255 L 345 268 L 348 285 L 340 298 L 322 295 L 315 278 Z", 
    cx: 330, cy: 277 
  },
  "Sikkim": { 
    path: "M 352 162 L 360 162 L 360 172 L 352 172 Z", 
    cx: 356, cy: 167 
  },
  
  // North-Eastern States
  "Assam": { 
    path: "M 340 175 L 365 172 L 380 178 L 385 192 L 375 205 L 358 208 L 350 202 L 352 182 Z", 
    cx: 368, cy: 188 
  },
  "Arunachal Pradesh": { 
    path: "M 365 145 L 395 140 L 410 148 L 415 162 L 405 175 L 385 178 L 370 172 L 365 158 Z", 
    cx: 390, cy: 160 
  },
  "Nagaland": { 
    path: "M 385 192 L 400 190 L 405 202 L 400 212 L 385 210 Z", 
    cx: 394, cy: 201 
  },
  "Manipur": { 
    path: "M 385 210 L 400 212 L 402 225 L 395 235 L 382 232 Z", 
    cx: 392, cy: 222 
  },
  "Mizoram": { 
    path: "M 375 238 L 385 238 L 388 252 L 380 258 L 372 252 Z", 
    cx: 380, cy: 248 
  },
  "Tripura": { 
    path: "M 358 218 L 370 218 L 372 232 L 362 235 Z", 
    cx: 365, cy: 226 
  },
  "Meghalaya": { 
    path: "M 358 208 L 375 205 L 378 218 L 370 222 L 358 220 Z", 
    cx: 368, cy: 213 
  },
  
  // Southern States
  "Maharashtra": { 
    path: "M 192 218 L 230 218 L 260 222 L 270 240 L 268 265 L 245 275 L 215 270 L 195 258 L 185 245 Z", 
    cx: 230, cy: 245 
  },
  "Telangana": { 
    path: "M 260 255 L 280 252 L 290 265 L 285 282 L 268 285 L 255 275 Z", 
    cx: 272, cy: 268 
  },
  "Andhra Pradesh": { 
    path: "M 268 285 L 290 285 L 305 295 L 310 315 L 302 335 L 278 338 L 260 325 L 255 305 Z", 
    cx: 285, cy: 312 
  },
  "Karnataka": { 
    path: "M 215 270 L 245 275 L 255 295 L 260 325 L 250 345 L 225 355 L 200 348 L 190 325 L 195 295 Z", 
    cx: 227, cy: 312 
  },
  "Kerala": { 
    path: "M 200 348 L 225 355 L 230 375 L 228 395 L 215 405 L 200 405 L 192 385 L 195 365 Z", 
    cx: 213, cy: 378 
  },
  "Tamil Nadu": { 
    path: "M 228 338 L 260 338 L 278 348 L 285 368 L 280 390 L 260 405 L 235 408 L 215 398 L 228 375 Z", 
    cx: 252, cy: 372 
  }
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
        viewBox="0 0 550 450"
        className="w-full h-auto"
        style={{ maxHeight: '550px' }}
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
        {['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'West Bengal', 'Bihar', 'Andhra Pradesh'].map(state => {
          const stateInfo = INDIA_STATES[state];
          if (!stateInfo) return null;
          return (
            <text
              key={`label-${state}`}
              x={stateInfo.cx}
              y={stateInfo.cy}
              textAnchor="middle"
              className="text-[7px] font-semibold fill-gray-700 pointer-events-none select-none"
            >
              {state.length > 12 ? state.substring(0, 10) + '.' : state}
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
