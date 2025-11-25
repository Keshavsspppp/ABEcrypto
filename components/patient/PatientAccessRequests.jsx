import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiClock,
  FiUser,
  FiFileText,
  FiShield,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { MdSecurity, MdVerifiedUser } from "react-icons/md";
import { Card, Button, Badge } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import useAccessRequests from "../../hooks/useAccessRequests";
import { useHealthcareContract } from "../../hooks/useContract";
import toast from "react-hot-toast";

const PatientAccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patientData, setPatientData] = useState(null);

  const { address, isConnected } = useAccount();
  const router = useRouter();
  
  const {
    approveAccessRequest,
    denyAccessRequest,
    loading: actionLoading,
  } = useAccessRequests();
  
  const {
    getPatientId,
    getPatientDetails,
    getDoctorDetails,
    getUserType,
  } = useHealthcareContract();

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      
      // Get patient ID
      const patientId = await getPatientId(address);
      if (!patientId) {
        return;
      }

      // Get patient details
      const details = await getPatientDetails(patientId);
      setPatientData(details);

      // Fetch access requests - This would need to be implemented
      // For now, we'll use a placeholder
      const response = await fetch(`/api/access-requests/patient/${patientId}`).catch(() => ({ ok: false }));
      if (response.ok) {
        const data = await response.json();
        // Enrich with doctor details
        const enrichedRequests = await Promise.all(
          data.map(async (request) => {
            try {
              const doctorDetails = await getDoctorDetails(request.doctorId);
              return {
                ...request,
                doctorName: doctorDetails.name,
                doctorSpeciality: doctorDetails.speciality,
              };
            } catch (e) {
              return request;
            }
          })
        );
        setRequests(enrichedRequests);
      } else {
        // Fallback to empty array if API not available
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching access requests:", error);
      toast.error("Failed to load access requests");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address) {
        router.push("/patient/register");
        return;
      }

      try {
        setLoading(true);

        // Check if user is a patient
        const userInfo = await getUserType(address);
        if (!userInfo || userInfo.userType !== "patient") {
          router.push("/patient/register");
          return;
        }

        await fetchRequests();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address]);

  const handleApprove = async (requestId) => {
    try {
      await approveAccessRequest(requestId);
      await fetchRequests();
      toast.success("Access request approved!");
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleDeny = async (requestId) => {
    try {
      await denyAccessRequest(requestId);
      await fetchRequests();
      toast.success("Access request denied");
    } catch (error) {
      console.error("Error denying request:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-2xl mb-6">
            <FiShield className="h-16 w-16 text-white animate-pulse" />
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-6 text-gray-700 font-bold text-lg">
            Loading Access Requests...
          </p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 shadow-2xl">
          <div className="text-center py-12">
            <div className="p-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-fit mx-auto shadow-2xl mb-6">
              <FiAlertCircle className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Patient Registration Required
            </h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              You need to register as a patient to manage access requests.
            </p>
            <Button
              onClick={() => router.push("/patient/register")}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 w-full shadow-lg"
            >
              Register as Patient
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-8 text-white shadow-2xl border-2 border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              size="small"
              onClick={() => router.push("/patient/dashboard")}
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm shadow-lg"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
                <FiShield className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  Access Requests
                  <MdSecurity className="h-8 w-8" />
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage doctor access to your medical records
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchRequests}
            loading={refreshing}
            disabled={refreshing}
            className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm shadow-lg"
          >
            {refreshing ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Refreshing...</span>
              </>
            ) : (
              <>
                <FiRefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        <Card className="bg-white bg-opacity-10 border-white border-opacity-20 backdrop-blur-sm shadow-lg">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <h3 className="text-lg font-bold mb-1">
                  {patientData.name || `Patient #${patientData.id}`}
                </h3>
                <p className="text-blue-100 font-medium">Patient ID: #{patientData.id}</p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none shadow-md">
                  <MdVerifiedUser className="w-4 h-4 mr-1" />
                  Registered
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Access Requests List */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <MdSecurity className="h-6 w-6 text-blue-600" />
            Pending Access Requests ({requests.filter(r => r.status === "pending").length})
          </h2>

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
                      {request.doctorSpeciality && (
                        <p className="text-sm text-gray-600 font-medium mb-1">
                          Speciality: {request.doctorSpeciality}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FiFileText className="h-3 w-3" />
                        Requesting access to Medical Record #{request.medicalRecordIndex + 1}
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
      ) : (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
          <div className="p-6 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full w-fit mx-auto mb-6 shadow-lg">
            <FiShield className="h-16 w-16 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Access Requests
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            You don't have any access requests at the moment. Requests from doctors will appear here.
          </p>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 shadow-xl">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
              <MdSecurity className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                About Access Requests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border-2 border-indigo-100 shadow-sm">
                  <h4 className="font-bold text-indigo-900 mb-3">How It Works</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiShield className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Your medical records are protected by encryption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiUser className="h-4 w-4 text-purple-600 mt-0.5" />
                      <span>Doctors with the same speciality can access records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiFileText className="h-4 w-4 text-teal-600 mt-0.5" />
                      <span>Other specialists need your approval</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-indigo-100 shadow-sm">
                  <h4 className="font-bold text-indigo-900 mb-3">Your Control</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Review each access request carefully</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiX className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>You can approve or deny any request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MdVerifiedUser className="h-4 w-4 text-orange-600 mt-0.5" />
                      <span>All access is logged and auditable</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientAccessRequests;
