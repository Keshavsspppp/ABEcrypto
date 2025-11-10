import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiDollarSign,
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
  FiShield,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdVerifiedUser,
  MdMedicalServices,
  MdHealthAndSafety,
  MdMonitorHeart,
  MdPersonalInjury,
  MdEmergency,
  MdSchedule,
  MdPayment,
  MdSecurity,
  MdBiotech,
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
import { truncateAddress, safeNumberConversion } from "../../utils/helpers";
import toast from "react-hot-toast";

const DoctorSelectionCard = ({ doctor, onSelect, isSelected }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (doctor.IPFS_URL) {
        try {
          setLoading(true);
          // Handle both full URL and hash
          let hash = doctor.IPFS_URL;
          if (hash.includes("/ipfs/")) {
            hash = hash.split("/ipfs/")[1];
          }
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
  }, [doctor.IPFS_URL]);

  const getSuccessRate = () => {
    const appointmentCount = safeNumberConversion(doctor.appointmentCount);
    const successfulCount = safeNumberConversion(
      doctor.successfulTreatmentCount
    );

    if (!appointmentCount || appointmentCount === 0) return 0;
    return Math.round((successfulCount / appointmentCount) * 100);
  };

  const getSpecializationIcon = (specialization) => {
    const spec = specialization?.toLowerCase() || "";
    const icons = {
      cardiology: FaHeartbeat,
      neurology: FaBrain,
      orthopedics: FaBone,
      pediatrics: FaHospitalUser,
      surgery: FaAmbulance,
      radiology: FaXRay,
      general: FaStethoscope,
      ophthalmology: FaEye,
      dentistry: FaTooth,
      pulmonology: FaLungs,
      psychiatry: FaBrain,
    };
    return icons[spec] || FaUserMd;
  };

  const SpecializationIcon = getSpecializationIcon(doctorData?.specialization);

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Doctor card clicked:", safeNumberConversion(doctor.id));
    onSelect(doctor);
  };

  return (
    <div
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
        isSelected
          ? "ring-4 ring-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-xl"
          : "hover:shadow-lg bg-gradient-to-br from-white to-gray-25"
      } border-2 ${
        isSelected ? "border-teal-300" : "border-gray-200"
      } rounded-2xl overflow-hidden`}
      onClick={handleCardClick}
    >
      <div className="p-8">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div
              className={`w-20 h-20 ${
                isSelected ? "bg-teal-100" : "bg-blue-100"
              } rounded-full flex items-center justify-center border-4 ${
                isSelected ? "border-teal-200" : "border-blue-200"
              } shadow-lg`}
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : doctorData?.profileImage ? (
                <img
                  src={ipfsService.getIPFSUrl(doctorData.profileImage)}
                  alt={`Dr. ${doctorData?.name || "Doctor"}`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <FaUserMd
                  className={`h-10 w-10 ${
                    isSelected ? "text-teal-600" : "text-blue-600"
                  }`}
                />
              )}
            </div>
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <FiCheck className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                Dr.{" "}
                {doctorData?.name ||
                  `Doctor #${safeNumberConversion(doctor.id)}`}
              </h3>
              {isSelected && (
                <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-none px-3 py-1">
                  <MdVerifiedUser className="w-3 h-3 mr-1" />
                  Selected
                </Badge>
              )}
            </div>

            {doctorData?.specialization && (
              <div className="flex items-center space-x-2 mb-3">
                <SpecializationIcon className="h-4 w-4 text-teal-600" />
                <p className="text-gray-600 capitalize font-medium">
                  {doctorData.specialization} Specialist
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none text-xs">
                <MdVerifiedUser className="w-3 h-3 mr-1" />
                Board Certified
              </Badge>
              {doctorData?.experience && (
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none text-xs">
                  <FaStethoscope className="w-3 h-3 mr-1" />
                  {doctorData.experience} years
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center bg-white rounded-xl p-4 border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
                  <FaStethoscope className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {safeNumberConversion(doctor.appointmentCount)}
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Consultations
                </p>
              </div>
              <div className="text-center bg-white rounded-xl p-4 border border-emerald-200">
                <div className="p-2 bg-emerald-100 rounded-lg w-fit mx-auto mb-2">
                  <FaHeartbeat className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  {getSuccessRate()}%
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Success Rate
                </p>
              </div>
              <div className="text-center bg-white rounded-xl p-4 border border-purple-200">
                <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
                  <MdPayment className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {doctorData?.consultationFee
                    ? `$${doctorData.consultationFee}`
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-600 font-medium">Fee</p>
              </div>
            </div>

            {doctorData?.availableHours && (
              <div className="flex items-center p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                <MdSchedule className="h-4 w-4 mr-2 text-teal-600" />
                <span className="text-sm font-medium text-teal-800">
                  {doctorData.availableHours}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientBookAppointment = () => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [appointmentFee, setAppointmentFee] = useState("0.0025");

  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    timeFrom: "",
    timeTo: "",
    condition: "",
    message: "",
    urgency: "normal",
  });

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getAllApprovedDoctors,
    getPatientId,
    getPatientDetails,
    bookAppointment,
    getUserType,
    getContractInfo,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchData = async () => {
      // Allow development testing without strict validation
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode - skipping strict validation");
      } else {
        if (!isConnected || !address) {
          router.push("/patient/register");
          return;
        }
      }

      try {
        setLoading(true);

        // Get contract info first
        const contractInfo = await getContractInfo();
        console.log("Contract info:", contractInfo);
        setAppointmentFee(contractInfo?.appointmentFee || "0.0025");

        // Get approved doctors
        const approvedDoctors = await getAllApprovedDoctors();
        console.log("Approved doctors:", approvedDoctors);
        setDoctors(approvedDoctors || []);

        // Only validate patient if connected
        if (isConnected && address) {
          try {
            // Check if user is a patient
            const userInfo = await getUserType(address);
            console.log("User info:", userInfo);

            if (userInfo && userInfo.userType === "patient") {
              // Get patient data
              const patientId = await getPatientId(address);
              console.log("Patient ID:", patientId);

              if (patientId) {
                const patientDetails = await getPatientDetails(patientId);
                console.log("Patient details:", patientDetails);

                setPatientData({
                  ...patientDetails,
                  id: patientId,
                });
              } else {
                console.warn("Patient ID not found");
                // For development, create a mock patient
                if (process.env.NODE_ENV === "development") {
                  setPatientData({
                    id: 1,
                    accountAddress: address,
                    IPFS_URL: "",
                    medicalHistory: [],
                    boughtMedicines: [],
                  });
                }
              }
            } else if (process.env.NODE_ENV !== "development") {
              toast.error("Please register as a patient first");
              router.push("/patient/register");
              return;
            }
          } catch (error) {
            console.error("Error fetching patient data:", error);

            // For development, continue with mock data
            if (process.env.NODE_ENV === "development") {
              console.log("Using mock patient data for development");
              setPatientData({
                id: 1,
                accountAddress:
                  address || "0x0000000000000000000000000000000000000000",
                IPFS_URL: "",
                medicalHistory: [],
                boughtMedicines: [],
              });
            } else {
              toast.error("Failed to load patient data");
            }
          }
        } else {
          // For development without wallet connection
          if (process.env.NODE_ENV === "development") {
            setPatientData({
              id: 1,
              accountAddress: "0x0000000000000000000000000000000000000000",
              IPFS_URL: "",
              medicalHistory: [],
              boughtMedicines: [],
            });
          }
        }

        // Check if doctor is pre-selected from query params
        const { doctorId } = router.query;
        if (doctorId && approvedDoctors) {
          const preSelectedDoctor = approvedDoctors.find(
            (doc) =>
              safeNumberConversion(doc.id) === safeNumberConversion(doctorId)
          );
          if (preSelectedDoctor) {
            console.log(
              "Pre-selecting doctor from query params:",
              safeNumberConversion(preSelectedDoctor.id)
            );
            setSelectedDoctor(preSelectedDoctor);
            setStep(2);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load appointment booking data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address, router.query]);

  const handleDoctorSelect = (doctor) => {
    console.log("handleDoctorSelect called with:", doctor);
    console.log("Doctor ID:", safeNumberConversion(doctor.id));

    setSelectedDoctor(doctor);
    console.log("Selected doctor state set");

    // Add a small delay to ensure state is updated, then show feedback
    setTimeout(() => {
      toast.success(
        `Dr. ${doctor?.name || safeNumberConversion(doctor.id)} selected!`
      );
    }, 100);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    console.log("handleNextStep called, current step:", step);
    console.log(
      "Selected doctor:",
      selectedDoctor ? safeNumberConversion(selectedDoctor.id) : "None"
    );

    if (step === 1 && selectedDoctor) {
      console.log("Moving from step 1 to step 2");
      setStep(2);
      toast.success("Proceeding to appointment details");
    } else if (step === 2) {
      console.log("Moving from step 2 to step 3");
      setStep(3);
    } else {
      console.log("Cannot proceed - missing requirements");
      if (!selectedDoctor) {
        toast.error("Please select a doctor first");
      }
    }
  };

  const validateAppointmentForm = () => {
    const { date, timeFrom, timeTo, condition } = appointmentForm;

    if (!date || !timeFrom || !timeTo || !condition) {
      toast.error("Please fill in all required fields");
      return false;
    }

    // Validate time range
    if (timeFrom >= timeTo) {
      toast.error("End time must be after start time");
      return false;
    }

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Appointment date cannot be in the past");
      return false;
    }

    return true;
  };

  const handleBookAppointment = async () => {
    console.log("Booking appointment with data:", {
      selectedDoctor: selectedDoctor
        ? safeNumberConversion(selectedDoctor.id)
        : null,
      patientData: patientData ? safeNumberConversion(patientData.id) : null,
      appointmentForm,
      appointmentFee,
      isConnected,
      address,
    });

    if (!selectedDoctor || !patientData) {
      toast.error("Missing required information");
      return;
    }

    if (!validateAppointmentForm()) {
      return;
    }

    if (!isConnected && process.env.NODE_ENV !== "development") {
      toast.error("Please connect your wallet to book appointment");
      return;
    }

    try {
      setBookingLoading(true);

      const { date, timeFrom, timeTo, condition, message } = appointmentForm;

      // Format appointment date as expected by contract
      const appointmentDate = `${date} ${timeFrom}-${timeTo}`;

      // Get doctor name from IPFS data or use default
      let doctorName = `Doctor #${safeNumberConversion(selectedDoctor.id)}`;
      if (selectedDoctor.IPFS_URL) {
        try {
          let hash = selectedDoctor.IPFS_URL;
          if (hash.includes("/ipfs/")) {
            hash = hash.split("/ipfs/")[1];
          }
          const doctorIPFSData = await ipfsService.fetchFromIPFS(hash);
          if (doctorIPFSData?.name) {
            doctorName = doctorIPFSData.name;
          }
        } catch (error) {
          console.warn("Could not fetch doctor name from IPFS:", error);
        }
      }

      // Ensure all values are properly typed and converted
      const bookingParams = {
        patientId: safeNumberConversion(patientData.id),
        doctorId: safeNumberConversion(selectedDoctor.id),
        from: timeFrom,
        to: timeTo,
        appointmentDate,
        condition,
        message: message || "No additional message",
        doctorAddress: selectedDoctor.accountAddress,
        doctorName,
        appointmentFee: parseFloat(appointmentFee),
      };

      console.log("Calling bookAppointment with params:", bookingParams);

      // Validate parameters before calling contract
      if (!bookingParams.patientId || !bookingParams.doctorId) {
        throw new Error("Invalid patient or doctor ID");
      }

      if (!bookingParams.doctorAddress) {
        throw new Error("Doctor address is required");
      }

      // For development mode, simulate success
      if (process.env.NODE_ENV === "development" && !isConnected) {
        console.log("Development mode: Simulating appointment booking");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate transaction time
        toast.success("Appointment booked successfully! (Development mode)");

        setTimeout(() => {
          router.push("/patient/dashboard");
        }, 1000);
        return;
      }

      // Call the contract function with proper parameters
      const result = await bookAppointment(
        bookingParams.patientId,
        bookingParams.doctorId,
        bookingParams.from,
        bookingParams.to,
        bookingParams.appointmentDate,
        bookingParams.condition,
        bookingParams.message,
        bookingParams.doctorAddress,
        bookingParams.doctorName,
        bookingParams.appointmentFee
      );

      console.log("Booking result:", result);

      toast.success("Appointment booked successfully!");

      // Wait a bit for the transaction to be processed
      setTimeout(() => {
        router.push("/patient/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error booking appointment:", error);

      // More detailed error handling
      if (error?.message?.includes("insufficient funds")) {
        toast.error("Insufficient ETH balance to pay for appointment");
      } else if (
        error?.message?.includes("user rejected") ||
        error?.message?.includes("User rejected")
      ) {
        toast.error("Transaction was rejected by user");
      } else if (error?.message?.includes("Patient does not exist")) {
        toast.error("Patient account not found");
      } else if (error?.message?.includes("Doctor does not exist")) {
        toast.error("Selected doctor not found");
      } else if (error?.message?.includes("Doctor is not approved")) {
        toast.error("Selected doctor is not approved");
      } else if (error?.message?.includes("Incorrect appointment fee")) {
        toast.error(
          `Incorrect appointment fee. Required: ${appointmentFee} ETH`
        );
      } else if (
        error?.message?.includes("Only the patient can book their appointment")
      ) {
        toast.error("Only the patient can book their own appointment");
      } else if (error?.message?.includes("Invalid patient or doctor ID")) {
        toast.error("Invalid patient or doctor information");
      } else if (error?.message?.includes("Doctor address is required")) {
        toast.error("Doctor information is incomplete");
      } else {
        toast.error(
          `Failed to book appointment: ${
            error?.shortMessage || error?.message || "Unknown error"
          }`
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <FaStethoscope className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full animate-ping"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading appointment booking...
          </p>
          <p className="text-sm text-gray-500">Connecting to medical network</p>
        </div>
      </div>
    );
  }

  // Show registration prompt only in production mode
  if (!patientData && process.env.NODE_ENV !== "development") {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-fit mx-auto shadow-lg">
                <FaHospitalUser className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <MdEmergency className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <MdHealthAndSafety className="h-5 w-5 text-blue-600" />
              Patient Registration Required
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You need to register as a patient on our secure healthcare
              platform to book medical appointments with verified doctors.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/patient/register")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 w-full"
              >
                <FaHospitalUser className="mr-2 h-4 w-4" />
                Register as Patient
              </Button>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
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
    <div className="max-w-5xl mx-auto py-8 relative">
      {/* Medical Background Elements */}
      <div className="absolute  opacity-5 overflow-hidden">
        <FaStethoscope className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaHeartbeat className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdLocalHospital className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Enhanced Header */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center space-x-6 mb-6">
          <Button
            variant="outline"
            size="small"
            onClick={() =>
              step > 1 ? setStep(step - 1) : router.push("/patient/dashboard")
            }
            className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            {step > 1 ? "Previous Step" : "Dashboard"}
          </Button>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
              <MdSchedule className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                Book Medical Appointment
                <MdMedicalServices className="h-8 w-8 text-teal-600" />
              </h1>
              <p className="text-xl text-gray-600">
                Schedule a consultation with verified healthcare professionals
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Step Indicator */}
        <div className="flex items-center justify-center space-x-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-200">
          {[
            { number: 1, label: "Select Doctor", icon: FaUserMd },
            { number: 2, label: "Appointment Details", icon: MdSchedule },
            { number: 3, label: "Confirmation", icon: MdVerifiedUser },
          ].map((stepInfo, index) => (
            <div key={stepInfo.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                    step >= stepInfo.number
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white transform scale-110"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > stepInfo.number ? (
                    <FiCheck className="h-6 w-6" />
                  ) : (
                    <stepInfo.icon className="h-6 w-6" />
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    step >= stepInfo.number ? "text-teal-700" : "text-gray-500"
                  }`}
                >
                  {stepInfo.label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                    step > stepInfo.number
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Development Mode Warning */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <FiInfo className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Development Mode Active
              </h3>
              <p className="text-yellow-800 leading-relaxed">
                Patient validation is relaxed for development testing. Connect
                your wallet for full blockchain functionality.
                {!isConnected && " (Wallet not connected - using mock data)"}
              </p>
              <div className="mt-3 flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-yellow-700">
                  <MdBiotech className="h-4 w-4" />
                  <span className="font-medium">Mock Data Active</span>
                </div>
                <div className="flex items-center space-x-1 text-orange-700">
                  <MdSecurity className="h-4 w-4" />
                  <span className="font-medium">Test Environment</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Debug Info - Development only */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mb-6 bg-gray-100 border border-gray-300">
          <div className="text-sm space-y-2">
            <strong className="text-gray-800">Debug Information:</strong>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">Current Step:</span> {step}
              </div>
              <div>
                <span className="font-medium">Selected Doctor:</span>{" "}
                {selectedDoctor
                  ? safeNumberConversion(selectedDoctor.id)
                  : "None"}
              </div>
              <div>
                <span className="font-medium">Available Doctors:</span>{" "}
                {doctors.length}
              </div>
              <div>
                <span className="font-medium">Patient ID:</span>{" "}
                {patientData ? safeNumberConversion(patientData.id) : "None"}
              </div>
              <div>
                <span className="font-medium">Appointment Fee:</span>{" "}
                {appointmentFee} ETH
              </div>
              <div>
                <span className="font-medium">Wallet Status:</span>{" "}
                {isConnected ? "Connected" : "Not Connected"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Connection Warning */}
      {!isConnected && process.env.NODE_ENV !== "development" && (
        <Card className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
              <MdEmergency className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Wallet Connection Required
              </h3>
              <p className="text-red-800 leading-relaxed">
                Please connect your Web3 wallet to book medical appointments on
                our secure blockchain healthcare platform.
              </p>
              <div className="mt-3 flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-red-700">
                  <FiShield className="h-4 w-4" />
                  <span className="font-medium">Secure Payment Required</span>
                </div>
                <div className="flex items-center space-x-1 text-pink-700">
                  <MdHealthAndSafety className="h-4 w-4" />
                  <span className="font-medium">Patient Verification</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Appointment Fee Info */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
            <MdPayment className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
              Appointment Fee Structure
              <MdAccountBalance className="h-5 w-5" />
            </h3>
            <p className="text-blue-800 leading-relaxed mb-3">
              Each medical consultation costs{" "}
              <span className="font-bold text-indigo-700">
                {appointmentFee} ETH
              </span>
              . This fee ensures platform security and compensates healthcare
              professionals.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700">Platform Fee: 10%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-indigo-700">Doctor Fee: 90%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Step 1: Enhanced Doctor Selection */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              Choose Your Healthcare Provider
              <FaUserMd className="h-8 w-8 text-teal-600" />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Select from our network of verified, board-certified medical
              professionals for your consultation
            </p>
          </div>

          {doctors.length > 0 ? (
            <div className="space-y-6">
              {doctors.map((doctor) => (
                <DoctorSelectionCard
                  key={safeNumberConversion(doctor.id)}
                  doctor={doctor}
                  onSelect={handleDoctorSelect}
                  isSelected={
                    selectedDoctor &&
                    safeNumberConversion(selectedDoctor.id) ===
                      safeNumberConversion(doctor.id)
                  }
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-16 bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200">
              <div className="p-6 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full w-fit mx-auto mb-6">
                <FaUserMd className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No Doctors Available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                There are currently no verified doctors available for
                appointments. Please check back later or contact support.
              </p>
            </Card>
          )}

          {selectedDoctor && (
            <div className="flex justify-center">
              <Button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-12 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <FaStethoscope className="mr-3 h-6 w-6" />
                Continue with Dr.{" "}
                {selectedDoctor?.name ||
                  safeNumberConversion(selectedDoctor.id)}
                <FiArrowLeft className="h-5 w-5 ml-3 rotate-180" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Enhanced Appointment Details */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              Appointment Details
              <MdSchedule className="h-8 w-8 text-teal-600" />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Provide your consultation information and preferred schedule
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Selected Doctor Info */}
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaUserMd className="h-6 w-6 text-teal-600" />
                Selected Healthcare Provider
              </h3>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center border-4 border-teal-200 shadow-lg">
                  <FaUserMd className="h-10 w-10 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Dr. Doctor #{safeNumberConversion(selectedDoctor.id)}
                  </h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none text-xs">
                      <MdVerifiedUser className="w-3 h-3 mr-1" />
                      Board Certified
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-3 bg-white rounded-xl p-4 border border-teal-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaStethoscope className="h-4 w-4 text-teal-600" />
                    <span className="text-gray-700 font-medium">
                      Consultations
                    </span>
                  </div>
                  <span className="font-bold text-teal-600">
                    {safeNumberConversion(selectedDoctor.appointmentCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MdFavorite className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-700 font-medium">
                      Success Rate
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600">
                    {safeNumberConversion(
                      selectedDoctor.successfulTreatmentCount
                    )}{" "}
                    treatments
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MdSecurity className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700 font-medium">Address</span>
                  </div>
                  <span className="font-mono text-sm text-gray-600">
                    {truncateAddress(selectedDoctor.accountAddress)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Enhanced Appointment Form */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MdSchedule className="h-6 w-6 text-blue-600" />
                Schedule Your Consultation
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <FiCalendar className="h-4 w-4 text-blue-600" />
                    Appointment Date *
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={appointmentForm.date}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                      <FiClock className="h-4 w-4 text-blue-600" />
                      Start Time *
                    </label>
                    <Input
                      type="time"
                      name="timeFrom"
                      value={appointmentForm.timeFrom}
                      onChange={handleFormChange}
                      required
                      className="focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                      <FiClock className="h-4 w-4 text-blue-600" />
                      End Time *
                    </label>
                    <Input
                      type="time"
                      name="timeTo"
                      value={appointmentForm.timeTo}
                      onChange={handleFormChange}
                      required
                      className="focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <MdMedicalServices className="h-4 w-4 text-blue-600" />
                    Medical Condition/Reason *
                  </label>
                  <Select
                    name="condition"
                    value={appointmentForm.condition}
                    onChange={handleFormChange}
                    required
                    className="focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select your consultation reason</option>
                    <option value="General Consultation">
                      General Consultation
                    </option>
                    <option value="Follow-up">Follow-up Appointment</option>
                    <option value="Fever">Fever & Temperature Issues</option>
                    <option value="Cold/Flu">Cold/Flu Symptoms</option>
                    <option value="Headache">Headache & Migraines</option>
                    <option value="Stomach Issues">Digestive Problems</option>
                    <option value="Skin Problems">Skin Conditions</option>
                    <option value="Joint Pain">Joint & Muscle Pain</option>
                    <option value="Mental Health">Mental Health Support</option>
                    <option value="Chronic Disease Management">
                      Chronic Disease Management
                    </option>
                    <option value="Preventive Care">
                      Preventive Health Screening
                    </option>
                    <option value="Other">Other Medical Concern</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <MdEmergency className="h-4 w-4 text-orange-600" />
                    Urgency Level
                  </label>
                  <Select
                    name="urgency"
                    value={appointmentForm.urgency}
                    onChange={handleFormChange}
                    className="focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">Normal - Routine Care</option>
                    <option value="urgent">
                      Urgent - Needs Attention Soon
                    </option>
                    <option value="emergency">
                      Emergency - Immediate Care
                    </option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <FaNotesMedical className="h-4 w-4 text-blue-600" />
                    Medical History & Symptoms
                  </label>
                  <textarea
                    name="message"
                    value={appointmentForm.message}
                    onChange={handleFormChange}
                    placeholder="Please describe your symptoms, medical history, or any additional information that would help the doctor prepare for your consultation..."
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    rows="4"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleNextStep}
              disabled={
                !appointmentForm.date ||
                !appointmentForm.timeFrom ||
                !appointmentForm.timeTo ||
                !appointmentForm.condition
              }
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-12 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdVerifiedUser className="mr-3 h-6 w-6" />
              Review Appointment Details
              <FiArrowLeft className="h-5 w-5 ml-3 rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Enhanced Confirmation */}
      {step === 3 && selectedDoctor && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              Confirm Your Appointment
              <MdVerifiedUser className="h-8 w-8 text-teal-600" />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Please review all details before confirming your medical
              consultation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Appointment Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MdSchedule className="h-6 w-6 text-emerald-600" />
                Appointment Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2">
                    <FaUserMd className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-600 font-medium">Doctor:</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    Dr. Doctor #{safeNumberConversion(selectedDoctor.id)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-600 font-medium">Date:</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {appointmentForm.date}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2">
                    <FiClock className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-600 font-medium">Time:</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {appointmentForm.timeFrom} - {appointmentForm.timeTo}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2">
                    <MdMedicalServices className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-600 font-medium">
                      Condition:
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {appointmentForm.condition}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2">
                    <MdEmergency className="h-4 w-4 text-orange-600" />
                    <span className="text-gray-600 font-medium">Urgency:</span>
                  </div>
                  <Badge
                    className={
                      appointmentForm.urgency === "emergency"
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-none"
                        : appointmentForm.urgency === "urgent"
                        ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-none"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none"
                    }
                  >
                    {appointmentForm.urgency}
                  </Badge>
                </div>
                {appointmentForm.message && (
                  <div className="p-3 bg-white rounded-lg border border-emerald-200">
                    <div className="flex items-start space-x-2 mb-2">
                      <FaNotesMedical className="h-4 w-4 text-emerald-600 mt-1" />
                      <span className="text-gray-600 font-medium">
                        Medical Details:
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg leading-relaxed">
                      {appointmentForm.message}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Enhanced Payment Info */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MdPayment className="h-6 w-6 text-blue-600" />
                Payment Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
                  <span className="text-gray-600 font-medium">
                    Consultation Fee:
                  </span>
                  <span className="font-bold text-blue-600 text-lg">
                    {appointmentFee} ETH
                  </span>
                </div>
                <div className="bg-white rounded-lg border border-blue-200 p-4">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Fee Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee (10%):</span>
                      <span className="font-medium">
                        {(parseFloat(appointmentFee) * 0.1).toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor Fee (90%):</span>
                      <span className="font-medium">
                        {(parseFloat(appointmentFee) * 0.9).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-blue-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total Amount:</span>
                      <span className="font-bold text-2xl text-blue-600">
                        {appointmentFee} ETH
                      </span>
                    </div>
                  </div>
                </div>

                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <FiInfo className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900 mb-1">
                        Payment Information
                      </p>
                      <p className="text-sm text-yellow-800 leading-relaxed">
                        {process.env.NODE_ENV === "development" && !isConnected
                          ? "In development mode, this will simulate the blockchain payment process for testing purposes."
                          : "Payment will be processed securely via blockchain smart contract. Please ensure you have sufficient ETH in your connected wallet."}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleBookAppointment}
              loading={bookingLoading}
              disabled={bookingLoading}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-16 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 rounded-2xl"
            >
              {bookingLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-3">
                    {process.env.NODE_ENV === "development" && !isConnected
                      ? "Simulating Booking..."
                      : "Processing Payment..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-center">
                  <MdSchedule className="h-6 w-6 mr-3" />
                  {process.env.NODE_ENV === "development" && !isConnected
                    ? `Test Book Appointment (${appointmentFee} ETH)`
                    : `Confirm & Pay (${appointmentFee} ETH)`}
                  <MdVerifiedUser className="h-6 w-6 ml-3" />
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientBookAppointment;
