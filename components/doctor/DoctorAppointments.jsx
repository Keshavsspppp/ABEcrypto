import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
  FiEye,
  FiFileText,
  FiActivity,
  FiFilter,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiMoreVertical,
  FiEdit3,
  FiPhone,
  FiMail,
  FiArrowLeft,
  FiShield,
  FiInfo,
  FiRefreshCw,
} from "react-icons/fi";
import {
  MdVideoCall,
  MdLocalHospital,
  MdVerifiedUser,
  MdHealthAndSafety,
  MdMedicalServices,
  MdSchedule,
  MdEmergency,
  MdBiotech,
  MdSecurity,
  MdPayment,
  MdInventory,
  MdMonitorHeart,
  MdPersonalInjury,
  MdAccountBalance,
  MdFavorite,
} from "react-icons/md";
import {
  FaUserMd,
  FaStethoscope,
  FaHospitalUser,
  FaPrescriptionBottleAlt,
  FaHeartbeat,
  FaNotesMedical,
  FaAmbulance,
  FaSyringe,
  FaUserNurse,
  FaMicroscope,
  FaXRay,
  FaThermometerHalf,
  FaBrain,
  FaEye,
  FaTooth,
  FaBone,
  FaLungs,
} from "react-icons/fa";
import { Card, Button, Input, Select, Badge, Modal } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import { formatDate, formatTime, getRelativeTime } from "../../utils/helpers";
import toast from "react-hot-toast";

const AppointmentCard = ({
  appointment,
  onViewDetails,
  onCompleteAppointment,
  onViewPatient,
  doctorData,
}) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getPatientDetails } = useHealthcareContract();

  useEffect(() => {
    const fetchPatientData = async () => {
      if (appointment.patientId) {
        try {
          setLoading(true);
          const patient = await getPatientDetails(appointment.patientId);
          if (patient?.IPFS_URL) {
            const hash = patient.IPFS_URL.replace(
              "https://gateway.pinata.cloud/ipfs/",
              ""
            );
            const data = await ipfsService.fetchFromIPFS(hash);
            setPatientData({ ...patient, ...data });
          } else {
            setPatientData(patient);
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatientData();
  }, [appointment.patientId]);

  const getStatusColor = () => {
    if (appointment.isOpen) {
      const appointmentDate = new Date(appointment.appointmentDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const apptDay = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate()
      );

      if (apptDay.getTime() === today.getTime()) {
        return "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200";
      } else if (apptDay > today) {
        return "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200";
      } else {
        return "bg-gradient-to-br from-red-50 to-pink-50 border-red-200";
      }
    } else {
      return "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    if (!appointment.isOpen) {
      return <FiCheckCircle className="h-5 w-5 text-emerald-600" />;
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const apptDay = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate()
    );

    if (apptDay.getTime() === today.getTime()) {
      return <FiAlertCircle className="h-5 w-5 text-emerald-600" />;
    } else if (apptDay > today) {
      return <FiClock className="h-5 w-5 text-blue-600" />;
    } else {
      return <FiX className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusText = () => {
    if (!appointment.isOpen) return "Completed";

    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const apptDay = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate()
    );

    if (apptDay.getTime() === today.getTime()) {
      return "Today";
    } else if (apptDay > today) {
      return "Upcoming";
    } else {
      return "Overdue";
    }
  };

  const getStatusBadge = () => {
    if (!appointment.isOpen) {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none">
          <FiCheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const apptDay = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate()
    );

    if (apptDay.getTime() === today.getTime()) {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none">
          <FiAlertCircle className="w-3 h-3 mr-1" />
          Today
        </Badge>
      );
    } else if (apptDay > today) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none">
          <FiClock className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none">
          <FiX className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }
  };

  return (
    <div
      className={`transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${getStatusColor()} border-2 border-l-8 rounded-2xl overflow-hidden`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-teal-200">
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MdSchedule className="h-5 w-5 text-teal-600" />
                Appointment #{appointment.id}
              </h3>
              <p className="text-gray-600 font-medium flex items-center gap-2">
                <FiCalendar className="h-4 w-4" />
                {getStatusText()} • {appointment.appointmentDate}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge()}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
              <FiMoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Enhanced Patient Info */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-teal-200 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center border-2 border-teal-200 shadow-lg">
              {loading ? (
                <LoadingSpinner size="small" />
              ) : patientData?.profileImage ? (
                <img
                  src={ipfsService.getIPFSUrl(patientData.profileImage)}
                  alt="Patient"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <FaHospitalUser className="h-8 w-8 text-teal-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-1">
                {patientData?.name || `Patient #${appointment.patientId}`}
              </h4>
              <p className="text-gray-600 font-medium flex items-center gap-2">
                <MdSecurity className="h-4 w-4" />
                Patient ID: #{appointment.patientId}
              </p>
              {patientData?.age && (
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <FiUser className="h-3 w-3" />
                  Age: {patientData.age} • {patientData.gender}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="small"
              onClick={() => onViewPatient(patientData)}
              className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <FiEye className="h-4 w-4 mr-2" />
              View Patient
            </Button>
          </div>
        </div>

        {/* Enhanced Appointment Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <FiClock className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-bold text-blue-900">Time Slot</p>
              </div>
              <p className="text-blue-800 font-medium">
                {appointment.from} - {appointment.to}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <FiCalendar className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-bold text-purple-900">Date</p>
              </div>
              <p className="text-purple-800 font-medium">
                {appointment.appointmentDate}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center space-x-2 mb-2">
              <MdMedicalServices className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-bold text-emerald-900">
                Medical Condition
              </p>
            </div>
            <p className="text-emerald-800 font-medium">
              {appointment.condition}
            </p>
          </div>

          {appointment.message && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <FaNotesMedical className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-bold text-blue-900">
                  Patient Message
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                <p className="text-blue-800 italic">"{appointment.message}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="small"
            onClick={() => onViewDetails(appointment)}
            className="flex-1 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <FiEye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          {appointment.isOpen && (
            <>
              <Button
                size="small"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                <MdVideoCall className="h-4 w-4 mr-2" />
                Start Call
              </Button>
              <Button
                size="small"
                onClick={() => onCompleteAppointment(appointment)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                <FiCheck className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AppointmentDetailsModal = ({
  appointment,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");

  const { getPatientDetails, getPatientMedicalHistory } =
    useHealthcareContract();

  useEffect(() => {
    const fetchDetails = async () => {
      if (appointment && isOpen) {
        try {
          setLoading(true);
          const [patient, medicalHistory] = await Promise.all([
            getPatientDetails(appointment.patientId),
            getPatientMedicalHistory(appointment.patientId),
          ]);

          if (patient?.IPFS_URL) {
            const hash = patient.IPFS_URL.replace(
              "https://gateway.pinata.cloud/ipfs/",
              ""
            );
            const data = await ipfsService.fetchFromIPFS(hash);
            setPatientData({ ...patient, ...data, medicalHistory });
          } else {
            setPatientData({ ...patient, medicalHistory });
          }
        } catch (error) {
          console.error("Error fetching appointment details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDetails();
  }, [appointment, isOpen]);

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details"
      size="large"
    >
      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {/* Enhanced Appointment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MdSchedule className="h-6 w-6 text-blue-600" />
                  Appointment Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-sm font-bold text-blue-900 mb-1">
                      Appointment ID
                    </p>
                    <p className="text-blue-800 font-medium">
                      #{appointment.id}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-sm font-bold text-blue-900 mb-1">
                      Date & Time
                    </p>
                    <p className="text-blue-800 font-medium">
                      {appointment.appointmentDate}
                    </p>
                    <p className="text-blue-700">
                      {appointment.from} - {appointment.to}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-sm font-bold text-blue-900 mb-2">
                      Status
                    </p>
                    <Badge
                      className={
                        appointment.isOpen
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none"
                          : "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none"
                      }
                    >
                      {appointment.isOpen ? "Active" : "Completed"}
                    </Badge>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-sm font-bold text-blue-900 mb-1">
                      Medical Condition
                    </p>
                    <p className="text-blue-800 font-medium">
                      {appointment.condition}
                    </p>
                  </div>
                  {appointment.message && (
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-2">
                        Patient Message
                      </p>
                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                        <p className="text-blue-800 italic">
                          "{appointment.message}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaHospitalUser className="h-6 w-6 text-teal-600" />
                  Patient Information
                </h3>
                {patientData && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-teal-200">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center border-2 border-teal-200">
                          {patientData.profileImage ? (
                            <img
                              src={ipfsService.getIPFSUrl(
                                patientData.profileImage
                              )}
                              alt="Patient"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <FaHospitalUser className="h-8 w-8 text-teal-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {patientData.name ||
                              `Patient #${appointment.patientId}`}
                          </h4>
                          <p className="text-gray-600">
                            Patient ID: #{appointment.patientId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {patientData.age && (
                      <div className="bg-white rounded-xl p-4 border border-teal-200">
                        <p className="text-sm font-bold text-teal-900 mb-1">
                          Age & Gender
                        </p>
                        <p className="text-teal-800 font-medium">
                          {patientData.age} years old, {patientData.gender}
                        </p>
                      </div>
                    )}

                    {patientData.bloodType && (
                      <div className="bg-white rounded-xl p-4 border border-teal-200">
                        <p className="text-sm font-bold text-teal-900 mb-1">
                          Blood Type
                        </p>
                        <p className="text-teal-800 font-medium">
                          {patientData.bloodType}
                        </p>
                      </div>
                    )}

                    {patientData.phone && (
                      <div className="bg-white rounded-xl p-4 border border-teal-200">
                        <p className="text-sm font-bold text-teal-900 mb-2">
                          Contact Information
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FiPhone className="h-4 w-4 text-teal-600" />
                            <p className="text-teal-800 font-medium">
                              {patientData.phone}
                            </p>
                          </div>
                          {patientData.email && (
                            <div className="flex items-center space-x-2">
                              <FiMail className="h-4 w-4 text-teal-600" />
                              <p className="text-teal-800 font-medium">
                                {patientData.email}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {patientData.emergencyContact && (
                      <div className="bg-white rounded-xl p-4 border border-teal-200">
                        <p className="text-sm font-bold text-teal-900 mb-1">
                          Emergency Contact
                        </p>
                        <p className="text-teal-800 font-medium">
                          {patientData.emergencyContact}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Medical History */}
            {patientData?.medicalHistory &&
              patientData.medicalHistory.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaNotesMedical className="h-6 w-6 text-emerald-600" />
                    Medical History
                  </h3>
                  <div className="bg-white rounded-xl p-4 max-h-48 overflow-y-auto border border-emerald-200">
                    <div className="space-y-3">
                      {patientData.medicalHistory.map((record, index) => (
                        <div
                          key={index}
                          className="bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-500"
                        >
                          <p className="text-emerald-800 text-sm">{record}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* Enhanced Consultation Notes */}
            {appointment.isOpen && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaNotesMedical className="h-6 w-6 text-purple-600" />
                  Consultation Notes
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-purple-900 mb-3">
                      Examination Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Record your examination findings, diagnosis, and treatment plan..."
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-900 mb-3">
                      Prescription/Recommendations
                    </label>
                    <textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="List medications, dosage, and any recommendations for the patient..."
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows="3"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <FiFileText className="h-4 w-4 mr-2" />
                      Save Notes
                    </Button>
                    <Button
                      onClick={() =>
                        onComplete(appointment, notes, prescription)
                      }
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                    >
                      <FiCheck className="h-4 w-4 mr-2" />
                      Complete Appointment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

const PatientProfileModal = ({ patient, isOpen, onClose }) => {
  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient Profile"
      size="large"
    >
      <div className="space-y-8">
        {/* Enhanced Patient Header */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-200">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center border-4 border-teal-200 shadow-lg">
              {patient.profileImage ? (
                <img
                  src={ipfsService.getIPFSUrl(patient.profileImage)}
                  alt="Patient"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <FaHospitalUser className="h-12 w-12 text-teal-600" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {patient.name || `Patient #${patient.id}`}
              </h2>
              <p className="text-teal-700 font-medium">
                Patient ID: #{patient.id}
              </p>
              {patient.age && (
                <p className="text-teal-600">
                  {patient.age} years old • {patient.gender}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Patient Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="h-6 w-6 text-blue-600" />
              Personal Information
            </h3>
            <div className="space-y-4">
              {patient.bloodType && (
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    Blood Type
                  </p>
                  <p className="text-blue-800 font-medium">
                    {patient.bloodType}
                  </p>
                </div>
              )}
              {patient.phone && (
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-bold text-blue-900 mb-1">Phone</p>
                  <p className="text-blue-800 font-medium">{patient.phone}</p>
                </div>
              )}
              {patient.email && (
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-bold text-blue-900 mb-1">Email</p>
                  <p className="text-blue-800 font-medium">{patient.email}</p>
                </div>
              )}
              {patient.emergencyContact && (
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    Emergency Contact
                  </p>
                  <p className="text-blue-800 font-medium">
                    {patient.emergencyContact}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MdMedicalServices className="h-6 w-6 text-emerald-600" />
              Medical Information
            </h3>
            <div className="space-y-4">
              {patient.allergies && (
                <div className="bg-white rounded-xl p-4 border border-emerald-200">
                  <p className="text-sm font-bold text-emerald-900 mb-1">
                    Allergies
                  </p>
                  <p className="text-emerald-800 font-medium">
                    {patient.allergies}
                  </p>
                </div>
              )}
              {patient.currentMedications && (
                <div className="bg-white rounded-xl p-4 border border-emerald-200">
                  <p className="text-sm font-bold text-emerald-900 mb-1">
                    Current Medications
                  </p>
                  <p className="text-emerald-800 font-medium">
                    {patient.currentMedications}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Medical History */}
        {patient.medicalHistory && patient.medicalHistory.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaNotesMedical className="h-6 w-6 text-purple-600" />
              Medical History
            </h3>
            <div className="bg-white rounded-xl p-4 max-h-64 overflow-y-auto border border-purple-200">
              <div className="space-y-3">
                {patient.medicalHistory.map((record, index) => (
                  <div
                    key={index}
                    className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500"
                  >
                    <p className="text-purple-800 text-sm">{record}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getDoctorId,
    getDoctorDetails,
    getDoctorAppointments,
    completeAppointment,
    updatePatientMedicalHistory,
    getUserType,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isConnected || !address) {
        router.push("/doctor/register");
        return;
      }

      try {
        setLoading(true);

        // Check if user is a doctor
        const userInfo = await getUserType(address);
        if (!userInfo || userInfo.userType !== "doctor") {
          router.push("/");
          return;
        }

        // Get doctor ID and details
        const doctorId = await getDoctorId(address);
        if (!doctorId) {
          router.push("/doctor/register");
          return;
        }

        const [doctorDetails, doctorAppointments] = await Promise.all([
          getDoctorDetails(doctorId),
          getDoctorAppointments(doctorId),
        ]);

        setDoctorData(doctorDetails);
        setAppointments(doctorAppointments || []);
        setFilteredAppointments(doctorAppointments || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isConnected, address]);

  useEffect(() => {
    let filtered = appointments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.id.toString().includes(searchTerm) ||
          appointment.patientId.toString().includes(searchTerm) ||
          appointment.condition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        filtered = filtered.filter((appointment) => appointment.isOpen);
      } else if (filterStatus === "completed") {
        filtered = filtered.filter((appointment) => !appointment.isOpen);
      }
    }

    // Apply date filter
    if (filterDate !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const apptDay = new Date(
          appointmentDate.getFullYear(),
          appointmentDate.getMonth(),
          appointmentDate.getDate()
        );

        switch (filterDate) {
          case "today":
            return apptDay.getTime() === today.getTime();
          case "upcoming":
            return apptDay > today && appointment.isOpen;
          case "overdue":
            return apptDay < today && appointment.isOpen;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      return dateB - dateA;
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, filterStatus, filterDate]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleCompleteAppointment = async (
    appointment,
    notes = "",
    prescription = ""
  ) => {
    try {
      // Complete the appointment
      await completeAppointment(appointment.id);

      // Add notes to medical history if provided
      if (notes || prescription) {
        const medicalRecord = `${new Date().toLocaleDateString()} - Consultation: ${notes}${
          prescription ? ` | Prescription: ${prescription}` : ""
        }`;
        await updatePatientMedicalHistory(appointment.patientId, medicalRecord);
      }

      // Refresh appointments
      const doctorId = await getDoctorId(address);
      const updatedAppointments = await getDoctorAppointments(doctorId);
      setAppointments(updatedAppointments || []);

      setShowDetailsModal(false);
      toast.success("Appointment completed successfully!");
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <MdSchedule className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full animate-ping"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading appointments...
          </p>
          <p className="text-sm text-gray-500">Accessing patient schedules</p>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-fit mx-auto shadow-lg">
                <FaUserMd className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <MdEmergency className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <MdHealthAndSafety className="h-5 w-5 text-red-600" />
              Access Denied
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You need to be a registered and verified doctor to view patient
              appointments.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/doctor/register")}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 w-full"
              >
                <FaUserMd className="mr-2 h-4 w-4" />
                Register as Doctor
              </Button>
              <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
                <FiShield className="h-4 w-4" />
                <span>Medical License Verification Required</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const stats = {
    total: appointments.length,
    active: appointments.filter((apt) => apt.isOpen).length,
    completed: appointments.filter((apt) => !apt.isOpen).length,
    today: appointments.filter((apt) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const appointmentDate = new Date(apt.appointmentDate);
      const apptDay = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate()
      );
      return apptDay.getTime() === today.getTime();
    }).length,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative">
      {/* Medical Background Elements */}
      <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
        <MdSchedule className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaStethoscope className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdLocalHospital className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Enhanced Header */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center space-x-6 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/doctor/dashboard")}
            className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
              <MdSchedule className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                My Appointments
                <MdHealthAndSafety className="h-8 w-8 text-teal-600" />
              </h1>
              <p className="text-xl text-gray-600">
                Manage your patient consultations and medical schedules
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-none px-4 py-2">
              <FaUserMd className="w-4 h-4 mr-2" />
              Dr. {doctorData?.name || `Doctor #${doctorData?.id}`}
            </Badge>
            {doctorData?.isApproved ? (
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none px-4 py-2">
                <MdVerifiedUser className="w-4 h-4 mr-2" />
                Verified
              </Badge>
            ) : (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none px-4 py-2">
                <FiClock className="w-4 h-4 mr-2" />
                Pending Approval
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
              <MdSchedule className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-blue-700 font-bold uppercase tracking-wide">
                Total Appointments
              </p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
              <FiClock className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-emerald-700 font-bold uppercase tracking-wide">
                Active
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.active}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
              <FiCheckCircle className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-purple-700 font-bold uppercase tracking-wide">
                Completed
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.completed}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
              <FiAlertCircle className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-orange-700 font-bold uppercase tracking-wide">
                Today
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.today}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiFilter className="h-6 w-6 text-blue-600" />
            Filter Appointments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                <FiSearch className="h-4 w-4 text-blue-600" />
                Search Appointments
              </label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by appointment ID, patient ID, or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 focus:ring-blue-500 focus:border-blue-500 border-2 border-blue-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                <MdVerifiedUser className="h-4 w-4 text-blue-600" />
                Status Filter
              </label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 border-2 border-blue-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                <FiCalendar className="h-4 w-4 text-blue-600" />
                Date Filter
              </label>
              <Select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 border-2 border-blue-200"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 border-2 border-gray-200">
        <p className="text-gray-600 font-medium flex items-center gap-2">
          <MdSchedule className="h-5 w-5 text-teal-600" />
          Showing{" "}
          <span className="font-bold text-teal-600">
            {filteredAppointments.length}
          </span>{" "}
          of <span className="font-bold">{appointments.length}</span>{" "}
          appointments
        </p>
      </div>

      {/* Enhanced Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-8">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onViewDetails={handleViewDetails}
              onCompleteAppointment={handleCompleteAppointment}
              onViewPatient={handleViewPatient}
              doctorData={doctorData}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200">
          <div className="p-6 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full w-fit mx-auto mb-6">
            <MdSchedule className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            No appointments found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            {searchTerm || filterStatus !== "all" || filterDate !== "all"
              ? "Try adjusting your search filters to see more results."
              : "You don't have any patient appointments scheduled yet."}
          </p>
        </Card>
      )}

      {/* Modals */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onComplete={handleCompleteAppointment}
      />

      <PatientProfileModal
        patient={selectedPatient}
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
      />
    </div>
  );
};

export default DoctorAppointments;
