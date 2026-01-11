import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from "react-simple-maps";
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// India GeoJSON URL (same as InteractiveIndiaMap)
const INDIA_TOPO_JSON =
    "https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson";

function PolicyImpactMap({ 
    incomeThreshold,
    casteFilter,
    sexFilter,
    occupationFilter,
    housingTypeFilter,
    householdSizeMin,
    householdSizeMax,
    regionFilter,
    simulationRun = false  // True after "Run Simulation" is clicked
}) {
    const [allPoints, setAllPoints] = useState([]);        // All points (loaded once)
    const [filteredPoints, setFilteredPoints] = useState([]); // Points with impact scores after simulation
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const initialLoadDone = useRef(false);

    // Load ALL points once on mount (no filters - just to show all markers)
    useEffect(() => {
        const loadAllPoints = async () => {
            if (initialLoadDone.current) return;
            
            setLoading(true);
            try {
                // Request with very high income threshold and no filters to get ALL points
                const response = await axios.post(
                    `${BACKEND_URL}/api/policy/map-points`,
                    {
                        income_threshold: 999999999,  // Very high to include everyone
                        caste_filter: null,
                        region_filter: null,
                        sex_filter: null,
                        occupation_filter: null,
                        housing_type_filter: null,
                        household_size_min: 1,
                        household_size_max: 100
                    },
                    { withCredentials: true }
                );
                setAllPoints(response.data.points || []);
                initialLoadDone.current = true;
            } catch (error) {
                console.error('Failed to fetch all map points:', error);
                setAllPoints([]);
            } finally {
                setLoading(false);
            }
        };

        loadAllPoints();
    }, []);

    // Fetch filtered/impact data when simulation runs
    const fetchFilteredPoints = useCallback(async () => {
        if (!simulationRun) {
            setFilteredPoints([]);
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/policy/map-points`,
                {
                    income_threshold: incomeThreshold,
                    caste_filter: casteFilter !== 'all' ? casteFilter : null,
                    region_filter: regionFilter !== 'all' ? regionFilter : null,
                    sex_filter: sexFilter !== 'all' ? sexFilter : null,
                    occupation_filter: occupationFilter !== 'all' ? occupationFilter : null,
                    housing_type_filter: housingTypeFilter !== 'all' ? housingTypeFilter : null,
                    household_size_min: householdSizeMin,
                    household_size_max: householdSizeMax
                },
                { withCredentials: true }
            );
            setFilteredPoints(response.data.points || []);
        } catch (error) {
            console.error('Failed to fetch filtered map points:', error);
        }
    }, [simulationRun, incomeThreshold, casteFilter, sexFilter, occupationFilter, housingTypeFilter, householdSizeMin, householdSizeMax, regionFilter]);

    useEffect(() => {
        fetchFilteredPoints();
    }, [fetchFilteredPoints]);

    // Create a lookup map for filtered points by lat/lng key
    const filteredLookup = React.useMemo(() => {
        const lookup = {};
        filteredPoints.forEach(p => {
            const key = `${parseFloat(p.latitude).toFixed(2)},${parseFloat(p.longitude).toFixed(2)}`;
            lookup[key] = p;
        });
        return lookup;
    }, [filteredPoints]);

    // Get color based on whether simulation has run and impact score
    const getMarkerColor = (point) => {
        if (!simulationRun) {
            // Before simulation: neutral gray color for all markers
            return '#6B7280';
        }

        // After simulation: look up the impact score
        const key = `${parseFloat(point.latitude).toFixed(2)},${parseFloat(point.longitude).toFixed(2)}`;
        const filtered = filteredLookup[key];
        
        if (!filtered) {
            // This location has no eligible people - green (not affected)
            return 'rgb(34, 197, 94)';
        }

        const impactScore = filtered.impact_score || 0;

        // Color gradient: Green (0%) -> Yellow (50%) -> Red (100%)
        if (impactScore <= 0.3) {
            // Green to Yellow-Green
            const ratio = impactScore / 0.3;
            const r = Math.floor(34 + ratio * (234 - 34));
            const g = Math.floor(197 - ratio * (197 - 179));
            const b = Math.floor(94 - ratio * 94);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (impactScore <= 0.6) {
            // Yellow to Orange
            const ratio = (impactScore - 0.3) / 0.3;
            const r = Math.floor(234 + ratio * (249 - 234));
            const g = Math.floor(179 - ratio * (179 - 115));
            const b = Math.floor(0 + ratio * 22);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Orange to Red
            const ratio = (impactScore - 0.6) / 0.4;
            const r = Math.floor(249 + ratio * (220 - 249));
            const g = Math.floor(115 - ratio * 115);
            const b = Math.floor(22 - ratio * 22);
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    // Get marker size based on count
    const getMarkerSize = (count) => {
        if (count >= 100) return 7;
        if (count >= 50) return 5;
        if (count >= 20) return 4;
        if (count >= 10) return 3;
        return 2.5;
    };

    // Get tooltip data - merge with filtered data if available
    const getTooltipData = (point) => {
        const key = `${parseFloat(point.latitude).toFixed(2)},${parseFloat(point.longitude).toFixed(2)}`;
        const filtered = filteredLookup[key];
        
        return {
            ...point,
            eligible_count: filtered?.eligible_count || 0,
            impact_score: filtered?.impact_score || 0,
            avg_income: filtered?.avg_income || point.avg_income || 0
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[450px] bg-gray-50 rounded">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600">Loading all markers...</span>
            </div>
        );
    }

    const displayPoints = allPoints;
    const totalPeople = displayPoints.reduce((sum, p) => sum + (p.count || 0), 0);
    const affectedPeople = filteredPoints.reduce((sum, p) => sum + (p.eligible_count || 0), 0);

    return (
        <div className="relative w-full h-[450px] bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg overflow-hidden">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 900,
                    center: [78.5, 22.5],
                }}
                width={800}
                height={450}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >
                <ZoomableGroup zoom={1} center={[78.5, 22.5]}>
                    {/* India States */}
                    <Geographies geography={INDIA_TOPO_JSON}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#e8f4f8"
                                    stroke="#94a3b8"
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#d0e8f0", outline: "none" },
                                        pressed: { outline: "none" },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {/* All Data Point Markers */}
                    {displayPoints.map((point, idx) => {
                        const lat = parseFloat(point.latitude);
                        const lng = parseFloat(point.longitude);
                        
                        // Skip invalid coordinates
                        if (isNaN(lat) || isNaN(lng)) return null;
                        
                        const color = getMarkerColor(point);
                        const size = getMarkerSize(point.count || 1);
                        
                        return (
                            <Marker 
                                key={`marker-${idx}`} 
                                coordinates={[lng, lat]}
                                onMouseEnter={(event) => {
                                    setTooltip(getTooltipData(point));
                                    setTooltipPosition({
                                        x: event.clientX,
                                        y: event.clientY,
                                    });
                                }}
                                onMouseMove={(event) => {
                                    setTooltipPosition({
                                        x: event.clientX,
                                        y: event.clientY,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <circle
                                    r={size}
                                    fill={color}
                                    opacity={simulationRun ? 0.85 : 0.5}
                                    stroke="#fff"
                                    strokeWidth={0.3}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Marker>
                        );
                    })}
                </ZoomableGroup>
            </ComposableMap>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 bg-white shadow-xl rounded-lg p-3 border border-gray-200 pointer-events-none min-w-[200px]"
                    style={{
                        left: `${tooltipPosition.x + 15}px`,
                        top: `${tooltipPosition.y + 15}px`,
                    }}
                >
                    <div className="space-y-2 text-sm">
                        <div className="font-semibold text-gray-900 border-b pb-1">
                            {tooltip.state || 'Location'}
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Coordinates:</span>
                            <span className="font-mono text-xs">
                                {parseFloat(tooltip.latitude).toFixed(2)}°N, {parseFloat(tooltip.longitude).toFixed(2)}°E
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Total People:</span>
                            <span className="font-semibold">{(tooltip.count || 0).toLocaleString()}</span>
                        </div>
                        {simulationRun && (
                            <>
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-600">Affected:</span>
                                    <span className="font-semibold text-orange-600">
                                        {(tooltip.eligible_count || 0).toLocaleString()} ({((tooltip.impact_score || 0) * 100).toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-600">Avg Income:</span>
                                    <span className="font-semibold">₹{(tooltip.avg_income || 0).toLocaleString()}</span>
                                </div>
                            </>
                        )}
                        {!simulationRun && (
                            <div className="text-xs text-gray-500 italic pt-1 border-t">
                                Run simulation to see impact data
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/95 p-3 rounded-lg shadow-md border border-gray-200 text-xs">
                <div className="font-semibold text-gray-800 mb-2">
                    {simulationRun ? 'Policy Impact' : 'All Locations'}
                </div>
                {simulationRun ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(34, 197, 94)' }}></div>
                            <span>Not Affected (0%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(234, 179, 0)' }}></div>
                            <span>Partially (30-60%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(220, 38, 38)' }}></div>
                            <span>Highly Affected (100%)</span>
                        </div>
                        <div className="mt-2 pt-2 border-t text-gray-600">
                            <div>{affectedPeople.toLocaleString()} affected</div>
                            <div>of {totalPeople.toLocaleString()} total</div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                            <span>Population clusters</span>
                        </div>
                        <div className="mt-2 pt-2 border-t text-gray-600">
                            {displayPoints.length} locations<br/>
                            {totalPeople.toLocaleString()} people
                        </div>
                    </div>
                )}
            </div>

            {/* Status indicator */}
            <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-xs text-gray-600 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${simulationRun ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {simulationRun ? 'Simulation active' : 'Awaiting simulation'}
            </div>
        </div>
    );
}

export default PolicyImpactMap;
