import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { FiLock, FiUnlock, FiDownload, FiEye, FiFileText, FiAlertCircle } from "react-icons/fi";
import { MdSecurity, MdHealthAndSafety } from "react-icons/md";
import { Button, Card, Badge, Modal } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import abeEncryption from "../../utils/encryption";
import toast from "react-hot-toast";

const EncryptedRecordCard = ({ 
  record, 
  patientId, 
  doctorId,
  doctorData,
  onRequestAccess,
  onViewRecord,
  hasAccess 
}) => {
  const [checking, setChecking] = useState(false);
  const [canDecrypt, setCanDecrypt] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!record || !doctorData) return;

      setChecking(true);
      try {
        // Parse policy from blockchain
        const policy = typeof record.accessPolicy === 'string' 
          ? JSON.parse(record.accessPolicy) 
          : record.accessPolicy;

        // Create doctor attributes
        const doctorAttributes = abeEncryption.getUserAttributes(
          doctorData.walletAddress,
          "doctor",
          null,
          Number(doctorId)
        );

        // Add additional attributes from doctor profile
        if (doctorData.specialization) {
          doctorAttributes.specialty = doctorData.specialization.toLowerCase();
        }
        if (doctorData.hospital) {
          doctorAttributes.hospital = doctorData.hospital.toLowerCase();
        }

        // Check if doctor can satisfy the policy
        const canAccess = abeEncryption.evaluatePolicy(policy, doctorAttributes);
        setCanDecrypt(canAccess);
      } catch (error) {
        console.error("Error checking access:", error);
        setCanDecrypt(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [record, doctorData, doctorId]);

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${canDecrypt ? 'bg-green-100' : 'bg-gray-100'}`}>
              {canDecrypt ? (
                <FiUnlock className="h-6 w-6 text-green-600" />
              ) : (
                <FiLock className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <FiFileText className="h-5 w-5 text-blue-600" />
                Medical Record #{Number(record.id) + 1}
              </h4>
              <p className="text-sm text-gray-600">
                Uploaded: {formatDate(record.timestamp)}
              </p>
            </div>
          </div>

          {checking ? (
            <LoadingSpinner size="small" />
          ) : canDecrypt || hasAccess ? (
            <Badge className="bg-green-500 text-white">
              <FiUnlock className="w-3 h-3 mr-1" />
              Access Granted
            </Badge>
          ) : (
            <Badge className="bg-gray-500 text-white">
              <FiLock className="w-3 h-3 mr-1" />
              Restricted
            </Badge>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">IPFS Hash:</span>
              <span className="font-mono text-xs text-gray-800">
                {record.ipfsHash.substring(0, 20)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Encryption:</span>
              <span className="font-semibold text-gray-800">
                AES-256-GCM + CP-ABE
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {canDecrypt || hasAccess ? (
            <Button
              onClick={() => onViewRecord(record)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <FiEye className="h-4 w-4 mr-2" />
              View Record
            </Button>
          ) : (
            <Button
              onClick={() => onRequestAccess(record)}
              variant="outline"
              className="flex-1 border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FiAlertCircle className="h-4 w-4 mr-2" />
              Request Access
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const RequestAccessModal = ({ isOpen, onClose, record, patientId, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for access");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(patientId, record.id, reason);
      toast.success("Access request submitted successfully");
      setReason("");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to submit access request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Medical Record Access" size="medium">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Access Request</p>
              <p>
                You're requesting access to Medical Record #{Number(record?.id || 0) + 1}. 
                The patient will be notified and can approve or deny your request.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Reason for Access *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Need to review test results for ongoing treatment..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitting}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ViewRecordModal = ({ isOpen, onClose, record, decryptedData }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (!decryptedData) return;

    try {
      const url = URL.createObjectURL(decryptedData.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = decryptedData.metadata?.fileName || `medical-record-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Record downloaded successfully");
    } catch (error) {
      toast.error("Failed to download record");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medical Record Details" size="large">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <MdSecurity className="h-6 w-6 text-green-600" />
            <h4 className="font-bold text-gray-900">Decrypted Successfully</h4>
          </div>
          <p className="text-sm text-gray-700">
            This record was successfully decrypted using your doctor credentials and access policy.
          </p>
        </div>

        {decryptedData?.metadata && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Record Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">File Name:</span>
                <span className="font-medium text-gray-800">
                  {decryptedData.metadata.fileName || "medical-record.pdf"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">File Type:</span>
                <span className="font-medium text-gray-800">
                  {decryptedData.metadata.mimeType || "application/pdf"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Original Size:</span>
                <span className="font-medium text-gray-800">
                  {decryptedData.metadata.originalSize 
                    ? `${(decryptedData.metadata.originalSize / 1024).toFixed(2)} KB`
                    : "N/A"}
                </span>
              </div>
              {decryptedData.metadata.description && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Description:</span>
                  <p className="font-medium text-gray-800 mt-1">
                    {decryptedData.metadata.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {decryptedData?.data && (
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 text-center">
            <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 mb-4">
              Record decrypted and ready to download
            </p>
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Download Record
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DoctorMedicalRecordAccess = ({ patientId, doctorId, doctorData }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decrypting, setDecrypting] = useState(false);

  const { address } = useAccount();
  const {
    getPatientEncryptedRecords,
    requestRecordAccess,
    hasDoctorAccess,
  } = useHealthcareContract();

  useEffect(() => {
    loadRecords();
  }, [patientId, doctorId]);

  const loadRecords = async () => {
    if (!patientId || !doctorId) return;

    setLoading(true);
    try {
      // Check if doctor has general access
      const access = await hasDoctorAccess(patientId, doctorId);
      setHasAccess(access);

      // Fetch encrypted records
      const encryptedRecords = await getPatientEncryptedRecords(patientId);
      setRecords(encryptedRecords || []);
    } catch (error) {
      console.error("Error loading records:", error);
      toast.error("Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = (record) => {
    setSelectedRecord(record);
    setShowRequestModal(true);
  };

  const handleSubmitAccessRequest = async (patientId, recordId, reason) => {
    try {
      await requestRecordAccess(patientId, recordId, reason);
      await loadRecords();
    } catch (error) {
      throw error;
    }
  };

  const handleViewRecord = async (record) => {
    setSelectedRecord(record);
    setDecrypting(true);
    setShowViewModal(true);

    try {
      // Create doctor attributes
      const doctorAttributes = abeEncryption.getUserAttributes(
        address,
        "doctor",
        null,
        Number(doctorId)
      );

      // Add additional attributes
      if (doctorData?.specialization) {
        doctorAttributes.specialty = doctorData.specialization.toLowerCase();
      }
      if (doctorData?.hospital) {
        doctorAttributes.hospital = doctorData.hospital.toLowerCase();
      }

      console.log("[Doctor Access] Attempting decryption with attributes:", doctorAttributes);

      // Download and decrypt record from IPFS
      const decrypted = await ipfsService.downloadAndDecryptMedicalRecord(
        record.ipfsHash,
        doctorAttributes
      );

      setDecryptedData(decrypted);
      toast.success("Record decrypted successfully!");
    } catch (error) {
      console.error("[Doctor Access] Decryption error:", error);
      toast.error("Failed to decrypt record. You may not have the required access.");
      setShowViewModal(false);
    } finally {
      setDecrypting(false);
    }
  };

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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Encrypted Medical Records</h3>
              <p className="text-blue-100">
                Patient #{patientId} • {records.length} Record{records.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-center">
              {hasAccess ? (
                <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                  <FiUnlock className="w-5 h-5 mr-2" />
                  Full Access Granted
                </Badge>
              ) : (
                <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                  <FiLock className="w-5 h-5 mr-2" />
                  Limited Access
                </Badge>
              )}
            </div>
          </div>
        </div>

        {records.length === 0 ? (
          <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
            <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Medical Records
            </h3>
            <p className="text-gray-600">
              This patient hasn't uploaded any medical records yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((record, index) => (
              <EncryptedRecordCard
                key={index}
                record={record}
                patientId={patientId}
                doctorId={doctorId}
                doctorData={doctorData}
                hasAccess={hasAccess}
                onRequestAccess={handleRequestAccess}
                onViewRecord={handleViewRecord}
              />
            ))}
          </div>
        )}
      </div>

      <RequestAccessModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        patientId={patientId}
        onSubmit={handleSubmitAccessRequest}
      />

      <ViewRecordModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRecord(null);
          setDecryptedData(null);
        }}
        record={selectedRecord}
        decryptedData={decryptedData}
      />

      {decrypting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-700 font-medium">
              Decrypting medical record...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorMedicalRecordAccess;