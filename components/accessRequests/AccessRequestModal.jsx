import { useState } from "react";
import { FiX, FiSend, FiAlertCircle, FiLock, FiFileText } from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import { Card, Button } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";

const AccessRequestModal = ({ isOpen, onClose, patient, medicalRecordIndex, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(patient.id, medicalRecordIndex, reason);
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error submitting access request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-gradient-to-br from-white to-blue-50 rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border-2 border-blue-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                <FiLock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Request Access
                  <MdSecurity className="h-6 w-6 text-blue-600" />
                </h3>
                <p className="text-gray-600">
                  {patient?.name || `Patient #${patient?.id}`} - Record #{medicalRecordIndex + 1}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="small"
              onClick={onClose}
              className="border-2 border-gray-300 hover:bg-gray-50 shadow-md"
            >
              <FiX className="h-5 w-5" />
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-lg mb-6">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-lg">
                  <FiAlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-orange-900 mb-2">
                    Access Request Information
                  </p>
                  <p className="text-sm text-orange-800">
                    This medical record is protected by attribute-based encryption. 
                    You need the patient's approval to access this record since you don't 
                    have the same speciality as the doctor who created it.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FiFileText className="h-4 w-4 text-blue-600" />
                Reason for Access Request *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need access to this medical record..."
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md"
                rows="5"
                required
              />
              <p className="mt-2 text-xs text-gray-600">
                The patient will review your request and reason before deciding whether to grant access.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="border-2 border-gray-300 hover:bg-gray-50 shadow-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting || !reason.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="small" color="white" />
                    <span>Submitting Request...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiSend className="h-4 w-4" />
                    <span>Submit Request</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessRequestModal;
