import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { FiCheck, FiX, FiClock, FiUserCheck, FiAlertCircle } from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import { FaUserMd } from "react-icons/fa";
import { Button, Card, Badge, Modal } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
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
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getStatusBadge = () => {
    if (request.isPending) {
      return (
        <Badge className="bg-yellow-500 text-white">
          <FiClock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (request.isApproved) {
      return (
        <Badge className="bg-green-500 text-white">
          <FiCheck className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500 text-white">
        <FiX className="w-3 h-3 mr-1" />
        Denied
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaUserMd className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">
                Dr. {doctor?.name || `Doctor #${request.doctorId}`}
              </h4>
              <p className="text-sm text-gray-600">
                {doctor?.specialization || "General Practice"}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Record:</span>
              <span className="font-medium text-gray-800">
                Medical Record #{Number(request.recordId) + 1}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Requested:</span>
              <span className="font-medium text-gray-800">
                {formatDate(request.timestamp)}
              </span>
            </div>
            <div className="pt-2 border-t border-purple-200">
              <span className="text-gray-600">Reason:</span>
              <p className="font-medium text-gray-800 mt-1">
                {request.reason || "No reason provided"}
              </p>
            </div>
          </div>
        </div>

        {request.isPending && (
          <div className="flex gap-2">
            <Button
              onClick={() => onApprove(request)}
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => onDeny(request)}
              disabled={processing}
              variant="outline"
              className="flex-1 border-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              <FiX className="h-4 w-4 mr-2" />
              Deny
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  request, 
  doctor,
  action,
  processing 
}) => {
  const isApproval = action === 'approve';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${isApproval ? 'Approve' : 'Deny'} Access Request`}
      size="medium"
    >
      <div className="space-y-4">
        <div className={`border-2 rounded-lg p-4 ${
          isApproval 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {isApproval ? (
              <FiUserCheck className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <FiAlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className={`text-sm ${isApproval ? 'text-green-800' : 'text-red-800'}`}>
              <p className="font-semibold mb-1">
                {isApproval ? 'Grant Access' : 'Deny Access'}
              </p>
              <p>
                {isApproval 
                  ? `You're about to grant Dr. ${doctor?.name || `Doctor #${request?.doctorId}`} access to your medical record #${Number(request?.recordId || 0) + 1}. They will be able to view and decrypt this record.`
                  : `You're about to deny Dr. ${doctor?.name || `Doctor #${request?.doctorId}`}'s request to access your medical record #${Number(request?.recordId || 0) + 1}.`
                }
              </p>
            </div>
          </div>
        </div>

        {request && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Request Details</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Doctor:</span> Dr. {doctor?.name || `Doctor #${request.doctorId}`}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Specialty:</span> {doctor?.specialization || "General Practice"}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Reason:</span> {request.reason || "No reason provided"}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={processing}
            className={isApproval 
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            }
          >
            {processing ? "Processing..." : `Confirm ${isApproval ? 'Approval' : 'Denial'}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const AccessRequestManagement = ({ patientId }) => {
  const [requests, setRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const {
    getPatientAccessRequests,
    getAllDoctors,
    getPatientEncryptedRecords,
    approveAccessRequest,
    denyAccessRequest,
  } = useHealthcareContract();

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    if (!patientId) return;

    setLoading(true);
    try {
      const [accessRequests, allDoctors, encryptedRecords] = await Promise.all([
        getPatientAccessRequests(patientId),
        getAllDoctors(),
        getPatientEncryptedRecords(patientId),
      ]);

      setRequests(accessRequests || []);
      setDoctors(allDoctors || []);
      setRecords(encryptedRecords || []);
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
    setShowConfirmModal(true);
  };

  const handleDeny = (request) => {
    setSelectedRequest(request);
    setConfirmAction('deny');
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    const loadingToast = toast.loading(
      `${confirmAction === 'approve' ? 'Approving' : 'Denying'} access request...`
    );

    try {
      // Find request index in the array
      const requestIndex = requests.findIndex(r => r.id === selectedRequest.id);
      
      if (requestIndex === -1) {
        throw new Error("Request not found");
      }

      if (confirmAction === 'approve') {
        await approveAccessRequest(requestIndex);
        toast.success("Access request approved successfully!");
      } else {
        await denyAccessRequest(requestIndex);
        toast.success("Access request denied successfully!");
      }

      // Reload data
      await loadData();
      
      setShowConfirmModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error(`Error ${confirmAction}ing request:`, error);
      toast.error(`Failed to ${confirmAction} access request`);
    } finally {
      toast.dismiss(loadingToast);
      setProcessing(false);
    }
  };

  const getDoctorById = (doctorId) => {
    return doctors.find(d => Number(d.id) === Number(doctorId));
  };

  const getRecordById = (recordId) => {
    return records.find((r, index) => index === Number(recordId));
  };

  const pendingRequests = requests.filter(r => r.isPending);
  const processedRequests = requests.filter(r => !r.isPending);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Access Request Management</h3>
              <p className="text-purple-100">
                Review and manage doctor access requests to your medical records
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{pendingRequests.length}</div>
              <div className="text-sm text-purple-100">Pending Requests</div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MdSecurity className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Your Privacy is Protected</p>
              <p>
                All medical records are encrypted with hybrid AES-256-GCM + CP-ABE encryption. 
                Only doctors you approve can decrypt and view your records.
              </p>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="h-5 w-5 text-yellow-600" />
              Pending Requests ({pendingRequests.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map((request, index) => (
                <AccessRequestCard
                  key={index}
                  request={request}
                  doctor={getDoctorById(request.doctorId)}
                  record={getRecordById(request.recordId)}
                  onApprove={handleApprove}
                  onDeny={handleDeny}
                  processing={processing}
                />
              ))}
            </div>
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCheck className="h-5 w-5 text-green-600" />
              Request History ({processedRequests.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processedRequests.map((request, index) => (
                <AccessRequestCard
                  key={index}
                  request={request}
                  doctor={getDoctorById(request.doctorId)}
                  record={getRecordById(request.recordId)}
                  onApprove={handleApprove}
                  onDeny={handleDeny}
                  processing={processing}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Requests */}
        {requests.length === 0 && (
          <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
            <FiAlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Access Requests
            </h3>
            <p className="text-gray-600">
              You don't have any medical record access requests at the moment.
            </p>
          </Card>
        )}
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedRequest(null);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirm}
        request={selectedRequest}
        doctor={selectedRequest ? getDoctorById(selectedRequest.doctorId) : null}
        action={confirmAction}
        processing={processing}
      />
    </>
  );
};

export default AccessRequestManagement;