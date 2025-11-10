import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiUser,
  FiCalendar,
  FiClock,
  FiShoppingCart,
  FiEye,
  FiInfo,
  FiAlertCircle,
  FiCheck,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiFileText,
  FiActivity,
  FiMapPin,
  FiDollarSign,
  FiPackage,
  FiDownload,
  FiClipboard,
  FiHeart,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import {
  MdVerifiedUser,
  MdLocalPharmacy,
  MdHealthAndSafety,
  MdMedicalServices,
  MdSecurity,
  MdEmergency,
  MdLocalHospital,
  MdBiotech,
  MdMonitorHeart,
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
  FaPills,
  FaPharmacy,
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

const PrescriptionCard = ({
  prescription,
  medicine,
  doctor,
  onPurchase,
  onViewDetails,
}) => {
  const [medicineData, setMedicineData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch medicine data
        if (medicine?.IPFS_URL) {
          const medicineHash = medicine.IPFS_URL.replace(
            "https://gateway.pinata.cloud/ipfs/",
            ""
          );
          const medicineData = await ipfsService.fetchFromIPFS(medicineHash);
          setMedicineData(medicineData);
        }

        // Fetch doctor data
        if (doctor?.IPFS_URL) {
          const doctorHash = doctor.IPFS_URL.replace(
            "https://gateway.pinata.cloud/ipfs/",
            ""
          );
          const doctorData = await ipfsService.fetchFromIPFS(doctorHash);
          setDoctorData(doctorData);
        }
      } catch (error) {
        console.error("Error fetching prescription data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [medicine?.IPFS_URL, doctor?.IPFS_URL]);

  // Safe conversions for medicine properties
  const medicinePrice = medicine ? safeNumberConversion(medicine.price) : 0;
  const medicineQuantity = medicine
    ? safeNumberConversion(medicine.quantity)
    : 0;
  const medicineDiscount = medicine
    ? safeNumberConversion(medicine.discount)
    : 0;
  const prescriptionId = safeNumberConversion(prescription.id);
  const prescriptionMedicineId = safeNumberConversion(prescription.medicineId);
  const prescriptionDoctorId = safeNumberConversion(prescription.doctorId);

  const price = medicine ? Number(formatEther(medicine.price || 0)) : 0;
  const discountedPrice = price * (1 - medicineDiscount / 100);
  const totalPrice = discountedPrice * quantity;
  const isAvailable = medicine?.active && medicineQuantity > 0;

  const handlePurchase = async () => {
    if (!medicine || !isAvailable || quantity > medicineQuantity) {
      toast.error("Medicine not available or insufficient stock");
      return;
    }

    try {
      setPurchasing(true);
      await onPurchase(prescriptionMedicineId, quantity, totalPrice);
      toast.success("Medicine purchased successfully!");
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Failed to purchase medicine");
    } finally {
      setPurchasing(false);
    }
  };

  const handleQuantityChange = (e) => {
    const newQuantity = Math.min(
      Math.max(1, Number(e.target.value)),
      medicineQuantity
    );
    setQuantity(newQuantity);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              {loading ? (
                <LoadingSpinner size="small" />
              ) : medicineData?.image ? (
                <img
                  src={ipfsService.getIPFSUrl(medicineData.image)}
                  alt={medicineData?.name || "Medicine"}
                  className="w-full h-full object-cover rounded-xl border-2 border-white"
                />
              ) : (
                <FaPrescriptionBottleAlt className="h-8 w-8 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-3 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {medicineData?.name || `Medicine #${prescriptionMedicineId}`}
                </h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none text-xs">
                  <FaPrescriptionBottleAlt className="w-3 h-3 mr-1" />
                  Prescribed
                </Badge>
              </div>

              {medicineData?.category && (
                <p className="text-sm text-purple-600 capitalize mb-3 font-medium truncate">
                  {medicineData.category}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3 flex-wrap">
                <div className="flex items-center bg-white p-2 rounded-lg border border-purple-200">
                  <FaUserMd className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                  <span className="truncate font-medium">
                    Dr.{" "}
                    {doctorData?.name ||
                      doctor?.name ||
                      `Doctor #${prescriptionDoctorId}`}
                  </span>
                </div>
                <div className="flex items-center bg-white p-2 rounded-lg border border-purple-200">
                  <FaNotesMedical className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                  <span className="font-medium">
                    Prescription #{prescriptionId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0 ml-4">
            <div className="flex items-center space-x-2 mb-3">
              {medicine && isAvailable ? (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none text-xs">
                  <FiCheckCircle className="w-3 h-3 mr-1" />
                  Available
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none text-xs">
                  <FiAlertCircle className="w-3 h-3 mr-1" />
                  Unavailable
                </Badge>
              )}
            </div>
            {medicine && (
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {discountedPrice.toFixed(4)} ETH
                </p>
                {medicineDiscount > 0 && (
                  <p className="text-sm text-gray-500 line-through">
                    {price.toFixed(4)} ETH
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Prescription Info */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-purple-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-bold text-purple-700 uppercase tracking-wide">
                Prescribed Date:
              </span>
              <p className="text-gray-700 font-medium">
                {formatDate(prescription.date) || "Not specified"}
              </p>
            </div>
            <div>
              <span className="font-bold text-purple-700 uppercase tracking-wide">
                Prescription ID:
              </span>
              <p className="text-gray-700 font-medium">#{prescriptionId}</p>
            </div>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              {doctorData?.profileImage ? (
                <img
                  src={ipfsService.getIPFSUrl(doctorData.profileImage)}
                  alt={`Dr. ${doctorData?.name}`}
                  className="w-full h-full object-cover rounded-full border-2 border-white"
                />
              ) : (
                <FaUserMd className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-bold text-blue-900 truncate">
                  Dr.{" "}
                  {doctorData?.name ||
                    doctor?.name ||
                    `Doctor #${prescriptionDoctorId}`}
                </h4>
                <MdVerifiedUser className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              </div>
              {doctorData?.specialization && (
                <p className="text-sm text-blue-700 capitalize truncate font-medium">
                  {doctorData.specialization}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Medicine Details Toggle */}
        {medicine && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <FiInfo className="h-4 w-4 mr-2" />
              {showDetails ? "Hide Details" : "View Medicine Details"}
              <FiArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Expandable Medicine Details */}
        {showDetails && medicine && (
          <div className="mb-6 p-4 bg-white rounded-xl border-2 border-purple-200 space-y-4 text-sm">
            {[
              { label: "Description", value: medicineData?.description },
              { label: "Composition", value: medicineData?.composition },
              { label: "Recommended Dosage", value: medicineData?.dosage },
              { label: "Manufacturer", value: medicineData?.manufacturer },
              { label: "Side Effects", value: medicineData?.sideEffects },
              { label: "Available Stock", value: `${medicineQuantity} units` },
              {
                label: "Location",
                value: medicine.currentLocation || "Not specified",
              },
              ...(medicineDiscount > 0
                ? [
                    {
                      label: "Discount",
                      value: `${medicineDiscount}% OFF`,
                      isDiscount: true,
                    },
                  ]
                : []),
            ]
              .filter((item) => item.value)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start p-3 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <span className="font-bold text-purple-700 uppercase tracking-wide text-xs">
                    {item.label}:
                  </span>
                  <span
                    className={`text-gray-700 font-medium text-right max-w-xs ${
                      item.isDiscount ? "text-emerald-600 font-bold" : ""
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Purchase Section */}
        {medicine && isAvailable ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-700 mb-2 uppercase tracking-wide">
                  Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  max={medicineQuantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="border-2 border-purple-200 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-700 mb-2 uppercase tracking-wide">
                  Total Price
                </label>
                <div className="h-10 flex items-center bg-white p-3 rounded-lg border-2 border-purple-200">
                  <span className="text-lg font-bold text-purple-600">
                    {totalPrice.toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handlePurchase}
                disabled={purchasing || quantity === 0}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl"
              >
                {purchasing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now ({totalPrice.toFixed(4)} ETH)
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => onViewDetails(prescription)}
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <FiEye className="h-4 w-4 mr-2" />
                Details
              </Button>
            </div>
          </div>
        ) : medicine ? (
          <div className="text-center py-6">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6">
              <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-fit mx-auto mb-4 shadow-lg">
                <FiAlertCircle className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-bold text-red-700 mb-2">
                Medicine Unavailable
              </p>
              <p className="text-sm text-red-600">
                This medicine is currently out of stock or inactive.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-fit mx-auto mb-4 shadow-lg">
                <FiAlertCircle className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-bold text-yellow-700 mb-2">
                Medicine Not Found
              </p>
              <p className="text-sm text-yellow-600">
                The prescribed medicine is not available in the system.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getPatientId,
    getPatientDetails,
    getPatientPrescriptions,
    getAllMedicines,
    getAllDoctors,
    buyMedicine,
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

        const [patientDetails, patientPrescriptions, allMedicines, allDoctors] =
          await Promise.all([
            getPatientDetails(patientId).catch(() => null),
            getPatientPrescriptions(patientId).catch(() => []),
            getAllMedicines().catch(() => []),
            getAllDoctors().catch(() => []),
          ]);

        if (!patientDetails) {
          router.push("/patient/register");
          return;
        }

        // Process data with safe number conversion
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

        const processedMedicines = (allMedicines || []).map((medicine) => ({
          ...medicine,
          id: safeNumberConversion(medicine.id),
          quantity: safeNumberConversion(medicine.quantity),
          discount: safeNumberConversion(medicine.discount),
        }));

        const processedDoctors = (allDoctors || []).map((doctor) => ({
          ...doctor,
          id: safeNumberConversion(doctor.id),
        }));

        console.log("Patient prescriptions data loaded:", {
          patientDetails,
          prescriptionsCount: processedPrescriptions.length,
          medicinesCount: processedMedicines.length,
          doctorsCount: processedDoctors.length,
        });

        setPatientData(patientDetails);
        setPrescriptions(processedPrescriptions);
        setMedicines(processedMedicines);
        setDoctors(processedDoctors);
      } catch (error) {
        console.error("Error fetching prescriptions data:", error);
        toast.error("Failed to load prescriptions data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address, router]);

  const handlePurchaseMedicine = async (medicineId, quantity, totalPrice) => {
    if (!patientData) {
      toast.error("Patient data not loaded");
      return;
    }

    try {
      const patientId = safeNumberConversion(patientData.id);
      await buyMedicine(patientId, medicineId, quantity, totalPrice);

      // Refresh medicines data to update stock
      const updatedMedicines = await getAllMedicines();
      const processedMedicines = (updatedMedicines || []).map((medicine) => ({
        ...medicine,
        id: safeNumberConversion(medicine.id),
        quantity: safeNumberConversion(medicine.quantity),
        discount: safeNumberConversion(medicine.discount),
      }));
      setMedicines(processedMedicines);
    } catch (error) {
      console.error("Error purchasing medicine:", error);
      throw error;
    }
  };

  const handleViewPrescriptionDetails = (prescription) => {
    // You can implement a modal or detailed view
    console.log("View prescription details:", prescription);
  };

  const handleExportPrescriptions = () => {
    // Implement export functionality
  };

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const medicine = medicines.find((m) => m.id === prescription.medicineId);
    const doctor = doctors.find((d) => d.id === prescription.doctorId);

    const matchesSearch =
      !searchTerm ||
      prescription.id.toString().includes(searchTerm.toLowerCase()) ||
      prescription.medicineId.toString().includes(searchTerm.toLowerCase()) ||
      doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "available" &&
        medicine?.active &&
        safeNumberConversion(medicine?.quantity || 0) > 0) ||
      (statusFilter === "unavailable" &&
        (!medicine?.active ||
          safeNumberConversion(medicine?.quantity || 0) === 0)) ||
      (statusFilter === "not-found" && !medicine);

    const matchesDoctor =
      !doctorFilter || prescription.doctorId.toString() === doctorFilter;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  // Get unique doctors for filter
  const uniqueDoctors = [...new Set(prescriptions.map((p) => p.doctorId))].map(
    (doctorId) => {
      const doctor = doctors.find((d) => d.id === doctorId);
      return {
        id: doctorId,
        name: doctor?.name || `Doctor #${doctorId}`,
      };
    }
  );

  // Calculate statistics
  const stats = {
    total: prescriptions.length,
    available: prescriptions.filter((p) => {
      const medicine = medicines.find((m) => m.id === p.medicineId);
      return (
        medicine?.active && safeNumberConversion(medicine?.quantity || 0) > 0
      );
    }).length,
    unavailable: prescriptions.filter((p) => {
      const medicine = medicines.find((m) => m.id === p.medicineId);
      return (
        !medicine?.active || safeNumberConversion(medicine?.quantity || 0) === 0
      );
    }).length,
    notFound: prescriptions.filter((p) => {
      return !medicines.find((m) => m.id === p.medicineId);
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <FaPrescriptionBottleAlt className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full animate-ping"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading prescriptions...
          </p>
          <p className="text-sm text-gray-500">
            Retrieving your medical prescriptions
          </p>
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
              You need to register as a patient to view your medical
              prescriptions and purchase medicines.
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
                <MdSecurity className="h-4 w-4" />
                <span>Medical Registration Required</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Medical Background Elements */}
      <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
        <FaPrescriptionBottleAlt className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaHeartbeat className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdLocalHospital className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-2xl p-8 text-white shadow-2xl border-2 border-teal-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between relative z-10 mb-6">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
              <FaPrescriptionBottleAlt className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                My Prescriptions
                <MdHealthAndSafety className="h-8 w-8" />
              </h1>
              <p className="text-teal-100 text-lg flex items-center gap-2">
                <MdSecurity className="h-4 w-4" />
                Medicines prescribed by your doctors and available for purchase
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleExportPrescriptions}
              className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/patient/dashboard")}
              className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            title: "Total Prescriptions",
            value: stats.total,
            icon: FaPrescriptionBottleAlt,
            color: "purple",
            description: "All your prescriptions",
          },
          {
            title: "Available",
            value: stats.available,
            icon: FiCheckCircle,
            color: "emerald",
            description: "Ready to purchase",
          },
          {
            title: "Out of Stock",
            value: stats.unavailable,
            icon: FiAlertCircle,
            color: "red",
            description: "Currently unavailable",
          },
          {
            title: "Not Found",
            value: stats.notFound,
            icon: FiAlertCircle,
            color: "yellow",
            description: "Medicine not in system",
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border-2 border-${stat.color}-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="p-6 text-center">
              <div
                className={`p-4 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-2xl w-fit mx-auto mb-4 shadow-lg`}
              >
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <p className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>
                {stat.value}
              </p>
              <p
                className={`text-sm font-bold uppercase tracking-wide text-${stat.color}-700 mb-1`}
              >
                {stat.title}
              </p>
              <p className="text-xs text-gray-600">{stat.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Enhanced Filters */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiSearch className="h-6 w-6 text-indigo-600" />
            Search & Filter Prescriptions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-2 uppercase tracking-wide">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                <Input
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-indigo-200 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-2 uppercase tracking-wide">
                Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-indigo-200 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Out of Stock</option>
                <option value="not-found">Not Found</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-2 uppercase tracking-wide">
                Doctor
              </label>
              <Select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="border-2 border-indigo-200 focus:border-indigo-500"
              >
                <option value="">All Doctors</option>
                {uniqueDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setDoctorFilter("");
                }}
                className="w-full border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                <FiRefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-xl border-2 border-indigo-200">
            <div className="flex items-center justify-between text-sm">
              <p className="font-bold text-indigo-900">
                Showing {filteredPrescriptions.length} of {prescriptions.length}{" "}
                prescriptions
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Prescriptions List */}
      {filteredPrescriptions.length > 0 ? (
        <div className="space-y-6">
          {filteredPrescriptions.map((prescription) => {
            const medicine = medicines.find(
              (m) => m.id === prescription.medicineId
            );
            const doctor = doctors.find((d) => d.id === prescription.doctorId);

            return (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                medicine={medicine}
                doctor={doctor}
                onPurchase={handlePurchaseMedicine}
                onViewDetails={handleViewPrescriptionDetails}
              />
            );
          })}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="p-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-fit mx-auto shadow-2xl">
                <FaPrescriptionBottleAlt className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg">
                <MdHealthAndSafety className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {prescriptions.length === 0
                ? "No prescriptions yet"
                : "No prescriptions found"}
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
              {prescriptions.length === 0
                ? "Your prescribed medicines will appear here after doctor consultations."
                : "Try adjusting your filters to see more results."}
            </p>
            {prescriptions.length === 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/patient/book-appointment")}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-xl"
                >
                  <FaUserMd className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/patient/medicines")}
                  className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <FaPills className="h-4 w-4 mr-2" />
                  Browse Medicines
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientPrescriptions;
