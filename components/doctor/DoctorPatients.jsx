import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiUser,
  FiCalendar,
  FiFileText,
  FiEye,
  FiEdit3,
  FiActivity,
  FiHeart,
  FiClock,
  FiPhone,
  FiMail,
  FiAlertCircle,
  FiPlus,
  FiMessageSquare,
  FiPrescription,
  FiArrowLeft,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import {
  MdBloodtype,
  MdEmergency,
  MdMedication,
  MdVerifiedUser,
  MdLocalHospital,
  MdHealthAndSafety,
  MdMedicalServices,
  MdSchedule,
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
import {
  formatDate,
  truncateAddress,
  getRelativeTime,
} from "../../utils/helpers";
import toast from "react-hot-toast";

const PatientCard = ({
  patient,
  onViewProfile,
  onViewHistory,
  onAddRecord,
  appointments = [],
}) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (patient.IPFS_URL) {
        try {
          setLoading(true);
          const hash = patient.IPFS_URL.replace(
            "https://gateway.pinata.cloud/ipfs/",
            ""
          );
          const data = await ipfsService.fetchFromIPFS(hash);
          setPatientData(data);
        } catch (error) {
          console.error("Error fetching patient data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatientData();
  }, [patient.IPFS_URL]);

  const patientAppointments = appointments.filter(
    (apt) => Number(apt.patientId) === Number(patient.id)
  );

  const lastAppointment = patientAppointments.sort((a, b) => {
    // Convert BigInt to Number safely for date comparison
    const dateA = new Date(Number(b.date));
    const dateB = new Date(Number(a.date));
    return dateA.getTime() - dateB.getTime();
  })[0];

  const totalAppointments = patientAppointments.length;
  const activeAppointments = patientAppointments.filter(
    (apt) => apt.isOpen
  ).length;

  const getHealthStatus = () => {
    if (activeAppointments > 0)
      return {
        status: "Active Treatment",
        badgeClass:
          "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none",
      };
    if (totalAppointments > 0)
      return {
        status: "Previous Patient",
        badgeClass:
          "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none",
      };
    return {
      status: "New Patient",
      badgeClass:
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none",
    };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="bg-gradient-to-br from-white to-gray-25 border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        {/* Enhanced Patient Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center border-2 border-teal-200 shadow-lg">
              {loading ? (
                <LoadingSpinner size="small" />
              ) : patientData?.profileImage ? (
                <img
                  src={ipfsService.getIPFSUrl(patientData.profileImage)}
                  alt={`${patientData?.name || "Patient"}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <FaHospitalUser className="h-8 w-8 text-teal-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {patientData?.name || `Patient #${patient.id}`}
              </h3>
              <p className="text-gray-600 font-medium flex items-center gap-1">
                <MdSecurity className="h-4 w-4" />
                ID: #{patient.id}
              </p>
              {patientData?.age && patientData?.gender && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <FiUser className="h-3 w-3" />
                  {patientData.age} years old • {patientData.gender}
                </p>
              )}
            </div>
          </div>
          <Badge className={`text-xs ${healthStatus.badgeClass}`}>
            {healthStatus.status}
          </Badge>
        </div>

        {/* Enhanced Patient Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
            <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
              <MdSchedule className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-600">
              {totalAppointments}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Total Visits
            </div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border-2 border-emerald-200 hover:shadow-lg transition-all duration-200">
            <div className="p-2 bg-emerald-100 rounded-lg w-fit mx-auto mb-2">
              <FaHeartbeat className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-600">
              {activeAppointments}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Active Cases
            </div>
          </div>
        </div>

        {/* Enhanced Medical Info */}
        <div className="space-y-3 mb-6">
          {patientData?.bloodType && (
            <div className="flex items-center p-3 bg-white rounded-lg border border-red-200">
              <MdBloodtype className="h-4 w-4 mr-3 text-red-500" />
              <span className="text-sm text-gray-700 font-medium">
                Blood Type:{" "}
                <span className="text-red-600 font-bold">
                  {patientData.bloodType}
                </span>
              </span>
            </div>
          )}

          {patientData?.allergies && (
            <div className="flex items-start p-3 bg-white rounded-lg border border-yellow-200">
              <FiAlertCircle className="h-4 w-4 mr-3 text-yellow-500 mt-0.5" />
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Allergies:
                </span>
                <p className="text-sm text-yellow-700 truncate">
                  {patientData.allergies}
                </p>
              </div>
            </div>
          )}

          {patientData?.currentMedications && (
            <div className="flex items-start p-3 bg-white rounded-lg border border-purple-200">
              <MdMedication className="h-4 w-4 mr-3 text-purple-500 mt-0.5" />
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Medications:
                </span>
                <p className="text-sm text-purple-700 truncate">
                  {patientData.currentMedications}
                </p>
              </div>
            </div>
          )}

          {lastAppointment && (
            <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
              <FiClock className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">
                Last visit:{" "}
                <span className="text-gray-800">
                  {formatDate(Number(lastAppointment.date))}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Enhanced Contact Info */}
        {(patientData?.phone || patientData?.email) && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 mb-6 border border-teal-200">
            <h4 className="text-sm font-bold text-teal-900 mb-3">
              Contact Information
            </h4>
            <div className="space-y-2">
              {patientData.phone && (
                <div className="flex items-center text-sm">
                  <FiPhone className="h-4 w-4 mr-2 text-teal-600" />
                  <span className="text-teal-800 font-medium">
                    {patientData.phone}
                  </span>
                </div>
              )}
              {patientData.email && (
                <div className="flex items-center text-sm">
                  <FiMail className="h-4 w-4 mr-2 text-teal-600" />
                  <span className="text-teal-800 font-medium truncate">
                    {patientData.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="small"
              onClick={() => onViewProfile(patient)}
              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
            >
              <FiEye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={() => onViewHistory(patient)}
              className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-medium"
            >
              <FaNotesMedical className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              size="small"
              onClick={() => onAddRecord(patient)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium"
            >
              <FiEdit3 className="h-4 w-4 mr-2" />
              Add Record
            </Button>
            <Button
              size="small"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
            >
              <FiMessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientProfileModal = ({ patient, isOpen, onClose }) => {
  const [patientData, setPatientData] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getPatientMedicalHistory } = useHealthcareContract();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (patient && isOpen) {
        try {
          setLoading(true);

          // Fetch IPFS data
          if (patient.IPFS_URL) {
            const hash = patient.IPFS_URL.replace(
              "https://gateway.pinata.cloud/ipfs/",
              ""
            );
            const data = await ipfsService.fetchFromIPFS(hash);
            setPatientData(data);
          }

          // Fetch medical history
          const history = await getPatientMedicalHistory(patient.id);
          setMedicalHistory(history || []);
        } catch (error) {
          console.error("Error fetching patient details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatientDetails();
  }, [patient, isOpen]);

  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient Profile"
      size="large"
    >
      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {/* Enhanced Patient Header */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-200">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center border-4 border-teal-200 shadow-lg">
                  {patientData?.profileImage ? (
                    <img
                      src={ipfsService.getIPFSUrl(patientData.profileImage)}
                      alt="Patient"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <FaHospitalUser className="h-12 w-12 text-teal-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {patientData?.name || `Patient #${patient.id}`}
                  </h2>
                  <p className="text-teal-700 font-medium">
                    Patient ID: #{patient.id}
                  </p>
                  {patientData?.age && (
                    <p className="text-teal-600">
                      {patientData.age} years old • {patientData.gender}
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
                  {patientData?.bloodType && (
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Blood Type
                      </p>
                      <div className="flex items-center">
                        <MdBloodtype className="h-4 w-4 mr-2 text-red-500" />
                        <p className="text-blue-800 font-medium">
                          {patientData.bloodType}
                        </p>
                      </div>
                    </div>
                  )}
                  {patientData?.phone && (
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Phone
                      </p>
                      <div className="flex items-center">
                        <FiPhone className="h-4 w-4 mr-2 text-blue-600" />
                        <p className="text-blue-800 font-medium">
                          {patientData.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {patientData?.email && (
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Email
                      </p>
                      <div className="flex items-center">
                        <FiMail className="h-4 w-4 mr-2 text-blue-600" />
                        <p className="text-blue-800 font-medium">
                          {patientData.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {patientData?.emergencyContact && (
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Emergency Contact
                      </p>
                      <div className="flex items-center">
                        <MdEmergency className="h-4 w-4 mr-2 text-red-500" />
                        <p className="text-blue-800 font-medium">
                          {patientData.emergencyContact}
                        </p>
                      </div>
                    </div>
                  )}
                  {patientData?.address && (
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Address
                      </p>
                      <p className="text-blue-800 font-medium">
                        {patientData.address}
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
                  {patientData?.allergies && (
                    <div className="bg-white rounded-xl p-4 border border-emerald-200">
                      <p className="text-sm font-bold text-emerald-900 mb-1">
                        Allergies
                      </p>
                      <div className="flex items-start">
                        <FiAlertCircle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
                        <p className="text-emerald-800 font-medium">
                          {patientData.allergies}
                        </p>
                      </div>
                    </div>
                  )}
                  {patientData?.currentMedications && (
                    <div className="bg-white rounded-xl p-4 border border-emerald-200">
                      <p className="text-sm font-bold text-emerald-900 mb-1">
                        Current Medications
                      </p>
                      <div className="flex items-start">
                        <MdMedication className="h-4 w-4 mr-2 text-purple-500 mt-0.5" />
                        <p className="text-emerald-800 font-medium">
                          {patientData.currentMedications}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Medical History */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaNotesMedical className="h-6 w-6 text-purple-600" />
                Medical History
              </h3>
              {medicalHistory.length > 0 ? (
                <div className="bg-white rounded-xl p-4 max-h-64 overflow-y-auto border border-purple-200">
                  <div className="space-y-3">
                    {medicalHistory.map((record, index) => (
                      <div
                        key={index}
                        className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500"
                      >
                        <p className="text-purple-800 text-sm">{record}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-xl border border-purple-200">
                  <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                    <FaNotesMedical className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No medical history recorded yet
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Blockchain Info */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MdSecurity className="h-6 w-6 text-gray-600" />
                Blockchain Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    Patient ID
                  </p>
                  <p className="text-gray-800 font-medium">#{patient.id}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    Wallet Address
                  </p>
                  <p className="text-gray-800 font-mono text-sm">
                    {truncateAddress(patient.accountAddress, 10, 10)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

const AddMedicalRecordModal = ({ patient, isOpen, onClose, onSave }) => {
  const [record, setRecord] = useState("");
  const [recordType, setRecordType] = useState("consultation");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!record.trim()) {
      toast.error("Please enter a medical record");
      return;
    }

    try {
      setLoading(true);
      const timestamp = new Date().toLocaleDateString();
      const formattedRecord = `${timestamp} - ${recordType}: ${record}`;

      await onSave(patient.id, formattedRecord);
      setRecord("");
      setRecordType("consultation");
      onClose();
      toast.success("Medical record added successfully");
    } catch (error) {
      console.error("Error adding medical record:", error);
      toast.error("Failed to add medical record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Medical Record">
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaHospitalUser className="h-5 w-5 text-teal-600" />
            Patient: {patient?.name || `Patient #${patient?.id}`}
          </h3>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
            <MdMedicalServices className="h-4 w-4 text-blue-600" />
            Record Type
          </label>
          <Select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="focus:ring-teal-500 focus:border-teal-500 border-2 border-teal-200"
          >
            <option value="consultation">Consultation</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="prescription">Prescription</option>
            <option value="lab_result">Lab Result</option>
            <option value="follow_up">Follow-up</option>
            <option value="treatment">Treatment</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
            <FaNotesMedical className="h-4 w-4 text-purple-600" />
            Medical Record
          </label>
          <textarea
            value={record}
            onChange={(e) => setRecord(e.target.value)}
            placeholder="Enter detailed medical record, diagnosis, treatment plan, etc..."
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            rows="6"
          />
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={loading || !record.trim()}
            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Saving...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FaNotesMedical className="h-4 w-4 mr-2" />
                Save Record
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getDoctorId,
    getDoctorDetails,
    getDoctorAppointments,
    getAllPatients,
    updatePatientMedicalHistory,
    getUserType,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchData = async () => {
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

        const [doctorDetails, doctorAppointments, allPatients] =
          await Promise.all([
            getDoctorDetails(doctorId),
            getDoctorAppointments(doctorId),
            getAllPatients(),
          ]);

        setDoctorData(doctorDetails);
        setAppointments(doctorAppointments || []);

        // Filter patients who have appointments with this doctor
        const doctorPatientIds = new Set();
        doctorAppointments?.forEach((apt) => {
          doctorPatientIds.add(Number(apt.patientId));
        });

        const doctorPatients =
          allPatients?.filter((patient) =>
            doctorPatientIds.has(Number(patient.id))
          ) || [];

        setPatients(doctorPatients);
        setFilteredPatients(doctorPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address]);

  useEffect(() => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.id.toString().includes(searchTerm) ||
          patient.accountAddress
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      const patientAppointments = appointments.reduce((acc, apt) => {
        const patientId = Number(apt.patientId);
        if (!acc[patientId]) acc[patientId] = [];
        acc[patientId].push(apt);
        return acc;
      }, {});

      filtered = filtered.filter((patient) => {
        const patientApts = patientAppointments[Number(patient.id)] || [];

        switch (filterStatus) {
          case "active":
            return patientApts.some((apt) => apt.isOpen);
          case "completed":
            return (
              patientApts.length > 0 && !patientApts.some((apt) => apt.isOpen)
            );
          case "new":
            return patientApts.length === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting - Fix BigInt conversion issue here too
    filtered.sort((a, b) => {
      const aAppointments = appointments.filter(
        (apt) => Number(apt.patientId) === Number(a.id)
      );
      const bAppointments = appointments.filter(
        (apt) => Number(apt.patientId) === Number(b.id)
      );

      switch (sortBy) {
        case "recent":
          const aLastDate = Math.max(
            ...aAppointments.map((apt) => Number(apt.date)),
            0
          );
          const bLastDate = Math.max(
            ...bAppointments.map((apt) => Number(apt.date)),
            0
          );
          return bLastDate - aLastDate;
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "visits":
          return bAppointments.length - aAppointments.length;
        default:
          return Number(b.id) - Number(a.id);
      }
    });

    setFilteredPatients(filtered);
  }, [patients, appointments, searchTerm, filterStatus, sortBy]);

  const handleViewProfile = (patient) => {
    setSelectedPatient(patient);
    setShowProfileModal(true);
  };

  const handleViewHistory = (patient) => {
    // Navigate to patient history page or show history modal
    router.push(`/doctor/patients/${patient.id}/history`);
  };

  const handleAddRecord = (patient) => {
    setSelectedPatient(patient);
    setShowAddRecordModal(true);
  };

  const handleSaveMedicalRecord = async (patientId, record) => {
    await updatePatientMedicalHistory(patientId, record);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <FaHospitalUser className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full animate-ping"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">Loading patients...</p>
          <p className="text-sm text-gray-500">Accessing patient records</p>
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
              records and medical information.
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
    total: patients.length,
    active: patients.filter((patient) => {
      const patientAppointments = appointments.filter(
        (apt) => Number(apt.patientId) === Number(patient.id)
      );
      return patientAppointments.some((apt) => apt.isOpen);
    }).length,
    new: patients.filter((patient) => {
      const patientAppointments = appointments.filter(
        (apt) => Number(apt.patientId) === Number(patient.id)
      );
      return patientAppointments.length === 0;
    }).length,
    returning: patients.filter((patient) => {
      const patientAppointments = appointments.filter(
        (apt) => Number(apt.patientId) === Number(patient.id)
      );
      return patientAppointments.length > 1;
    }).length,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative">
      {/* Medical Background Elements */}
      <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
        <FaHospitalUser className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
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
              <FaHospitalUser className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                My Patients
                <MdHealthAndSafety className="h-8 w-8 text-teal-600" />
              </h1>
              <p className="text-xl text-gray-600">
                Manage your patient records and medical history
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
              <FaHospitalUser className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-blue-700 font-bold uppercase tracking-wide">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
              <FaHeartbeat className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-emerald-700 font-bold uppercase tracking-wide">
                Active Treatment
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
              <FiHeart className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-purple-700 font-bold uppercase tracking-wide">
                New Patients
              </p>
              <p className="text-3xl font-bold text-purple-600">{stats.new}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
              <FiCalendar className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-orange-700 font-bold uppercase tracking-wide">
                Returning
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.returning}
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
            Filter Patients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                <FiSearch className="h-4 w-4 text-blue-600" />
                Search Patients
              </label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by patient ID or wallet address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 focus:ring-blue-500 focus:border-blue-500 border-2 border-blue-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                <MdVerifiedUser className="h-4 w-4 text-blue-600" />
                Patient Status
              </label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 border-2 border-blue-200"
              >
                <option value="all">All Patients</option>
                <option value="active">Active Treatment</option>
                <option value="completed">Previous Patients</option>
                <option value="new">New Patients</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                <FiActivity className="h-4 w-4 text-blue-600" />
                Sort By
              </label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 border-2 border-blue-200"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="visits">Most Visits</option>
                <option value="newest">Newest First</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 border-2 border-gray-200">
        <p className="text-gray-600 font-medium flex items-center gap-2">
          <FaHospitalUser className="h-5 w-5 text-teal-600" />
          Showing{" "}
          <span className="font-bold text-teal-600">
            {filteredPatients.length}
          </span>{" "}
          of <span className="font-bold">{patients.length}</span> patients
        </p>
      </div>

      {/* Enhanced Patients Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 mb-8">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              appointments={appointments}
              onViewProfile={handleViewProfile}
              onViewHistory={handleViewHistory}
              onAddRecord={handleAddRecord}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 mb-8">
          <div className="p-6 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full w-fit mx-auto mb-6">
            <FaHospitalUser className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            No patients found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search filters to see more results."
              : "You don't have any patients yet. Patients will appear here after they book appointments with you."}
          </p>
        </Card>
      )}

      {/* Enhanced Quick Actions */}
      {patients.length > 0 && (
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MdMedicalServices className="h-6 w-6 text-indigo-600" />
                  Quick Actions
                </h3>
                <p className="text-gray-600">
                  Common tasks for patient management
                </p>
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/doctor/appointments")}
                  className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <MdSchedule className="h-4 w-4 mr-2" />
                  View Appointments
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/doctor/prescribe")}
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <FaPrescriptionBottleAlt className="h-4 w-4 mr-2" />
                  Write Prescription
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <PatientProfileModal
        patient={selectedPatient}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <AddMedicalRecordModal
        patient={selectedPatient}
        isOpen={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        onSave={handleSaveMedicalRecord}
      />
    </div>
  );
};

export default DoctorPatients;
