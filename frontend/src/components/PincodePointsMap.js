import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// India bounds (approximate)
const INDIA_BOUNDS = {
    minLat: 8,
    maxLat: 37,
    minLon: 68,
    maxLon: 97
};

// Color scales based on metric
const getPointColor = (point, colorMetric) => {
    let value, maxValue;

    switch (colorMetric) {
        case 'welfare':
            value = point.avg_welfare;
            maxValue = 1;
            // Green gradient - higher welfare is better (green)
            const welfareIntensity = Math.min(1, value / maxValue);
            if (welfareIntensity > 0.7) return 'rgba(22, 163, 74, 0.8)'; // Green
            if (welfareIntensity > 0.5) return 'rgba(34, 197, 94, 0.7)';
            if (welfareIntensity > 0.3) return 'rgba(251, 191, 36, 0.7)'; // Yellow
            return 'rgba(239, 68, 68, 0.7)'; // Red for low welfare

        case 'income':
            value = point.avg_income;
            maxValue = 100000;
            const incomeRatio = Math.min(1, value / maxValue);
            // Blue gradient
            const b = Math.floor(150 + incomeRatio * 105);
            return `rgba(59, ${Math.floor(100 + incomeRatio * 50)}, ${b}, 0.7)`;

        case 'eligible':
            value = point.eligible_pct;
            // Red-Yellow-Green based on eligibility (higher = more needy = red)
            if (value > 70) return 'rgba(220, 38, 38, 0.8)'; // Dark red
            if (value > 50) return 'rgba(249, 115, 22, 0.7)'; // Orange
            if (value > 30) return 'rgba(234, 179, 8, 0.7)'; // Yellow
            return 'rgba(34, 197, 94, 0.6)'; // Green

        case 'priority':
            value = point.priority_count;
            if (value > 5) return 'rgba(185, 28, 28, 0.9)'; // Dark red
            if (value > 2) return 'rgba(239, 68, 68, 0.8)';
            if (value > 0) return 'rgba(251, 146, 60, 0.7)';
            return 'rgba(156, 163, 175, 0.5)'; // Gray

        default: // population/count
            value = point.count;
            maxValue = 100;
            const countRatio = Math.min(1, value / maxValue);
            // Orange gradient
            const intensity = Math.floor(100 + countRatio * 155);
            return `rgba(255, ${Math.floor(107 - countRatio * 60)}, ${Math.floor(53 - countRatio * 53)}, ${0.5 + countRatio * 0.4})`;
    }
};

function PincodePointsMap({
    stateFilter = 'all',
    colorMetric = 'eligible',
    incomeThreshold = 50000,
    casteFilter = 'all',
    sexFilter = 'all',
    occupationFilter = 'all',
    housingTypeFilter = 'all',
    householdSizeMin = 1,
    householdSizeMax = 10,
    onPointClick
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [stats, setStats] = useState({ total_pincodes: 0, total_records: 0 });

    // Fetch pincode points
    useEffect(() => {
        const fetchPoints = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BACKEND_URL}/api/analytics/pincode-points`, {
                    params: {
                        limit: 10000,
                        state_filter: stateFilter !== 'all' ? stateFilter : null,
                        income_threshold: incomeThreshold,
                        caste_filter: casteFilter !== 'all' ? casteFilter : null,
                        sex_filter: sexFilter !== 'all' ? sexFilter : null,
                        occupation_filter: occupationFilter !== 'all' ? occupationFilter : null,
                        housing_type_filter: housingTypeFilter !== 'all' ? housingTypeFilter : null,
                        household_size_min: householdSizeMin,
                        household_size_max: householdSizeMax
                    },
                    withCredentials: true
                });
                setPoints(response.data.points || []);
                setStats({
                    total_pincodes: response.data.total_pincodes || 0,
                    total_records: response.data.total_records || 0
                });
            } catch (error) {
                console.error('Failed to fetch pincode points:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPoints();
    }, [stateFilter, incomeThreshold, casteFilter, sexFilter, occupationFilter, housingTypeFilter, householdSizeMin, householdSizeMax]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: Math.max(400, rect.width * 0.6) });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Convert lat/lon to canvas coordinates
    const latLonToCanvas = useCallback((lat, lon) => {
        const { width, height } = dimensions;
        const padding = 20;

        // Calculate bounds based on state filter
        let bounds = INDIA_BOUNDS;
        if (stateFilter !== 'all' && points.length > 0) {
            const statePts = points.filter(p => p.state === stateFilter);
            if (statePts.length > 0) {
                bounds = {
                    minLat: Math.min(...statePts.map(p => p.lat)) - 0.5,
                    maxLat: Math.max(...statePts.map(p => p.lat)) + 0.5,
                    minLon: Math.min(...statePts.map(p => p.lon)) - 0.5,
                    maxLon: Math.max(...statePts.map(p => p.lon)) + 0.5
                };
            }
        }

        const x = padding + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (width - 2 * padding);
        const y = padding + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (height - 2 * padding);

        return { x, y };
    }, [dimensions, stateFilter, points]);

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || points.length === 0) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = dimensions;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#fef3c7');
        gradient.addColorStop(1, '#fff7ed');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * width / 10, 0);
            ctx.lineTo(i * width / 10, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * height / 10);
            ctx.lineTo(width, i * height / 10);
            ctx.stroke();
        }

        // Sort points by count for proper layering (smaller on top)
        const sortedPoints = [...points].sort((a, b) => b.count - a.count);

        // Draw points
        sortedPoints.forEach(point => {
            const { x, y } = latLonToCanvas(point.lat, point.lon);

            // Calculate radius based on population
            const minRadius = 3;
            const maxRadius = 15;
            const radius = minRadius + Math.min(maxRadius - minRadius, Math.log(point.count + 1) * 2);

            // Get color based on metric
            const color = getPointColor(point, colorMetric);

            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Draw border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Draw hovered point highlight
        if (hoveredPoint) {
            const { x, y } = latLonToCanvas(hoveredPoint.lat, hoveredPoint.lon);
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

    }, [points, dimensions, colorMetric, hoveredPoint, latLonToCanvas]);

    // Handle mouse move for tooltips
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Find closest point
        let closest = null;
        let minDist = 25; // Max distance to trigger hover

        points.forEach(point => {
            const { x, y } = latLonToCanvas(point.lat, point.lon);
            const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                closest = point;
            }
        });

        setHoveredPoint(closest);
    }, [points, latLonToCanvas]);

    const handleClick = useCallback((e) => {
        if (hoveredPoint && onPointClick) {
            onPointClick(hoveredPoint);
        }
    }, [hoveredPoint, onPointClick]);

    const formatNumber = (num) => {
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num?.toLocaleString() || '0';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading {formatNumber(stats.total_records)} points...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full">
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={handleClick}
                className="rounded-lg cursor-crosshair"
                style={{ width: '100%', height: dimensions.height }}
            />

            {/* Stats */}
            <div className="absolute top-2 left-2 bg-white/90 rounded-lg px-3 py-2 text-xs shadow border">
                <p className="font-semibold text-gray-800">{formatNumber(stats.total_records)} people</p>
                <p className="text-gray-600">{formatNumber(stats.total_pincodes)} pincodes</p>
            </div>

            {/* Legend */}
            <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg p-2 text-xs shadow border">
                <p className="font-semibold text-gray-700 mb-1">
                    {colorMetric === 'welfare' && 'Welfare Score'}
                    {colorMetric === 'income' && 'Avg Income'}
                    {colorMetric === 'eligible' && 'Eligibility %'}
                    {colorMetric === 'priority' && 'Priority Cases'}
                    {colorMetric === 'count' && 'Population'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                    {colorMetric === 'eligible' ? (
                        <>
                            <span className="text-green-600">Low</span>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <div className="w-3 h-3 rounded-full bg-red-600"></div>
                            <span className="text-red-600">High</span>
                        </>
                    ) : colorMetric === 'welfare' ? (
                        <>
                            <span className="text-red-600">Low</span>
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-green-600">High</span>
                        </>
                    ) : (
                        <>
                            <span className="text-gray-500">Low</span>
                            <div className="w-3 h-3 rounded-full bg-orange-200"></div>
                            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                            <span className="text-orange-600">High</span>
                        </>
                    )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Size = population</p>
            </div>

            {/* Tooltip */}
            {hoveredPoint && (
                <div
                    className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none z-10"
                    style={{ left: '50%', top: 10, transform: 'translateX(-50%)' }}
                >
                    <p className="font-semibold text-gray-900 text-sm">Pincode: {hoveredPoint.pincode}</p>
                    <p className="text-xs text-gray-600">{hoveredPoint.state}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                        <div>
                            <span className="text-gray-500">Population:</span>
                            <span className="font-medium ml-1">{formatNumber(hoveredPoint.count)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Eligible:</span>
                            <span className="font-medium ml-1 text-green-600">{hoveredPoint.eligible_pct}%</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Avg Income:</span>
                            <span className="font-medium ml-1">₹{formatNumber(hoveredPoint.avg_income)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Welfare:</span>
                            <span className="font-medium ml-1">{hoveredPoint.avg_welfare}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Priority:</span>
                            <span className="font-medium ml-1 text-red-600">{hoveredPoint.priority_count}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Leakage:</span>
                            <span className="font-medium ml-1 text-orange-600">{hoveredPoint.leakage_count}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PincodePointsMap;
