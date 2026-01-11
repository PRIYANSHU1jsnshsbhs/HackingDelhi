import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Eye, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ReviewQueue() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?flag_status=${filter}` : "";
      const response = await axios.get(
        `${BACKEND_URL}/api/census/records${params}`,
        {
          withCredentials: true,
        }
      );
      setRecords(response.data);
    } catch (error) {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filter]);

  const handleReview = async (recordId, action) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/census/records/${recordId}/review`,
        { action },
        { withCredentials: true }
      );
      toast.success("Record reviewed successfully");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to review record");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--saffron))]"></div>
      </div>
    );
  }

  return (
    <div data-testid="review-queue" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Review Queue
        </h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            data-testid="filter-all"
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
          >
            All
          </Button>
          <Button
            data-testid="filter-review"
            onClick={() => setFilter("review")}
            variant={filter === "review" ? "default" : "outline"}
            size="sm"
          >
            Review
          </Button>
          <Button
            data-testid="filter-priority"
            onClick={() => setFilter("priority")}
            variant={filter === "priority" ? "default" : "outline"}
            size="sm"
          >
            Priority
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {records.map((record) => (
          <Card key={record.record_id} className="p-6 govt-card">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {record.name}
                  </h3>
                  <Badge
                    data-testid={`record-status-${record.record_id}`}
                    className={`status-badge status-${record.flag_status}`}
                  >
                    {record.flag_status}
                  </Badge>
                  {record.flag_source && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      Source: {record.flag_source}
                    </span>
                  )}
                  {record.exclusion_error_risk_score > 0.5 && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                      Risk: {(record.exclusion_error_risk_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <span className="ml-2 font-medium">{record.record_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Household:</span>
                    <span className="ml-2 font-medium">
                      {record.household_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age/Sex:</span>
                    <span className="ml-2 font-medium">{record.age} / {record.sex || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Region:</span>
                    <span className="ml-2 font-medium">{record.region}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Caste:</span>
                    <span className="ml-2 font-medium">{record.caste}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Income:</span>
                    <span className="ml-2 font-medium">
                      ₹{(record.income || 0).toLocaleString()}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">State:</span>
                    <span className="ml-2 font-medium">{record.state}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ration Card:</span>
                    <span className="ml-2 font-medium">{record.ration_card_type || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Employment:</span>
                    <span className="ml-2 font-medium capitalize">{record.employment_status || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Welfare Score:</span>
                    <span className="ml-2 font-medium">{record.welfare_score?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Schemes:</span>
                    <span className="ml-2 font-medium">{record.scheme_enrollment_count || 0} enrolled</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Leakage:</span>
                    <span className={`ml-2 font-medium ${record.scheme_leakage_flag === 1 ? 'text-red-600' : 'text-green-600'}`}>
                      {record.scheme_leakage_flag === 1 ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 lg:flex-col">
                <Button
                  data-testid={`view-household-${record.record_id}`}
                  onClick={() => navigate(`/household/${record.household_id}`)}
                  variant="outline"
                  size="sm"
                  className="flex-1 lg:flex-none"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                {!record.reviewed && (
                  <>
                    <Button
                      data-testid={`approve-${record.record_id}`}
                      onClick={() => handleReview(record.record_id, "approve")}
                      size="sm"
                      className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      data-testid={`verify-${record.record_id}`}
                      onClick={() =>
                        handleReview(record.record_id, "request_verification")
                      }
                      size="sm"
                      variant="outline"
                      className="flex-1 lg:flex-none"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {records.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No records found</p>
        </Card>
      )}
    </div>
  );
}

export default ReviewQueue;
