import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { FiCheck, FiX, FiRefreshCw, FiAlertCircle, FiClock } from "react-icons/fi";
import { MdSecurity, MdHealthAndSafety } from "react-icons/md";
import { FaUserMd } from "react-icons/fa";
import { Button, Card, Badge, Modal } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import toast from "react-hot-toast";

const AccessRequestCard = ({ 
  request, 
  doctor,
  record,
  onApprove, 
  onDeny,
  processing 
}) => {
  const formatDate = (timestamp) => {
    try {
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleString();
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = () => {
    if (request.isPending) {
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none">
          <FiClock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (request.isApproved) {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none">
          <FiCheck className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-none">
        <FiX className="w-3 h-3 mr-1" />
        Denied
      </Badge>
    );
  };

  return (
    <Card className={`${
      request.isPending 
        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200'
        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <FaUserMd className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                Dr. {doctor?.name || `Doctor #${request.doctorId}`}
              </h4>
              {doctor?.specialization && (
                <p className="text-sm text-gray-600">
                  {doctor.specialization}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Requested: {formatDate(request.timestamp)}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Request Details */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4">
          <h5 className="text-sm font-bold text-gray-700 mb-2">
            Request Details
          </h5>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Medical Record:</strong> #{Number(request.recordId)}
            </p>
            <p>
              <strong>Reason:</strong> {request.reason}
            </p>
            <p>
              <strong>Request ID:</strong> #{Number(request.id)}
            </p>
          </div>
        </div>

        {/* Record Info */}
        {record && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <MdHealthAndSafety className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <p className="font-semibold mb-1">Medical Record Information</p>
                <p>Record uploaded: {formatDate(record.timestamp)}</p>
                <p className="text-xs mt-1">IPFS: {record.ipfsHash?.substring(0, 20)}...</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {request.isPending && (
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => onDeny(request)}
              disabled={processing}
              variant="outline"
              className="border-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              <FiX className="h-4 w-4 mr-2" />
              Deny
            </Button>
            <Button
              onClick={() => onApprove(request)}
              disabled={processing}
              loading={processing}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        )}

        {/* Processed Message */}
        {!request.isPending && (
          <div className={`mt-4 ${
            request.isApproved 
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-red-50 border border-red-200'
          } rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              {request.isApproved ? (
                <FiCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
              ) : (
                <FiX className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className={`text-sm ${
                request.isApproved ? 'text-emerald-800' : 'text-red-800'
              }`}>
                <p className="font-semibold">
                  {request.isApproved ? 'Access Granted' : 'Access Denied'}
                </p>
                <p>
                  {request.isApproved 
                    ? 'This doctor now has access to your medical records.'
                    : 'This access request has been denied.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  request,
  doctor,
  action,
  onConfirm 
}) => {
  const isApprove = action === 'approve';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${isApprove ? 'Approve' : 'Deny'} Access Request`}
      size="medium"
    >
      <div className="space-y-6">
        <div className={`${
          isApprove 
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-red-50 border border-red-200'
        } rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <FiAlertCircle className={`h-5 w-5 mt-0.5 ${
              isApprove ? 'text-emerald-600' : 'text-red-600'
            }`} />
            <div className={`text-sm ${
              isApprove ? 'text-emerald-800' : 'text-red-800'
            }`}>
              <p className="font-semibold mb-1">
                {isApprove ? 'Grant Access' : 'Deny Access'}
              </p>
              <p>
                {isApprove 
                  ? `Dr. ${doctor?.name || `Doctor #${request?.doctorId}`} will be able to view and decrypt your medical records.`
                  : `Dr. ${doctor?.name || `Doctor #${request?.doctorId}`} will not be able to access your medical records.`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-bold text-gray-700 mb-2">Request Details</h5>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Doctor:</strong> Dr. {doctor?.name || `Doctor #${request?.doctorId}`}</p>
            {doctor?.specialization && (
              <p><strong>Specialty:</strong> {doctor.specialization}</p>
            )}
            <p><strong>Reason:</strong> {request?.reason}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={`${
              isApprove
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
            }`}
          >
            {isApprove ? (
              <>
                <FiCheck className="h-4 w-4 mr-2" />
                Approve Access
              </>
            ) : (
              <>
                <FiX className="h-4 w-4 mr-2" />
                Deny Access
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const AccessRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const { address } = useAccount();
  const {
    getPatientId,
    getPatientAccessRequests,
    getAllDoctors,
    getPatientEncryptedRecords,
    approveAccessRequest,
    denyAccessRequest
  } = useHealthcareContract();

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get patient ID
      const patId = await getPatientId(address);
      if (!patId) {
        toast.error("Patient not registered");
        return;
      }
      const patientIdNum = Number(patId);
      setPatientId(patientIdNum);

      // Load requests, doctors, and records
      const [accessRequests, allDoctors, encryptedRecords] = await Promise.all([
        getPatientAccessRequests(patientIdNum).catch(() => []),
        getAllDoctors().catch(() => []),
        getPatientEncryptedRecords(patientIdNum).catch(() => [])
      ]);

      setRequests(accessRequests || []);
      setDoctors(allDoctors || []);
      setRecords(encryptedRecords || []);

      console.log("[Access Requests] Loaded:", {
        requestCount: accessRequests?.length || 0,
        doctorCount: allDoctors?.length || 0,
        recordCount: encryptedRecords?.length || 0
      });
    } catch (error) {
      console.error("Error loading access requests:", error);
      toast.error("Failed to load access requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setConfirmAction('approve');
    setConfirmModalOpen(true);
  };

  const handleDeny = (request) => {
    setSelectedRequest(request);
    setConfirmAction('deny');
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    const loadingToast = toast.loading(
      `${confirmAction === 'approve' ? 'Approving' : 'Denying'} access request...`
    );

    try {
      // Find request index
      const requestIndex = requests.findIndex(
        r => Number(r.id) === Number(selectedRequest.id)
      );

      if (requestIndex === -1) {
        throw new Error("Request not found");
      }

      if (confirmAction === 'approve') {
        await approveAccessRequest(requestIndex);
        toast.dismiss(loadingToast);
        toast.success("Access request approved successfully!");
      } else {
        await denyAccessRequest(requestIndex);
        toast.dismiss(loadingToast);
        toast.success("Access request denied successfully!");
      }

      // Reload data
      await loadData();
      setConfirmModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Action error:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || `Failed to ${confirmAction} access request`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.isPending);
  const processedRequests = requests.filter(r => !r.isPending);

  const selectedDoctor = selectedRequest 
    ? doctors.find(d => Number(d.id) === Number(selectedRequest.doctorId))
    : null;

  return (
    <>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            Access Requests
            <MdSecurity className="h-8 w-8 text-purple-600" />
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Manage doctor access requests to your medical records
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500 rounded-xl">
                  <FiClock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingRequests.length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <FiCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {requests.filter(r => r.isApproved).length}
                  </p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500 rounded-xl">
                  <FiX className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {requests.filter(r => !r.isPending && !r.isApproved).length}
                  </p>
                  <p className="text-sm text-gray-600">Denied</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            onClick={loadData}
            variant="outline"
            className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pending Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-6">
              {pendingRequests.map((request, index) => {
                const doctor = doctors.find(d => Number(d.id) === Number(request.doctorId));
                const record = records.find(r => Number(r.id) === Number(request.recordId));
                
                return (
                  <AccessRequestCard
                    key={index}
                    request={request}
                    doctor={doctor}
                    record={record}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    processing={processing}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              History ({processedRequests.length})
            </h3>
            <div className="space-y-6">
              {processedRequests.map((request, index) => {
                const doctor = doctors.find(d => Number(d.id) === Number(request.doctorId));
                const record = records.find(r => Number(r.id) === Number(request.recordId));
                
                return (
                  <AccessRequestCard
                    key={index}
                    request={request}
                    doctor={doctor}
                    record={record}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    processing={processing}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* No Requests */}
        {requests.length === 0 && (
          <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
            <MdSecurity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No Access Requests
            </h3>
            <p className="text-gray-600">
              You don't have any access requests from doctors yet.
            </p>
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        doctor={selectedDoctor}
        action={confirmAction}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default AccessRequestsManagement;