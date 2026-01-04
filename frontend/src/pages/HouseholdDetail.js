import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import ForceGraph2D from 'react-force-graph-2d';

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

  const graphData = {
    nodes: household.graph.nodes.map(node => ({
      id: node.id,
      name: node.name,
      val: 10,
      color: node.relation === 'head' ? '#FF6B35' : '#4ECDC4'
    })),
    links: household.graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target
    }))
  };

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
          <div className="bg-gray-50 rounded-lg" style={{ height: '400px' }}>
            {graphData.nodes.length > 0 ? (
              <ForceGraph2D
                graphData={graphData}
                nodeLabel="name"
                nodeAutoColorBy="color"
                linkColor={() => '#cbd5e1'}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = node.color;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                  ctx.fill();
                  ctx.fillStyle = '#1f2937';
                  ctx.fillText(label, node.x, node.y + 10);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">No relationship data available</p>
              </div>
            )}
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