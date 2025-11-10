import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiFileText,
  FiActivity,
  FiHeart,
  FiTrendingUp,
  FiDownload,
  FiFilter,
  FiSearch,
  FiEye,
  FiMapPin,
  FiPhone,
  FiMail,
  FiAward,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiClipboard,
  FiRefreshCw,
  FiArrowLeft,
  FiShield,
  FiInfo,
} from "react-icons/fi";
import {
  MdVerifiedUser,
  MdLocalHospital,
  MdHistory,
  MdHealthAndSafety,
  MdMedicalServices,
  MdSchedule,
  MdEmergency,
  MdBiotech,
  MdSecurity,
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
import { Card, Button, Input, Select, Badge } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import {
  truncateAddress,
  formatDate,
  safeNumberConversion,
} from "../../utils/helpers";
import { formatEther } from "viem";
import toast from "react-hot-toast";

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

const MedicalHistoryCard = ({ record, index }) => {
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
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);

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

        // Process data with safe number conversion
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

        console.log("Patient history data loaded:", {
          patientDetails,
          appointmentsCount: processedAppointments.length,
          medicalHistoryCount: (patientMedicalHistory || []).length,
          prescriptionsCount: processedPrescriptions.length,
          doctorsCount: processedDoctors.length,
          medicinesCount: processedMedicines.length,
        });

        setPatientData(patientDetails);
        setAppointments(processedAppointments);
        setMedicalHistory(patientMedicalHistory || []);
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

  const handleViewAppointmentDetails = (appointment) => {
    // You can implement a modal or navigate to appointment details
    console.log("View appointment details:", appointment);
  };

  const handleExportHistory = () => {
    // Implement export functionality
    toast.info("Export functionality coming soon!");
  };

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter((appointment) => {
    const doctor = doctors.find((d) => d.id === appointment.doctorId);

    const matchesSearch =
      !searchTerm ||
      appointment.id.toString().includes(searchTerm.toLowerCase()) ||
      doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.condition?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "completed" && appointment.isOpen === false) ||
      (statusFilter === "scheduled" && appointment.isOpen === true) ||
      (statusFilter === "pending" && appointment.isOpen === undefined);

    return matchesSearch && matchesStatus;
  });

  const tabs = [
    {
      id: "appointments",
      label: "Appointments",
      icon: MdSchedule,
      count: filteredAppointments.length,
      description: "Your consultation history",
    },
    {
      id: "medical",
      label: "Medical Records",
      icon: FaNotesMedical,
      count: medicalHistory.length,
      description: "Medical history and notes",
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: FaPrescriptionBottleAlt,
      count: prescriptions.length,
      description: "Prescribed medications",
    },
  ];

  // Calculate statistics
  const stats = {
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter((a) => a.isOpen === false)
      .length,
    totalPrescriptions: prescriptions.length,
    medicalRecords: medicalHistory.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <MdHistory className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full animate-ping"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading medical history...
          </p>
          <p className="text-sm text-gray-500">Accessing healthcare records</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-fit mx-auto shadow-lg">
                <FaHospitalUser className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <MdEmergency className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <MdHealthAndSafety className="h-5 w-5 text-red-600" />
              Patient Registration Required
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You need to register as a patient on our secure healthcare
              platform to access your medical history and records.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/patient/register")}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 w-full"
              >
                <FaHospitalUser className="mr-2 h-4 w-4" />
                Register as Patient
              </Button>
              <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
                <FiShield className="h-4 w-4" />
                <span>HIPAA Compliant & Blockchain Secured</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 relative">
      {/* Medical Background Elements */}
      <div className="absolute inset-0 opacity-5 overflow-hidden">
        <MdHistory className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaStethoscope className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdLocalHospital className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Enhanced Header */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center space-x-6 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/patient/dashboard")}
            className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
              <MdHistory className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                Medical History
                <MdHealthAndSafety className="h-8 w-8 text-teal-600" />
              </h1>
              <p className="text-xl text-gray-600">
                Your complete healthcare records and consultation history
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div></div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleExportHistory}
              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export Records
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-blue-200 shadow-lg">
                <MdSchedule className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalAppointments}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Total Appointments
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200 shadow-lg">
                <FiCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 mb-2">
                {stats.completedAppointments}
              </p>
              <p className="text-sm text-gray-600 font-medium">Completed</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-purple-200 shadow-lg">
                <FaPrescriptionBottleAlt className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {stats.totalPrescriptions}
              </p>
              <p className="text-sm text-gray-600 font-medium">Prescriptions</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-orange-200 shadow-lg">
                <FaNotesMedical className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-2">
                {stats.medicalRecords}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Medical Records
              </p>
            </div>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-2 border-2 border-gray-200">
          <nav className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 py-4 px-6 font-bold text-sm flex items-center justify-center space-x-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge
                      className={
                        activeTab === tab.id
                          ? "bg-white text-teal-600 border-none text-xs flex-shrink-0"
                          : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-none text-xs flex-shrink-0"
                      }
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
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
              Your medical history and health records maintained by healthcare
              providers
            </p>
          </div>

          {medicalHistory.length > 0 ? (
            <div className="space-y-6">
              {medicalHistory.map((record, index) => (
                <MedicalHistoryCard key={index} record={record} index={index} />
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
                Your medical history will be updated by doctors during
                consultations and stored securely on the blockchain.
              </p>
              <Button
                onClick={() => router.push("/patient/book-appointment")}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                <FaStethoscope className="mr-2 h-4 w-4" />
                Book Medical Consultation
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === "prescriptions" && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              Prescription History
              <FaPrescriptionBottleAlt className="h-8 w-8 text-blue-600" />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Medications prescribed by your doctors during consultations
            </p>
          </div>

          {prescriptions.length > 0 ? (
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <PrescriptionHistoryCard
                  key={prescription.id}
                  prescription={prescription}
                  medicines={medicines}
                  doctors={doctors}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full w-fit mx-auto mb-6">
                <FaPrescriptionBottleAlt className="h-16 w-16 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No prescriptions yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                Medicines prescribed by doctors will appear here after
                consultations and be securely stored on the blockchain.
              </p>
              <Button
                onClick={() => router.push("/patient/book-appointment")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                <FaStethoscope className="mr-2 h-4 w-4" />
                Book Medical Appointment
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
