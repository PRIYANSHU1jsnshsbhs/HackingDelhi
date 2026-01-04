import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function HouseholdDetail() {
  const { householdId } = useParams();
  const navigate = useNavigate();
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHousehold = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/census/household/${householdId}`,
          { withCredentials: true }
        );
        setHousehold(response.data);
      } catch (error) {
        console.error('Failed to fetch household:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [householdId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--saffron))]"></div>
      </div>
    );
  }

  if (!household || household.members.length === 0) {
    return (
      <div className="space-y-6">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-12 text-center">
          <p className="text-gray-500">Household not found</p>
        </Card>
      </div>
    );
  }

  // Simple graph visualization using SVG
  const GraphVisualization = useCallback(() => {
    const nodes = household.graph.nodes;
    const edges = household.graph.edges;
    
    if (nodes.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No relationship data available</p>
        </div>
      );
    }

    // Calculate positions in a circular layout
    const centerX = 200;
    const centerY = 180;
    const radius = 120;
    
    const nodePositions = nodes.map((node, index) => {
      const angle = (index * 2 * Math.PI) / nodes.length - Math.PI / 2;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    return (
      <svg width="100%" height="100%" viewBox="0 0 400 360" className="bg-gray-50 rounded-lg">
        {/* Draw edges */}
        {edges.map((edge, index) => {
          const sourceNode = nodePositions.find(n => n.id === edge.source);
          const targetNode = nodePositions.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;
          return (
            <line
              key={index}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Draw nodes */}
        {nodePositions.map((node, index) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.relation === 'head' ? 25 : 20}
              fill={node.relation === 'head' ? '#FF6B35' : '#4ECDC4'}
              stroke="white"
              strokeWidth="3"
            />
            <text
              x={node.x}
              y={node.y + 40}
              textAnchor="middle"
              fill="#1f2937"
              fontSize="11"
              fontWeight="500"
            >
              {node.name}
            </text>
            <text
              x={node.x}
              y={node.y + 52}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="9"
            >
              ({node.relation})
            </text>
          </g>
        ))}
      </svg>
    );
  }, [household.graph]);

  return (
    <div data-testid="household-detail" className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Review Queue
        </Button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Household Details</h1>
        <p className="text-base mt-1 text-gray-600">ID: {householdId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Household Members
            </h2>
            <span className="text-sm font-medium text-gray-500">{household.members.length} members</span>
          </div>

          <div className="space-y-3">
            {household.members.map((member) => (
              <div
                key={member.record_id}
                data-testid={`member-${member.record_id}`}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  {member.flag_status !== 'normal' && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Relation:</span>
                    <span className="ml-2 font-medium">{member.relation}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium">{member.age}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Caste:</span>
                    <span className="ml-2 font-medium">{member.caste}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Income:</span>
                    <span className="ml-2 font-medium">₹{member.income.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Relationship Graph</h2>
          <div className="rounded-lg" style={{ height: '400px' }}>
            <GraphVisualization />
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Graph anomalies will be highlighted once ML integration is enabled.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default HouseholdDetail;