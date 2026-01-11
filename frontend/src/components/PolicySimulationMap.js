import React, { useState, useEffect } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";

// India GeoJSON URL
const INDIA_TOPO_JSON =
    "https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson";

// State name mapping (GeoJSON name -> Our data name)
const STATE_NAME_MAP = {
    "Bihar": "Bihar",
    "Jharkhand": "Jharkhand",
    "Maharashtra": "Maharashtra",
    "Uttar Pradesh": "Uttar Pradesh",
    "West Bengal": "West Bengal",
    // Add more mappings as needed
};

// State center coordinates for zooming
const STATE_CENTERS = {
    "Bihar": { coordinates: [85.3131, 25.0961], zoom: 6 },
    "Jharkhand": { coordinates: [85.2799, 23.6102], zoom: 6 },
    "Maharashtra": { coordinates: [75.7139, 19.7515], zoom: 5 },
    "Uttar Pradesh": { coordinates: [80.9462, 26.8467], zoom: 5 },
    "West Bengal": { coordinates: [87.855, 22.9868], zoom: 5.5 },
    "all": { coordinates: [82.8, 22.5], zoom: 1 }
};

// Color scales for different metrics
const colorScales = {
    eligible: scaleQuantize().domain([0, 100]).range([
        "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"
    ]),
    income: scaleQuantize().domain([0, 100]).range([
        "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"
    ]),
    welfare: scaleQuantize().domain([0, 100]).range([
        "#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"
    ]),
    default: scaleQuantize().domain([0, 100]).range([
        "#fff7ed", "#ffedd5", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412"
    ])
};

function PolicySimulationMap({
    stateFilter = 'all',
    simulationData = null,
    colorMetric = 'eligible',
    onStateClick
}) {
    const [tooltip, setTooltip] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Get zoom position based on state filter
    const getZoomConfig = () => {
        if (stateFilter && stateFilter !== 'all' && STATE_CENTERS[stateFilter]) {
            return STATE_CENTERS[stateFilter];
        }
        return STATE_CENTERS["all"];
    };

    const zoomConfig = getZoomConfig();

    // Get color based on state data
    const getColor = (stateName) => {
        if (!simulationData?.region_distribution) return '#E5E7EB';

        const stateValue = simulationData.region_distribution[stateName] || 0;
        const allValues = Object.values(simulationData.region_distribution);
        const maxValue = Math.max(...allValues, 1);

        // Normalize to 0-100 scale
        const normalizedValue = (stateValue / maxValue) * 100;

        // Select color scale based on metric
        const scale = colorScales[colorMetric] || colorScales.default;
        return scale(normalizedValue);
    };

    // Format number for display
    const formatNumber = (num) => {
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num?.toLocaleString() || '0';
    };

    // Handle mouse events
    const handleMouseEnter = (geo, evt) => {
        const stateName = geo.properties.ST_NM;
        const stateValue = simulationData?.region_distribution?.[stateName] || 0;

        setTooltip({
            name: stateName,
            eligible: stateValue,
            percentage: simulationData?.eligible_population
                ? ((stateValue / simulationData.eligible_population) * 100).toFixed(1)
                : 0
        });
        setTooltipPosition({ x: evt.clientX, y: evt.clientY });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const handleMouseMove = (evt) => {
        setTooltipPosition({ x: evt.clientX, y: evt.clientY });
    };

    // Check if a state should be highlighted
    const isStateHighlighted = (stateName) => {
        if (stateFilter === 'all') return true;
        return stateName === stateFilter;
    };

    return (
        <div className="relative w-full" style={{ minHeight: '400px' }}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 1000,
                    center: [82.8, 22.5]
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <ZoomableGroup
                    center={zoomConfig.coordinates}
                    zoom={zoomConfig.zoom}
                    minZoom={1}
                    maxZoom={8}
                >
                    <Geographies geography={INDIA_TOPO_JSON}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const stateName = geo.properties.ST_NM;
                                const isHighlighted = isStateHighlighted(stateName);
                                const hasData = simulationData?.region_distribution?.[stateName] > 0;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                                        onMouseLeave={handleMouseLeave}
                                        onMouseMove={handleMouseMove}
                                        onClick={() => onStateClick && onStateClick(stateName)}
                                        style={{
                                            default: {
                                                fill: isHighlighted
                                                    ? (hasData ? getColor(stateName) : '#E5E7EB')
                                                    : '#F3F4F6',
                                                stroke: isHighlighted ? '#374151' : '#9CA3AF',
                                                strokeWidth: isHighlighted ? 0.75 : 0.25,
                                                outline: 'none',
                                                opacity: isHighlighted ? 1 : 0.4,
                                                transition: 'all 0.3s'
                                            },
                                            hover: {
                                                fill: isHighlighted
                                                    ? (hasData ? getColor(stateName) : '#D1D5DB')
                                                    : '#E5E7EB',
                                                stroke: '#1F2937',
                                                strokeWidth: 1,
                                                outline: 'none',
                                                cursor: 'pointer'
                                            },
                                            pressed: {
                                                fill: '#FF6B35',
                                                stroke: '#1F2937',
                                                strokeWidth: 1,
                                                outline: 'none'
                                            }
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
                    style={{
                        left: tooltipPosition.x + 15,
                        top: tooltipPosition.y - 10,
                        minWidth: '180px'
                    }}
                >
                    <p className="font-semibold text-gray-900 text-sm">{tooltip.name}</p>
                    <div className="mt-2 space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Eligible:</span>
                            <span className="font-medium text-green-600">{formatNumber(tooltip.eligible)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">% of Total:</span>
                            <span className="font-medium">{tooltip.percentage}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg p-2 text-xs shadow border">
                <p className="font-semibold text-gray-700 mb-1">Eligible Population</p>
                <div className="flex items-center gap-1">
                    <span className="text-gray-500">Low</span>
                    <div className="flex">
                        {colorScales[colorMetric || 'default'].range().map((color, i) => (
                            <div key={i} className="w-3 h-3" style={{ backgroundColor: color }} />
                        ))}
                    </div>
                    <span className="text-gray-500">High</span>
                </div>
            </div>

            {/* State indicator */}
            {stateFilter && stateFilter !== 'all' && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow">
                    Viewing: {stateFilter}
                </div>
            )}
        </div>
    );
}

export default PolicySimulationMap;
