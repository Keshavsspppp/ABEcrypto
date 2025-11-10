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
  FiMinus,
  FiShoppingBag,
  FiDollarSign,
  FiFilter,
  FiArrowRight,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdVerifiedUser,
  MdHealthAndSafety,
  MdMedicalServices,
  MdBiotech,
  MdSecurity,
  MdInventory,
  MdPayment,
  MdPersonalInjury,
  MdMonitorHeart,
} from "react-icons/md";
import { BsPrescription2 } from "react-icons/bs";
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
import { truncateAddress, safeNumberConversion } from "../../utils/helpers";
import { formatEther } from "viem";
import toast from "react-hot-toast";

const PatientSelectionCard = ({ patient, onSelect, isSelected }) => {
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

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Patient card clicked:", patient);
    onSelect(patient);
  };

  const patientId = safeNumberConversion(patient.id);

  return (
    <div
      className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl transform hover:scale-105 hover:shadow-2xl ${
        isSelected
          ? "ring-4 ring-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-300 shadow-xl"
          : "hover:shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-300"
      }`}
      onClick={handleClick}
    >
      <div className="p-8">
        <div className="flex items-start space-x-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              isSelected
                ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                : "bg-gradient-to-r from-emerald-400 to-green-500"
            }`}
          >
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                <MdPersonalInjury className="h-5 w-5 text-teal-600" />
                {patientData?.name || `Patient #${patientId}`}
              </h3>
              {isSelected && (
                <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-lg">
                  <FiCheckCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            {patientData?.age && (
              <p className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                <FiClock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Age:</span> {patientData.age}{" "}
                years
              </p>
            )}

            <div className="flex items-center space-x-3 mb-4 flex-wrap">
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none text-xs shadow-md">
                <MdVerifiedUser className="w-3 h-3 mr-1" />
                Verified Patient
              </Badge>
              {patientData?.bloodGroup && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none text-xs shadow-md">
                  <FaHeartbeat className="w-3 h-3 mr-1" />
                  {patientData.bloodGroup}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 text-center mb-4 bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
              <div className="p-3">
                <div className="p-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl w-fit mx-auto mb-2">
                  <FaNotesMedical className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-lg font-bold text-teal-600">
                  {patient.medicalHistory?.length || 0}
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Medical Records
                </p>
              </div>
              <div className="p-3">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl w-fit mx-auto mb-2">
                  <FaPrescriptionBottleAlt className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {patient.boughtMedicines?.length || 0}
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Prescriptions
                </p>
              </div>
            </div>

            {patientData?.emergencyContact && (
              <div className="flex items-center text-sm text-gray-700 bg-white rounded-lg p-3 border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FiPhone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Emergency Contact
                  </p>
                  <span className="font-medium truncate">
                    {patientData.emergencyContact}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicineSelectionCard = ({
  medicine,
  onSelect,
  isSelected,
  quantity = 0,
  onQuantityChange,
}) => {
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMedicineData = async () => {
      if (medicine.IPFS_URL) {
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
  }, [medicine.IPFS_URL]);

  const medicineId = safeNumberConversion(medicine.id);
  const medicineQuantity = safeNumberConversion(medicine.quantity);
  const medicineDiscount = safeNumberConversion(medicine.discount);

  const handleSelectClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(medicine);
  };

  const handleQuantityChange = (change, e) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = Math.max(
      1,
      Math.min(medicineQuantity, quantity + change)
    );
    onQuantityChange(medicineId, newQuantity);
  };

  const formatPrice = (price) => {
    try {
      return formatEther(price);
    } catch {
      return "0";
    }
  };

  const getDiscountedPrice = () => {
    const basePrice = parseFloat(formatPrice(medicine.price));
    const discount = medicineDiscount || 0;
    return basePrice * (1 - discount / 100);
  };

  return (
    <div
      className={`transition-all duration-300 border-2 rounded-2xl transform hover:scale-105 hover:shadow-2xl ${
        isSelected
          ? "ring-4 ring-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-xl"
          : "border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 hover:border-blue-300 hover:shadow-lg"
      } ${!medicine.active ? "opacity-60 grayscale" : ""}`}
    >
      <div className="p-8">
        <div className="flex items-start space-x-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              medicine.active
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : "bg-gradient-to-r from-gray-400 to-gray-500"
            }`}
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : medicineData?.image ? (
              <img
                src={ipfsService.getIPFSUrl(medicineData.image)}
                alt={medicineData?.name || "Medicine"}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <FaPrescriptionBottleAlt className="h-10 w-10 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                  <MdBiotech className="h-5 w-5 text-blue-600" />
                  {medicineData?.name || `Medicine #${medicineId}`}
                </h3>
                {medicineData?.manufacturer && (
                  <p className="text-sm text-gray-600 truncate flex items-center gap-1 mt-1">
                    <MdMedicalServices className="h-3 w-3" />
                    by {medicineData.manufacturer}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-6">
                <div className="bg-white rounded-xl p-3 border-2 border-blue-200 shadow-md">
                  <p className="text-xl font-bold text-blue-600">
                    {getDiscountedPrice().toFixed(4)} ETH
                  </p>
                  {medicineDiscount > 0 && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(medicine.price)} ETH
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 mb-4 flex-wrap">
              <Badge
                className={`text-xs border-none shadow-md ${
                  medicine.active
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                }`}
              >
                <div className="flex items-center gap-1">
                  {medicine.active ? (
                    <FiCheckCircle className="w-3 h-3" />
                  ) : (
                    <FiAlertCircle className="w-3 h-3" />
                  )}
                  {medicine.active ? "Available" : "Unavailable"}
                </div>
              </Badge>
              {medicineDiscount > 0 && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs border-none shadow-md">
                  <FiStar className="w-3 h-3 mr-1" />
                  {medicineDiscount}% OFF
                </Badge>
              )}
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs border-none shadow-md">
                <MdInventory className="w-3 h-3 mr-1" />
                Stock: {medicineQuantity}
              </Badge>
            </div>

            {medicineData?.description && (
              <p className="text-sm text-gray-700 mb-4 line-clamp-2 bg-white rounded-lg p-3 border border-gray-200">
                {medicineData.description}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4 text-center mb-6 bg-white rounded-xl p-4 border-2 border-gray-100 shadow-sm">
              <div>
                <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl w-fit mx-auto mb-2">
                  <FaSyringe className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-blue-600">
                  {medicineData?.dosage || "N/A"}
                </p>
                <p className="text-xs text-gray-500 font-medium">Dosage</p>
              </div>
              <div>
                <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl w-fit mx-auto mb-2">
                  <MdBiotech className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-600">
                  {medicineData?.type || "N/A"}
                </p>
                <p className="text-xs text-gray-500 font-medium">Type</p>
              </div>
              <div>
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl w-fit mx-auto mb-2">
                  <FiMapPin className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-sm font-bold text-purple-600">
                  {medicine.currentLocation}
                </p>
                <p className="text-xs text-gray-500 font-medium">Location</p>
              </div>
            </div>

            {medicine.active && (
              <div className="flex items-center justify-between">
                <Button
                  variant={isSelected ? "success" : "outline"}
                  size="small"
                  onClick={handleSelectClick}
                  className={
                    isSelected
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg"
                      : "border-2 border-blue-300 text-blue-700 hover:bg-blue-50 shadow-md"
                  }
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <FiCheckCircle className="h-4 w-4" />
                    ) : (
                      <FaPrescriptionBottleAlt className="h-4 w-4" />
                    )}
                    {isSelected ? "Selected" : "Select Medicine"}
                  </div>
                </Button>

                {isSelected && (
                  <div className="flex items-center space-x-3 bg-white rounded-xl p-2 border-2 border-blue-200 shadow-md">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={(e) => handleQuantityChange(-1, e)}
                      disabled={quantity <= 1}
                      className="p-2 border-2 border-gray-300 hover:bg-gray-50 rounded-lg"
                    >
                      <FiMinus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-bold text-sm shadow-md">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={(e) => handleQuantityChange(1, e)}
                      disabled={quantity >= medicineQuantity}
                      className="p-2 border-2 border-gray-300 hover:bg-gray-50 rounded-lg"
                    >
                      <FiPlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorPrescribeMedicine = () => {
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState(new Map());
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescribingLoading, setPrescribingLoading] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [prescriptionForm, setPrescriptionForm] = useState({
    instructions: "",
    duration: "",
    frequency: "",
    notes: "",
  });

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getAllPatients,
    getAllMedicines,
    getDoctorId,
    getDoctorDetails,
    prescribeMedicine,
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

        const [doctorDetails, allPatients, allMedicines] = await Promise.all([
          getDoctorDetails(doctorId).catch(() => null),
          getAllPatients().catch(() => []),
          getAllMedicines().catch(() => []),
        ]);

        if (!doctorDetails) {
          router.push("/doctor/register");
          return;
        }

        setDoctorData(doctorDetails);

        // Process patients and medicines with safe number conversion
        const processedPatients = (allPatients || []).map((patient) => ({
          ...patient,
          id: safeNumberConversion(patient.id),
        }));

        const processedMedicines = (allMedicines || []).map((medicine) => ({
          ...medicine,
          id: safeNumberConversion(medicine.id),
          quantity: safeNumberConversion(medicine.quantity),
          discount: safeNumberConversion(medicine.discount),
        }));

        setPatients(processedPatients);
        setMedicines(processedMedicines);
        setFilteredMedicines(processedMedicines);

        console.log("Data loaded successfully:", {
          patients: processedPatients.length,
          medicines: processedMedicines.length,
          doctor: doctorDetails,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load prescription data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address, router]);

  // Filter medicines based on search and category
  useEffect(() => {
    let filtered = medicines;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((medicine) => {
        const searchLower = searchTerm.toLowerCase();
        const medicineId = safeNumberConversion(medicine.id);
        return (
          medicineId.toString().includes(searchLower) ||
          medicine.currentLocation?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((medicine) => {
        switch (filterCategory) {
          case "available":
            return medicine.active;
          case "unavailable":
            return !medicine.active;
          case "discounted":
            return safeNumberConversion(medicine.discount) > 0;
          default:
            return true;
        }
      });
    }

    setFilteredMedicines(filtered);
  }, [medicines, searchTerm, filterCategory]);

  const handlePatientSelect = (patient) => {
    console.log("handlePatientSelect called with:", patient);
    const patientId = safeNumberConversion(patient.id);

    setSelectedPatient((prevSelected) => {
      const newSelected =
        prevSelected && safeNumberConversion(prevSelected.id) === patientId
          ? null
          : patient;
      console.log(
        "Patient selection updated:",
        newSelected ? `Patient #${patientId}` : "None"
      );
      return newSelected;
    });
  };

  const handleMedicineSelect = (medicine) => {
    console.log("handleMedicineSelect called with:", medicine);
    const medicineId = safeNumberConversion(medicine.id);

    setSelectedMedicines((prevSelected) => {
      const newSelected = new Map(prevSelected);

      if (newSelected.has(medicineId)) {
        newSelected.delete(medicineId);
        console.log("Medicine removed:", medicineId);
      } else {
        newSelected.set(medicineId, { medicine, quantity: 1 });
        console.log("Medicine added:", medicineId);
      }

      console.log("Total selected medicines:", newSelected.size);
      return newSelected;
    });
  };

  const handleQuantityChange = (medicineId, quantity) => {
    console.log("handleQuantityChange called:", { medicineId, quantity });

    setSelectedMedicines((prevSelected) => {
      const newSelected = new Map(prevSelected);

      if (quantity <= 0) {
        newSelected.delete(medicineId);
      } else {
        const existing = newSelected.get(medicineId);
        if (existing) {
          newSelected.set(medicineId, { ...existing, quantity });
        }
      }

      return newSelected;
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    console.log("handleNextStep called", {
      step,
      selectedPatient: selectedPatient
        ? safeNumberConversion(selectedPatient.id)
        : null,
      selectedMedicinesCount: selectedMedicines.size,
    });

    if (step === 1) {
      if (!selectedPatient) {
        toast.error("Please select a patient first");
        return;
      }
      console.log("Moving from step 1 to step 2");
      setStep(2);
    } else if (step === 2) {
      if (selectedMedicines.size === 0) {
        toast.error("Please select at least one medicine");
        return;
      }
      console.log("Moving from step 2 to step 3");
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/doctor/dashboard");
    }
  };

  const handlePrescribeMedicines = async () => {
    if (!selectedPatient || selectedMedicines.size === 0) {
      toast.error("Please select patient and medicines");
      return;
    }

    try {
      setPrescribingLoading(true);
      console.log("Starting prescription process...");

      const patientId = safeNumberConversion(selectedPatient.id);

      // Prescribe each selected medicine
      for (const [medicineId, { medicine, quantity }] of selectedMedicines) {
        console.log("Prescribing medicine:", {
          medicineId,
          patientId,
          quantity,
        });
        await prescribeMedicine(medicineId, patientId);
      }

      console.log("All medicines prescribed successfully");
      toast.success("Medicines prescribed successfully!");
      router.push("/doctor/dashboard");
    } catch (error) {
      console.error("Error prescribing medicines:", error);
      toast.error("Failed to prescribe medicines. Please try again.");
    } finally {
      setPrescribingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="p-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <FaPrescriptionBottleAlt className="h-16 w-16 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-cyan-300 rounded-full animate-ping animation-delay-1000"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-6 text-gray-700 font-bold text-lg">
            Loading Prescription System...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Connecting to healthcare network
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
              You need to register as a healthcare professional to access the
              prescription system and provide medical services.
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
        <FaPrescriptionBottleAlt className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaStethoscope className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdMedicalServices className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-2xl p-8 text-white shadow-2xl border-2 border-teal-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-12 translate-y-12"></div>

        <div className="flex items-center space-x-6 mb-6 relative z-10">
          <Button
            variant="outline"
            size="small"
            onClick={handlePrevStep}
            className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm shadow-lg"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            {step > 1 ? "Back" : "Dashboard"}
          </Button>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
              <FaPrescriptionBottleAlt className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                Prescribe Medicine
                <MdMedicalServices className="h-8 w-8" />
              </h1>
              <p className="text-teal-100 text-lg flex items-center gap-2">
                <MdSecurity className="h-4 w-4" />
                Select patient and prescribe appropriate medicines
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Step Indicator */}
        <div className="flex items-center space-x-6 relative z-10">
          {[
            { number: 1, label: "Select Patient", icon: FaHospitalUser },
            {
              number: 2,
              label: "Choose Medicines",
              icon: FaPrescriptionBottleAlt,
            },
            { number: 3, label: "Review & Prescribe", icon: FiCheckCircle },
          ].map((stepData, index) => (
            <div key={stepData.number} className="flex items-center">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                    step >= stepData.number
                      ? "bg-white text-teal-600 shadow-2xl transform scale-110"
                      : "bg-white bg-opacity-20 text-white border border-white border-opacity-30"
                  }`}
                >
                  {step > stepData.number ? (
                    <FiCheck className="h-6 w-6" />
                  ) : (
                    <stepData.icon className="h-6 w-6" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step >= stepData.number ? "text-white" : "text-teal-100"
                  }`}
                >
                  {stepData.label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`w-16 h-1 ml-6 rounded-full transition-all duration-300 ${
                    step > stepData.number
                      ? "bg-white shadow-lg"
                      : "bg-white bg-opacity-20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Patient */}
      {step === 1 && (
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
                  <FaHospitalUser className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Select Patient
                  </h2>
                  <p className="text-gray-600">
                    Choose the patient you want to prescribe medicine for
                  </p>
                </div>
              </div>

              {selectedPatient && (
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-4 mb-6 shadow-lg">
                  <div className="flex items-center text-white">
                    <FiCheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">
                      Selected: Patient #
                      {safeNumberConversion(selectedPatient.id)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {patients.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {patients.map((patient) => {
                const patientId = safeNumberConversion(patient.id);
                const isSelected =
                  selectedPatient &&
                  safeNumberConversion(selectedPatient.id) === patientId;

                return (
                  <PatientSelectionCard
                    key={patientId}
                    patient={patient}
                    onSelect={handlePatientSelect}
                    isSelected={isSelected}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
              <div className="p-6 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full w-fit mx-auto mb-6 shadow-lg">
                <FaHospitalUser className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                No Patients Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are currently no registered patients in the system.
                Patients need to register before you can prescribe medicines.
              </p>
            </Card>
          )}

          {selectedPatient && (
            <div className="flex justify-center">
              <Button
                onClick={handleNextStep}
                size="large"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-xl px-8 py-4"
              >
                <span>
                  Continue with Patient #
                  {safeNumberConversion(selectedPatient.id)}
                </span>
                <FiArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Choose Medicines */}
      {step === 2 && selectedPatient && (
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                  <FaPrescriptionBottleAlt className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Choose Medicines
                  </h2>
                  <p className="text-gray-600">
                    Select medicines to prescribe for Patient #
                    {safeNumberConversion(selectedPatient.id)}
                  </p>
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiSearch className="h-4 w-4" />
                    Search Medicine
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by ID or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiFilter className="h-4 w-4" />
                    Filter Category
                  </label>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  >
                    <option value="all">All Medicines</option>
                    <option value="available">Available Only</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="discounted">Discounted</option>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md w-full">
                    <div className="text-sm text-blue-700">
                      <p className="flex items-center gap-2 mb-1">
                        <FiCheckCircle className="h-4 w-4" />
                        <strong>Selected:</strong> {selectedMedicines.size}{" "}
                        medicines
                      </p>
                      <p className="flex items-center gap-2">
                        <MdInventory className="h-4 w-4" />
                        <strong>Available:</strong>{" "}
                        {filteredMedicines.filter((m) => m.active).length}{" "}
                        medicines
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Medicines Summary */}
          {selectedMedicines.size > 0 && (
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-teal-900 mb-6 flex items-center gap-2">
                  <FiCheckCircle className="h-6 w-6" />
                  Selected Medicines ({selectedMedicines.size})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from(selectedMedicines.values()).map(
                    ({ medicine, quantity }) => {
                      const medicineId = safeNumberConversion(medicine.id);
                      return (
                        <div
                          key={medicineId}
                          className="bg-white p-6 rounded-2xl border-2 border-teal-200 shadow-md"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                              <FaPrescriptionBottleAlt className="h-4 w-4 text-white" />
                            </div>
                            <p className="font-bold text-gray-900">
                              Medicine #{medicineId}
                            </p>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <FiShoppingBag className="h-3 w-3" />
                              <span className="font-medium">
                                Quantity:
                              </span>{" "}
                              {quantity}
                            </p>
                            <p className="flex items-center gap-2">
                              <FiMapPin className="h-3 w-3" />
                              <span className="font-medium">
                                Location:
                              </span>{" "}
                              {medicine.currentLocation}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Medicine List */}
          {filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredMedicines.map((medicine) => {
                const medicineId = safeNumberConversion(medicine.id);
                const isSelected = selectedMedicines.has(medicineId);
                const quantity =
                  selectedMedicines.get(medicineId)?.quantity || 0;

                return (
                  <MedicineSelectionCard
                    key={medicineId}
                    medicine={medicine}
                    onSelect={handleMedicineSelect}
                    isSelected={isSelected}
                    quantity={quantity}
                    onQuantityChange={handleQuantityChange}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
              <div className="p-6 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full w-fit mx-auto mb-6 shadow-lg">
                <FaPrescriptionBottleAlt className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                No Medicines Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                No medicines match your current filters. Try adjusting your
                search criteria.
              </p>
            </Card>
          )}

          {selectedMedicines.size > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={handleNextStep}
                size="large"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-xl px-8 py-4"
              >
                <span>
                  Review Prescription ({selectedMedicines.size} medicines)
                </span>
                <FiArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Prescribe */}
      {step === 3 && selectedPatient && selectedMedicines.size > 0 && (
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                  <FiCheckCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Review & Prescribe
                  </h2>
                  <p className="text-gray-600">
                    Review the prescription details before confirming
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Patient Info */}
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-xl">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaHospitalUser className="h-6 w-6 text-teal-600" />
                  Patient Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border-2 border-teal-100 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Patient ID:
                      </span>
                      <span className="font-bold text-teal-600">
                        #{safeNumberConversion(selectedPatient.id)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-teal-100 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Address:
                      </span>
                      <span className="font-bold text-gray-900">
                        {truncateAddress(selectedPatient.accountAddress)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-teal-100 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Medical Records:
                      </span>
                      <span className="font-bold text-emerald-600">
                        {selectedPatient.medicalHistory?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Enhanced Prescription Form */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaNotesMedical className="h-6 w-6 text-blue-600" />
                  Prescription Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FiFileText className="h-4 w-4" />
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={prescriptionForm.instructions}
                      onChange={handleFormChange}
                      placeholder="Detailed instructions for medicine usage..."
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FiClock className="h-4 w-4" />
                        Duration
                      </label>
                      <Input
                        type="text"
                        name="duration"
                        value={prescriptionForm.duration}
                        onChange={handleFormChange}
                        placeholder="e.g., 7 days"
                        className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FiActivity className="h-4 w-4" />
                        Frequency
                      </label>
                      <Input
                        type="text"
                        name="frequency"
                        value={prescriptionForm.frequency}
                        onChange={handleFormChange}
                        placeholder="e.g., 3 times daily"
                        className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FiInfo className="h-4 w-4" />
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={prescriptionForm.notes}
                      onChange={handleFormChange}
                      placeholder="Any additional notes or warnings..."
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Prescribed Medicines Summary */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl">
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaPrescriptionBottleAlt className="h-6 w-6 text-purple-600" />
                Prescribed Medicines ({selectedMedicines.size})
              </h3>
              <div className="bg-white rounded-2xl overflow-hidden border-2 border-purple-200 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <tr>
                        <th className="text-left py-4 px-6 font-bold">
                          Medicine ID
                        </th>
                        <th className="text-left py-4 px-6 font-bold">
                          Location
                        </th>
                        <th className="text-left py-4 px-6 font-bold">
                          Quantity
                        </th>
                        <th className="text-left py-4 px-6 font-bold">
                          Price (ETH)
                        </th>
                        <th className="text-left py-4 px-6 font-bold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(selectedMedicines.values()).map(
                        ({ medicine, quantity }, index) => {
                          const medicineId = safeNumberConversion(medicine.id);
                          const medicineDiscount = safeNumberConversion(
                            medicine.discount
                          );

                          const formatPrice = (price) => {
                            try {
                              return formatEther(price);
                            } catch {
                              return "0";
                            }
                          };

                          const getDiscountedPrice = () => {
                            const basePrice = parseFloat(
                              formatPrice(medicine.price)
                            );
                            const discount = medicineDiscount || 0;
                            return basePrice * (1 - discount / 100);
                          };

                          return (
                            <tr
                              key={medicineId}
                              className={`border-b border-purple-100 ${
                                index % 2 === 0 ? "bg-purple-25" : "bg-white"
                              } hover:bg-purple-50 transition-colors duration-200`}
                            >
                              <td className="py-4 px-6 font-bold text-purple-600">
                                #{medicineId}
                              </td>
                              <td className="py-4 px-6 font-medium text-gray-700">
                                {medicine.currentLocation}
                              </td>
                              <td className="py-4 px-6 font-bold text-blue-600">
                                {quantity}
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-bold text-green-600">
                                  {getDiscountedPrice().toFixed(4)}
                                </span>
                                {medicineDiscount > 0 && (
                                  <span className="ml-2 text-xs text-green-600 font-medium">
                                    ({medicineDiscount}% off)
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <Badge
                                  className={`text-xs border-none shadow-md ${
                                    medicine.active
                                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                                      : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                  }`}
                                >
                                  {medicine.active
                                    ? "Available"
                                    : "Unavailable"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Doctor Information */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                  <FaUserMd className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-1">
                    Prescribing Doctor
                  </h3>
                  <p className="text-emerald-700 font-medium">
                    Dr.{" "}
                    {doctorData.name ||
                      `Doctor #${safeNumberConversion(doctorData.id)}`}{" "}
                    • ID: #{safeNumberConversion(doctorData.id)} •
                    {truncateAddress(address)}
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none shadow-md">
                    <MdVerifiedUser className="w-4 h-4 mr-1" />
                    Verified Doctor
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Prescription Summary */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-8 border-yellow-400 border-2 border-yellow-200 shadow-xl">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <FiInfo className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-yellow-900 mb-3 text-lg">
                    Prescription Summary
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-yellow-800">
                      <li className="flex items-center gap-2">
                        <FaHospitalUser className="h-4 w-4" />
                        <span className="font-medium">Patient:</span> Patient #
                        {safeNumberConversion(selectedPatient.id)}
                      </li>
                      <li className="flex items-center gap-2">
                        <FaPrescriptionBottleAlt className="h-4 w-4" />
                        <span className="font-medium">
                          Total Medicines:
                        </span>{" "}
                        {selectedMedicines.size}
                      </li>
                      <li className="flex items-center gap-2">
                        <FaUserMd className="h-4 w-4" />
                        <span className="font-medium">
                          Prescribed by:
                        </span> Dr.{" "}
                        {doctorData.name ||
                          `Doctor #${safeNumberConversion(doctorData.id)}`}
                      </li>
                    </ul>
                    <ul className="space-y-2 text-sm text-yellow-800">
                      <li className="flex items-center gap-2">
                        <FiCalendar className="h-4 w-4" />
                        <span className="font-medium">Date:</span>{" "}
                        {new Date().toLocaleDateString()}
                      </li>
                      {prescriptionForm.duration && (
                        <li className="flex items-center gap-2">
                          <FiClock className="h-4 w-4" />
                          <span className="font-medium">Duration:</span>{" "}
                          {prescriptionForm.duration}
                        </li>
                      )}
                      {prescriptionForm.frequency && (
                        <li className="flex items-center gap-2">
                          <FiActivity className="h-4 w-4" />
                          <span className="font-medium">Frequency:</span>{" "}
                          {prescriptionForm.frequency}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Final Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handlePrescribeMedicines}
              disabled={prescribingLoading}
              size="large"
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-2xl px-12 py-6 transform hover:scale-105 transition-all duration-200"
            >
              {prescribingLoading ? (
                <div className="flex items-center space-x-3">
                  <LoadingSpinner size="small" color="white" />
                  <span className="text-lg font-bold">
                    Prescribing Medicines...
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FaPrescriptionBottleAlt className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-bold">
                    Prescribe Medicines ({selectedMedicines.size})
                  </span>
                  <FiCheckCircle className="h-6 w-6" />
                </div>
              )}
            </Button>
          </div>

          {/* Medical Disclaimer */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-8 border-blue-400 border-2 border-blue-200 shadow-lg">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <MdHealthAndSafety className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                    Medical Professional Guidelines
                    <MdSecurity className="h-5 w-5" />
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <FiShield className="h-3 w-3 text-blue-600" />
                        All prescriptions are recorded on the blockchain
                      </li>
                      <li className="flex items-center gap-2">
                        <MdVerifiedUser className="h-3 w-3 text-blue-600" />
                        Only verified doctors can prescribe medicines
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <FiFileText className="h-3 w-3 text-blue-600" />
                        Patient medical history is securely maintained
                      </li>
                      <li className="flex items-center gap-2">
                        <MdMonitorHeart className="h-3 w-3 text-blue-600" />
                        Follow standard medical prescribing guidelines
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescribeMedicine;
