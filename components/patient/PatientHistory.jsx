import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { 
  FiFileText, 
  FiCalendar, 
  FiUpload, 
  FiShield, 
  FiEye, 
  FiCheck, 
  FiClock,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiClipboard
} from "react-icons/fi";
import { 
  FaNotesMedical, 
  FaStethoscope, 
  FaPrescriptionBottleAlt,
  FaUserMd,
  FaCalendarAlt,
  FaSyringe,
  FaPrescriptionBottle
} from "react-icons/fa";
import { 
  MdHistory, 
  MdHealthAndSafety, 
  MdLocalHospital,
  MdSchedule,
  MdSecurity,
  MdMedicalServices,
  MdVerifiedUser
} from "react-icons/md";
import { Button, Card, Badge, Modal, Input, Select } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import MedicalRecordUpload from "./MedicalRecordUpload";
import AccessRequestManagement from "./AccessRequestManagement";
import ABEPolicyBadge from "../common/ABEPolicyBadge";
import abeEncryption from "../../utils/encryption";
import ipfsService from "../../utils/ipfs";
import toast from "react-hot-toast";

// Helper function
const safeNumberConversion = (value) => {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'object' && value !== null && typeof value.toString === 'function') {
    return Number(value.toString());
  }
  return Number(value);
};

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Decrypt medical history entries
const decryptMedicalHistoryEntries = async (encryptedHistory, userAttributes) => {
  if (!encryptedHistory || encryptedHistory.length === 0) {
    return [];
  }

  const decrypted = [];
  for (let i = 0; i < encryptedHistory.length; i++) {
    try {
      const entry = encryptedHistory[i];
      
      if (typeof entry === 'string' && !entry.includes('encryptedData')) {
        decrypted.push(entry);
        continue;
      }

      let encryptedPackage = entry;
      if (typeof entry === 'string') {
        try {
          encryptedPackage = JSON.parse(entry);
        } catch (e) {
          decrypted.push(entry);
          continue;
        }
      }

      if (encryptedPackage && encryptedPackage.encryptedData && encryptedPackage.encryptedKey) {
        try {
          const decryptedData = await abeEncryption.decrypt(encryptedPackage, userAttributes);
          
          if (typeof decryptedData === 'object' && decryptedData.entry) {
            decrypted.push(decryptedData.entry);
          } else if (typeof decryptedData === 'string') {
            decrypted.push(decryptedData);
          } else {
            decrypted.push(JSON.stringify(decryptedData));
          }
        } catch (decryptError) {
          console.warn(`Unable to decrypt medical history entry ${i}:`, decryptError);
          decrypted.push(`[Encrypted Record #${i + 1} - Access Denied]`);
        }
      } else {
        decrypted.push(typeof encryptedPackage === 'string' ? encryptedPackage : JSON.stringify(encryptedPackage));
      }
    } catch (error) {
      console.error(`Error processing medical history entry ${i}:`, error);
      decrypted.push(`[Error loading record #${i + 1}]`);
    }
  }

  return decrypted;
};

const AppointmentCard = ({ appointment, doctors, onViewDetails }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(false);

  const appointmentId = safeNumberConversion(appointment.id);
  const appointmentDoctorId = safeNumberConversion(appointment.doctorId);
  const appointmentPatientId = safeNumberConversion(appointment.patientId);
  const appointmentDate = safeNumberConversion(appointment.date);

  const doctor = doctors.find(
    (d) => safeNumberConversion(d.id) === appointmentDoctorId
  );

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (doctor?.IPFS_URL) {
        try {
          setLoading(true);
          const hash = doctor.IPFS_URL.replace(
            "https://gateway.pinata.cloud/ipfs/",
            ""
          );
          const data = await ipfsService.fetchFromIPFS(hash);
          setDoctorData(data);
        } catch (error) {
          console.error("Error fetching doctor data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDoctorData();
  }, [doctor?.IPFS_URL]);

  const getStatusBadge = (isOpen) => {
    if (isOpen === false) {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none">
          <FiCheck className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (isOpen === true) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none">
          <FiClock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
          <FiClock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-25 border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-teal-200 shadow-lg">
              {loading ? (
                <LoadingSpinner size="small" />
              ) : doctorData?.profileImage ? (
                <img
                  src={ipfsService.getIPFSUrl(doctorData.profileImage)}
                  alt={`Dr. ${doctorData?.name || "Doctor"}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <FaUserMd className="h-8 w-8 text-teal-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2 flex-wrap">
                <h4 className="font-bold text-gray-900 text-lg truncate">
                  {doctorData?.name ||
                    doctor?.name ||
                    `Dr. ${appointmentDoctorId}`}
                </h4>
                <MdVerifiedUser className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              </div>

              {doctorData?.specialization && (
                <div className="flex items-center space-x-2 mb-3">
                  <FaStethoscope className="h-4 w-4 text-teal-600" />
                  <p className="text-sm text-gray-600 capitalize font-medium truncate">
                    {doctorData.specialization} Specialist
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg p-3 border border-teal-200 mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate font-medium">
                      {appointment.appointmentDate ||
                        formatDate(appointmentDate) ||
                        "Date not specified"}
                    </span>
                  </div>
                  {appointment.condition && (
                    <div className="flex items-center space-x-2">
                      <MdMedicalServices className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="truncate font-medium">
                        {appointment.condition}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusBadge(appointment.isOpen)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">
                    Appointment #{appointmentId}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(appointmentDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {appointment.message && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
            <div className="flex items-start space-x-2">
              <FaNotesMedical className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Consultation Note:</span>{" "}
                  {appointment.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center space-x-1">
              <MdSecurity className="h-3 w-3" />
              <span>
                Doctor:{" "}
                {truncateAddress(
                  doctor?.accountAddress || appointment.doctorId
                )}
              </span>
            </div>
            {appointment.from && appointment.to && (
              <div className="flex items-center space-x-1">
                <FiClock className="h-3 w-3" />
                <span>
                  Time: {appointment.from} - {appointment.to}
                </span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="small"
            onClick={() => onViewDetails(appointment)}
            className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            <FiEye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

const MedicalHistoryCard = ({ record, index, onShareAccess }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-emerald-200 shadow-lg">
            <FaNotesMedical className="h-8 w-8 text-emerald-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <MdHealthAndSafety className="h-5 w-5 text-emerald-600" />
                Medical Record #{index + 1}
              </h4>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none text-xs">
                <FiFileText className="w-3 h-3 mr-1" />
                {formatDate(new Date())}
              </Badge>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
              <p className="text-gray-700 break-words leading-relaxed">
                {record}
              </p>
            </div>
          </div>
        </div>
        {/* REMOVED: Manage Access Button */}
        {/* <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="small"
            onClick={() => onShareAccess(record, index)}
            className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <FiShare2 className="h-4 w-4 mr-2" />
            Manage Access
          </Button>
        </div> */}
      </div>
    </div>
  );
};

const PrescriptionHistoryCard = ({ prescription, medicines, doctors }) => {
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(false);

  const prescriptionId = safeNumberConversion(prescription.id);
  const prescriptionMedicineId = safeNumberConversion(prescription.medicineId);
  const prescriptionDoctorId = safeNumberConversion(prescription.doctorId);
  const prescriptionDate = safeNumberConversion(prescription.date);

  const medicine = medicines.find(
    (m) => safeNumberConversion(m.id) === prescriptionMedicineId
  );
  const doctor = doctors.find(
    (d) => safeNumberConversion(d.id) === prescriptionDoctorId
  );

  useEffect(() => {
    const fetchMedicineData = async () => {
      if (medicine?.IPFS_URL) {
        try {
          setLoading(true);
          const hash = medicine.IPFS_URL.replace(
            "https://gateway.pinata.cloud/ipfs/",
            ""
          );
          const data = await ipfsService.fetchFromIPFS(hash);
          setMedicineData(data);
        } catch (error) {
          console.error("Error fetching medicine data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMedicineData();
  }, [medicine?.IPFS_URL]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-blue-200 shadow-lg">
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              <FaPrescriptionBottleAlt className="h-8 w-8 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3 flex-wrap">
              <h4 className="font-bold text-gray-900 text-lg truncate">
                {medicineData?.name || `Medicine #${prescriptionMedicineId}`}
              </h4>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none flex-shrink-0">
                <FaPrescriptionBottleAlt className="w-3 h-3 mr-1" />
                Prescribed
              </Badge>
            </div>

            {medicineData?.category && (
              <div className="flex items-center space-x-2 mb-3">
                <MdMedicalServices className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600 capitalize font-medium truncate">
                  {medicineData.category}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 border border-blue-200 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FaUserMd className="h-4 w-4 text-teal-600 flex-shrink-0" />
                  <span className="truncate font-medium">
                    Dr. {doctor?.name || `Doctor #${prescriptionDoctorId}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClipboard className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span className="font-medium">
                    Prescription #{prescriptionId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <FiCalendar className="h-3 w-3" />
                Prescribed on: {formatDate(prescriptionDate)}
              </div>
            </div>

            {medicineData?.dosage && (
              <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-start space-x-2">
                  <FaSyringe className="h-4 w-4 text-purple-600 mt-0.5" />
                  <p className="text-sm text-purple-800">
                    <span className="font-bold">Dosage:</span>{" "}
                    {medicineData.dosage}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientHistory = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("appointments");
  
  // Data state
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [patientIdValue, setPatientIdValue] = useState(null);

  // Medical records state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAccessRequestsModal, setShowAccessRequestsModal] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getPatientId,
    getPatientDetails,
    getPatientAppointments,
    getPatientMedicalHistory,
    getPatientPrescriptions,
    getAllDoctors,
    getAllMedicines,
    getUserType,
  } = useHealthcareContract();

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

        // Get patient data
        const patientId = await getPatientId(address);
        if (!patientId) {
          router.push("/patient/register");
          return;
        }
        const patientIdNumber = safeNumberConversion(patientId);
        setPatientIdValue(patientIdNumber);

        const [
          patientDetails,
          patientAppointments,
          patientMedicalHistory,
          patientPrescriptions,
          allDoctors,
          allMedicines,
        ] = await Promise.all([
          getPatientDetails(patientId).catch(() => null),
          getPatientAppointments(patientId).catch(() => []),
          getPatientMedicalHistory(patientId).catch(() => []),
          getPatientPrescriptions(patientId).catch(() => []),
          getAllDoctors().catch(() => []),
          getAllMedicines().catch(() => []),
        ]);

        if (!patientDetails) {
          router.push("/patient/register");
          return;
        }

        // Process data
        const processedAppointments = (patientAppointments || []).map(
          (appointment) => ({
            ...appointment,
            id: safeNumberConversion(appointment.id),
            patientId: safeNumberConversion(appointment.patientId),
            doctorId: safeNumberConversion(appointment.doctorId),
            date: safeNumberConversion(appointment.date),
          })
        );

        const processedPrescriptions = (patientPrescriptions || []).map(
          (prescription) => ({
            ...prescription,
            id: safeNumberConversion(prescription.id),
            medicineId: safeNumberConversion(prescription.medicineId),
            doctorId: safeNumberConversion(prescription.doctorId),
            patientId: safeNumberConversion(prescription.patientId),
            date: safeNumberConversion(prescription.date),
          })
        );

        const processedDoctors = (allDoctors || []).map((doctor) => ({
          ...doctor,
          id: safeNumberConversion(doctor.id),
        }));

        const processedMedicines = (allMedicines || []).map((medicine) => ({
          ...medicine,
          id: safeNumberConversion(medicine.id),
        }));

        // Decrypt medical history
        const patientAttributes = abeEncryption.getUserAttributes(
          address,
          "patient",
          patientIdNumber,
          null
        );
        const processedMedicalHistory = await decryptMedicalHistoryEntries(
          patientMedicalHistory,
          patientAttributes
        );

        setPatientData(patientDetails);
        setAppointments(processedAppointments);
        setMedicalHistory(processedMedicalHistory || []);
        setPrescriptions(processedPrescriptions);
        setDoctors(processedDoctors);
        setMedicines(processedMedicines);
      } catch (error) {
        console.error("Error fetching patient history:", error);
        toast.error("Failed to load patient history");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address, router]);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = searchTerm === "" || 
      apt.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "" ||
      (statusFilter === "completed" && apt.isOpen === false) ||
      (statusFilter === "scheduled" && apt.isOpen === true) ||
      (statusFilter === "pending" && apt.isOpen === undefined);
    
    return matchesSearch && matchesStatus;
  });

  const handleViewAppointmentDetails = (appointment) => {
    toast.success("Viewing appointment details");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
        <MdHistory className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaStethoscope className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdLocalHospital className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Medical History
          </h1>
          <p className="text-gray-600 text-lg">
            View your complete medical journey
          </p>
        </div>

        {/* Updated Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "appointments"
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab("medical")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "medical"
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            <FaNotesMedical className="inline mr-2" />
            Medical Records
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            <FiUpload className="inline mr-2" />
            Upload Record
          </button>
          <button
            onClick={() => setActiveTab("access")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "access"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            <FiShield className="inline mr-2" />
            Access Requests
          </button>
          <button
            onClick={() => router.push('/patient/prescriptions')}
            className="px-6 py-3 rounded-xl font-semibold transition-all bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
          >
            <FaPrescriptionBottle className="inline mr-2" />
            View Prescriptions →
          </button>
        </div>

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                Appointment History
                <MdSchedule className="h-8 w-8 text-teal-600" />
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Track your medical consultations and healthcare provider visits
              </p>
            </div>

            {/* Enhanced Filters */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiFilter className="h-6 w-6 text-blue-600" />
                  Filter Appointments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                      <FiSearch className="h-4 w-4 text-blue-600" />
                      Search Appointments
                    </label>
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 focus:ring-blue-500 focus:border-blue-500 border-2 border-blue-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                      <MdVerifiedUser className="h-4 w-4 text-blue-600" />
                      Status Filter
                    </label>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 border-2 border-blue-200"
                    >
                      <option value="">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="pending">Pending</option>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("");
                        setDateFilter("");
                      }}
                      className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <FiRefreshCw className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between bg-white rounded-xl p-4 border-2 border-gray-200">
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

            {/* Appointments List */}
            {filteredAppointments.length > 0 ? (
              <div className="space-y-6">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    doctors={doctors}
                    onViewDetails={handleViewAppointmentDetails}
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
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                  {searchTerm || statusFilter
                    ? "Try adjusting your filters to see more results."
                    : "You haven't had any medical consultations yet."}
                </p>
                {!searchTerm && !statusFilter && (
                  <Button
                    onClick={() => router.push("/patient/book-appointment")}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    <MdSchedule className="mr-2 h-4 w-4" />
                    Book Your First Appointment
                  </Button>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === "medical" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                Medical Records
                <FaNotesMedical className="h-8 w-8 text-emerald-600" />
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Your encrypted medical records with CP-ABE access control
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                <FiUpload className="h-4 w-4 mr-2" />
                Upload Medical Record
              </Button>
              <Button
                onClick={() => setShowAccessRequestsModal(true)}
                variant="outline"
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <MdHealthAndSafety className="h-4 w-4 mr-2" />
                Manage Access Requests
              </Button>
            </div>

            <ABEPolicyBadge
              patientId={patientIdValue}
              doctorId={null}
              specialty="treating doctor"
              allowAdmin={true}
              className="max-w-4xl mx-auto"
            />

            {medicalHistory.length > 0 ? (
              <div className="space-y-6">
                {medicalHistory.map((record, index) => (
                  <MedicalHistoryCard
                    key={index}
                    record={record}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
                <div className="p-6 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full w-fit mx-auto mb-6">
                  <FaNotesMedical className="h-16 w-16 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  No medical records yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                  Upload your first encrypted medical record to get started.
                </p>
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                >
                  <FiUpload className="mr-2 h-4 w-4" />
                  Upload Medical Record
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Upload Record Tab */}
        {activeTab === "upload" && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                Upload Medical Record
                <FiUpload className="h-8 w-8 text-purple-600" />
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Securely upload and encrypt your medical records with hybrid AES + CP-ABE encryption
              </p>
            </div>

            <MedicalRecordUpload
              patientId={patientIdValue}
              doctors={doctors}
              onSuccess={() => {
                toast.success("Medical record uploaded successfully!");
                setActiveTab("medical");
              }}
            />
          </div>
        )}

        {/* Access Requests Tab */}
        {activeTab === "access" && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                Access Request Management
                <FiShield className="h-8 w-8 text-blue-600" />
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Review and manage doctor access requests to your encrypted medical records
              </p>
            </div>

            <AccessRequestManagement patientId={patientIdValue} />
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Encrypted Medical Record"
        size="large"
      >
        <MedicalRecordUpload
          patientId={patientIdValue}
          doctors={doctors}
          onSuccess={() => {
            setShowUploadModal(false);
            window.location.reload();
          }}
        />
      </Modal>

      <Modal
        isOpen={showAccessRequestsModal}
        onClose={() => setShowAccessRequestsModal(false)}
        title="Access Requests Management"
        size="large"
      >
        <AccessRequestManagement patientId={patientIdValue} />
      </Modal>
    </>
  );
};

export default PatientHistory;
