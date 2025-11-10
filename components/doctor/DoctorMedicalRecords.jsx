import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiSearch,
  FiFileText,
  FiCheck,
  FiArrowLeft,
  FiInfo,
  FiHeart,
  FiActivity,
  FiMapPin,
  FiPhone,
  FiMail,
  FiStar,
  FiAward,
  FiPlusCircle,
  FiEdit3,
  FiEye,
  FiSave,
  FiX,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdVerifiedUser,
  MdHistory,
  MdMedicalServices,
  MdHealthAndSafety,
  MdSecurity,
  MdBiotech,
  MdPersonalInjury,
  MdMonitorHeart,
  MdInventory,
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
import { truncateAddress } from "../../utils/helpers";
import toast from "react-hot-toast";

const PatientRecordCard = ({ patient, onSelect, onViewHistory }) => {
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

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
      <div className="p-8">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-r from-teal-500 to-cyan-500">
            {loading ? (
              <LoadingSpinner size="small" />
            ) : patientData?.profileImage ? (
              <img
                src={ipfsService.getIPFSUrl(patientData.profileImage)}
                alt={`${patientData?.name || "Patient"}`}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <FaHospitalUser className="h-10 w-10 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MdPersonalInjury className="h-5 w-5 text-teal-600" />
                  {patientData?.name || `Patient #${patient.id}`}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <MdSecurity className="h-3 w-3" />
                  ID: #{patient.id} • {truncateAddress(patient.accountAddress)}
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none text-xs shadow-md">
                <MdVerifiedUser className="w-3 h-3 mr-1" />
                Registered
              </Badge>
            </div>

            {patientData?.age && (
              <div className="bg-white rounded-xl p-3 border-2 border-blue-100 shadow-sm mb-4">
                <div className="flex items-center space-x-6 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <FiClock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Age:</span> {patientData.age}{" "}
                    years
                  </div>
                  {patientData?.bloodGroup && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs border-none shadow-md">
                      <FaHeartbeat className="w-3 h-3 mr-1" />
                      {patientData.bloodGroup}
                    </Badge>
                  )}
                  {patientData?.gender && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Gender:</span>{" "}
                      {patientData.gender}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center mb-4 bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
              <div className="p-2">
                <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl w-fit mx-auto mb-2">
                  <FaNotesMedical className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  {patient.medicalHistory?.length || 0}
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Medical Records
                </p>
              </div>
              <div className="p-2">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl w-fit mx-auto mb-2">
                  <FaPrescriptionBottleAlt className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {patient.boughtMedicines?.length || 0}
                </p>
                <p className="text-xs text-gray-600 font-medium">Medicines</p>
              </div>
              <div className="p-2">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl w-fit mx-auto mb-2">
                  <FiCalendar className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-bold text-purple-600">
                  {patientData?.lastVisit || "N/A"}
                </p>
                <p className="text-xs text-gray-600 font-medium">Last Visit</p>
              </div>
            </div>

            {patientData?.emergencyContact && (
              <div className="bg-white rounded-xl p-3 border-2 border-orange-200 shadow-sm mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <FiPhone className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Emergency Contact
                    </p>
                    <span className="font-medium">
                      {patientData.emergencyContact}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => onViewHistory(patient)}
                  className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50 shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  <FiEye className="h-4 w-4 mr-2" />
                  View History
                </Button>
                <Button
                  size="small"
                  onClick={() => onSelect(patient)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <FiEdit3 className="h-4 w-4 mr-2" />
                  Update Records
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const MedicalHistoryModal = ({ isOpen, onClose, patient, medicalHistory }) => {
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

        <div className="inline-block align-bottom bg-gradient-to-br from-white to-blue-50 rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border-2 border-blue-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
                <FaNotesMedical className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Medical History
                  <MdHistory className="h-6 w-6 text-teal-600" />
                </h3>
                <p className="text-gray-600">
                  {patient?.name || `Patient #${patient?.id}`}
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

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {medicalHistory && medicalHistory.length > 0 ? (
              medicalHistory.map((record, index) => (
                <Card
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                        <FiFileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-lg font-bold text-gray-900">
                            Medical Record #{index + 1}
                          </span>
                          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs border-none shadow-md">
                            <FiCalendar className="w-3 h-3 mr-1" />
                            {new Date().toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
                          <p className="text-gray-700 leading-relaxed">
                            {record}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full w-fit mx-auto mb-6 shadow-lg">
                  <MdHistory className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Medical History
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  No medical history records found for this patient. Records
                  will appear here once they are added.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UpdateRecordsModal = ({ isOpen, onClose, patient, onSave }) => {
  const [newRecord, setNewRecord] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newRecord.trim()) {
      toast.error("Please enter medical record details");
      return;
    }

    try {
      setSaving(true);
      await onSave(patient.id, newRecord);
      setNewRecord("");
      onClose();
    } catch (error) {
      console.error("Error saving record:", error);
    } finally {
      setSaving(false);
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

        <div className="inline-block align-bottom bg-gradient-to-br from-white to-emerald-50 rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                <FiEdit3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Update Medical Records
                  <MdMedicalServices className="h-6 w-6 text-emerald-600" />
                </h3>
                <p className="text-gray-600">
                  {patient?.name || `Patient #${patient?.id}`}
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FaNotesMedical className="h-4 w-4 text-emerald-600" />
                Medical Record Details *
              </label>
              <textarea
                value={newRecord}
                onChange={(e) => setNewRecord(e.target.value)}
                placeholder="Enter detailed medical record information, diagnosis, treatment notes, etc..."
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-md"
                rows="6"
                required
              />
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <FiInfo className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 mb-3 text-lg">
                      Professional Record Guidelines
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-center gap-2">
                          <FiCheckCircle className="h-4 w-4 text-blue-600" />
                          Include diagnosis and symptoms
                        </li>
                        <li className="flex items-center gap-2">
                          <FaPrescriptionBottleAlt className="h-4 w-4 text-blue-600" />
                          Mention prescribed medications
                        </li>
                      </ul>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-center gap-2">
                          <FiCalendar className="h-4 w-4 text-blue-600" />
                          Note follow-up requirements
                        </li>
                        <li className="flex items-center gap-2">
                          <MdMonitorHeart className="h-4 w-4 text-blue-600" />
                          Add clinical observations
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="border-2 border-gray-300 hover:bg-gray-50 shadow-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={saving}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="small" color="white" />
                    <span>Saving Record...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiSave className="h-4 w-4" />
                    <span>Save Record</span>
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

const DoctorMedicalRecords = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  // Modals
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    patient: null,
    history: [],
  });
  const [updateModal, setUpdateModal] = useState({
    isOpen: false,
    patient: null,
  });

  const [refreshing, setRefreshing] = useState(false);

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getAllPatients,
    getDoctorId,
    getDoctorDetails,
    getPatientMedicalHistory,
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
          router.push("/doctor/register");
          return;
        }

        // Get doctor data
        const doctorId = await getDoctorId(address);
        if (!doctorId) {
          router.push("/doctor/register");
          return;
        }

        const [doctorDetails, allPatients] = await Promise.all([
          getDoctorDetails(doctorId),
          getAllPatients(),
        ]);

        setDoctorData(doctorDetails);
        setPatients(allPatients || []);
        setFilteredPatients(allPatients || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load medical records data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address, router.query]);

  // Filter and sort patients
  useEffect(() => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((patient) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          patient.id.toString().includes(searchLower) ||
          patient.name?.toLowerCase().includes(searchLower) ||
          patient.accountAddress.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort patients
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "id":
          return Number(a.id) - Number(b.id);
        case "records":
          return (
            (b.medicalHistory?.length || 0) - (a.medicalHistory?.length || 0)
          );
        case "recent":
        default:
          return Number(b.id) - Number(a.id); // Most recent first
      }
    });

    setFilteredPatients(filtered);
  }, [patients, searchTerm, sortBy]);

  const handleViewHistory = async (patient) => {
    try {
      setLoading(true);
      const history = await getPatientMedicalHistory(patient.id);
      setHistoryModal({
        isOpen: true,
        patient,
        history: history || patient.medicalHistory || [],
      });
    } catch (error) {
      console.error("Error fetching medical history:", error);
      toast.error("Failed to load medical history");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecords = (patient) => {
    setUpdateModal({
      isOpen: true,
      patient,
    });
  };

  const handleSaveRecord = async (patientId, newRecord) => {
    try {
      await updatePatientMedicalHistory(patientId, newRecord);
      toast.success("Medical record updated successfully!");

      // Refresh patient data
      const allPatients = await getAllPatients();
      setPatients(allPatients || []);
    } catch (error) {
      console.error("Error updating medical record:", error);
      toast.error("Failed to update medical record");
      throw error;
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const allPatients = await getAllPatients();
      setPatients(allPatients || []);
      toast.success("Patient records refreshed");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="p-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <FaNotesMedical className="h-16 w-16 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-cyan-300 rounded-full animate-ping animation-delay-1000"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-6 text-gray-700 font-bold text-lg">
            Loading Medical Records...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Accessing patient database
          </p>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 shadow-2xl">
          <div className="text-center py-12">
            <div className="relative mb-8">
              <div className="p-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-fit mx-auto shadow-2xl">
                <FaUserMd className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <FiAlertCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <MdHealthAndSafety className="h-6 w-6 text-red-600" />
              Doctor Registration Required
            </h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              You need to register as a healthcare professional to access
              medical records and manage patient data.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/doctor/register")}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 w-full shadow-lg"
              >
                <FaUserMd className="mr-2 h-5 w-5" />
                Register as Doctor
              </Button>
              <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
                <MdSecurity className="h-4 w-4" />
                <span>Medical License Verification Required</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 relative">
      {/* Medical Background Elements */}
      <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
        <FaNotesMedical className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaStethoscope className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdHistory className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-2xl p-8 text-white shadow-2xl border-2 border-teal-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              size="small"
              onClick={() => router.push("/doctor/dashboard")}
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm shadow-lg"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
                <FaNotesMedical className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  Medical Records
                  <MdHistory className="h-8 w-8" />
                </h1>
                <p className="text-teal-100 text-lg flex items-center gap-2">
                  <MdSecurity className="h-4 w-4" />
                  View and update patient medical records
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
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

        {/* Enhanced Doctor Info */}
        <Card className="bg-white bg-opacity-10 border-white border-opacity-20 backdrop-blur-sm shadow-lg relative z-10">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                <FaUserMd className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <MdVerifiedUser className="h-5 w-5" />
                  Dr. {doctorData.name || `Doctor #${doctorData.id}`}
                </h3>
                <p className="text-teal-100 font-medium">
                  Doctor ID: #{doctorData.id} • {truncateAddress(address)}
                </p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none shadow-md">
                  <MdHealthAndSafety className="w-4 h-4 mr-1" />
                  Medical Professional
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
              <FiSearch className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Search & Filter Patients
              </h2>
              <p className="text-gray-600">
                Find and manage patient medical records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FiSearch className="h-4 w-4" />
                Search Patients
              </label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by ID, name, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FiFilter className="h-4 w-4" />
                Sort by
              </label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="id">Patient ID</option>
                <option value="records">Medical Records Count</option>
              </Select>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
            <div className="flex items-center justify-between text-sm text-blue-700">
              <p className="flex items-center gap-2">
                <FaHospitalUser className="h-4 w-4" />
                <strong>Showing:</strong> {filteredPatients.length} of{" "}
                {patients.length} patients
              </p>
              <div className="flex items-center space-x-6">
                <span className="flex items-center gap-2">
                  <FaNotesMedical className="h-4 w-4" />
                  <strong>Total Records:</strong>{" "}
                  {patients.reduce(
                    (sum, p) => sum + (p.medicalHistory?.length || 0),
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center p-8">
            <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
              <FaHospitalUser className="h-10 w-10 text-white" />
            </div>
            <p className="text-3xl font-bold text-teal-600 mb-2">
              {patients.length}
            </p>
            <p className="text-sm text-gray-600 font-medium">Total Patients</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center p-8">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
              <FaNotesMedical className="h-10 w-10 text-white" />
            </div>
            <p className="text-3xl font-bold text-emerald-600 mb-2">
              {patients.reduce(
                (sum, p) => sum + (p.medicalHistory?.length || 0),
                0
              )}
            </p>
            <p className="text-sm text-gray-600 font-medium">Medical Records</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center p-8">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
              <FaPrescriptionBottleAlt className="h-10 w-10 text-white" />
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2">
              {patients.reduce(
                (sum, p) => sum + (p.boughtMedicines?.length || 0),
                0
              )}
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Prescribed Medicines
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center p-8">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
              <FiActivity className="h-10 w-10 text-white" />
            </div>
            <p className="text-3xl font-bold text-orange-600 mb-2">
              {patients.filter((p) => p.medicalHistory?.length > 0).length}
            </p>
            <p className="text-sm text-gray-600 font-medium">Active Records</p>
          </div>
        </Card>
      </div>

      {/* Patient Records */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPatients.map((patient) => (
            <PatientRecordCard
              key={patient.id}
              patient={patient}
              onSelect={handleUpdateRecords}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
          <div className="p-6 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full w-fit mx-auto mb-6 shadow-lg">
            <MdHistory className="h-16 w-16 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {searchTerm ? "No Patients Found" : "No Patients Registered"}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm
              ? "Try adjusting your search criteria to find the patients you're looking for."
              : "There are currently no registered patients in the system. Patients will appear here once they register."}
          </p>
        </Card>
      )}

      {/* Professional Guidelines */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 shadow-xl">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
              <MdHealthAndSafety className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Medical Records Management Guidelines
                <MdSecurity className="h-5 w-5 text-indigo-600" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 border-2 border-indigo-100 shadow-sm">
                  <h4 className="font-bold text-indigo-900 mb-3">
                    Record Keeping Standards
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="h-4 w-4 text-teal-600" />
                      Maintain accurate and detailed patient records
                    </li>
                    <li className="flex items-center gap-2">
                      <FiShield className="h-4 w-4 text-blue-600" />
                      Ensure patient confidentiality at all times
                    </li>
                    <li className="flex items-center gap-2">
                      <MdBiotech className="h-4 w-4 text-purple-600" />
                      Document all diagnoses and treatments
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-indigo-100 shadow-sm">
                  <h4 className="font-bold text-indigo-900 mb-3">
                    Best Practices
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <FiFileText className="h-4 w-4 text-emerald-600" />
                      Include relevant medical history and context
                    </li>
                    <li className="flex items-center gap-2">
                      <MdMonitorHeart className="h-4 w-4 text-red-600" />
                      Regular updates for ongoing treatments
                    </li>
                    <li className="flex items-center gap-2">
                      <FiTrendingUp className="h-4 w-4 text-orange-600" />
                      Monitor patient progress and outcomes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <MedicalHistoryModal
        isOpen={historyModal.isOpen}
        onClose={() =>
          setHistoryModal({ isOpen: false, patient: null, history: [] })
        }
        patient={historyModal.patient}
        medicalHistory={historyModal.history}
      />

      <UpdateRecordsModal
        isOpen={updateModal.isOpen}
        onClose={() => setUpdateModal({ isOpen: false, patient: null })}
        patient={updateModal.patient}
        onSave={handleSaveRecord}
      />
    </div>
  );
};

export default DoctorMedicalRecords;
