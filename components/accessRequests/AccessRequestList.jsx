import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { FiCheck, FiX, FiClock, FiUser, FiFileText, FiShield } from "react-icons/fi";
import { MdSecurity, MdVerifiedUser } from "react-icons/md";
import { Card, Button, Badge } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import useAccessRequests from "../../hooks/useAccessRequests";
import { useHealthcareContract } from "../../hooks/useContract";
import toast from "react-hot-toast";

const AccessRequestList = ({ patientId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { address } = useAccount();
  
  const { 
    approveAccessRequest, 
    denyAccessRequest,
    loading: actionLoading 
  } = useAccessRequests();
  
  const { getDoctorDetails } = useHealthcareContract();

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      // This would need to be implemented to fetch from contract
      // For now, we'll use a placeholder
      const response = await fetch(`/api/access-requests/${patientId}`).catch(() => ({ ok: false }));
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching access requests:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchRequests();
    }
  }, [patientId]);

  const handleApprove = async (requestId) => {
    try {
      await approveAccessRequest(requestId);
      await fetchRequests();
      toast.success("Access request approved!");
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleDeny = async (requestId) => {
    try {
      await denyAccessRequest(requestId);
      await fetchRequests();
      toast.success("Access request denied");
    } catch (error) {
      console.error("Error denying request:", error);
      toast.error("Failed to deny request");
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading access requests...</p>
        </div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
        <div className="p-6 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full w-fit mx-auto mb-6 shadow-lg">
          <FiShield className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No Access Requests
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          You don't have any pending access requests at the moment.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MdSecurity className="h-6 w-6 text-blue-600" />
          Access Requests ({requests.length})
        </h3>
        <Button
          variant="outline"
          size="small"
          onClick={fetchRequests}
          disabled={refreshing}
          className="border-2 border-blue-300"
        >
          {refreshing ? <LoadingSpinner size="small" /> : "Refresh"}
        </Button>
      </div>

      {requests.map((request) => (
        <Card
          key={request.id}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <FiUser className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Dr. {request.doctorName || `Doctor #${request.doctorId}`}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FiFileText className="h-3 w-3" />
                    Medical Record #{request.medicalRecordIndex + 1}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                    <FiClock className="h-3 w-3" />
                    {new Date(request.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <Badge
                className={`${
                  request.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : request.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                } border-none shadow-md`}
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">Reason for Request:</p>
              <p className="text-gray-600 leading-relaxed">{request.reason}</p>
            </div>

            {request.status === "pending" && (
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleDeny(request.id)}
                  disabled={actionLoading}
                  className="border-2 border-red-300 text-red-700 hover:bg-red-50 shadow-md"
                >
                  <FiX className="h-4 w-4 mr-2" />
                  Deny
                </Button>
                <Button
                  size="small"
                  onClick={() => handleApprove(request.id)}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                >
                  <FiCheck className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AccessRequestList;
