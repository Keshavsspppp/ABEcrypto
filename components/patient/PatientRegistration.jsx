import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiHeart,
  FiUpload,
  FiUser,
  FiFileText,
  FiUserCheck,
  FiInfo,
  FiShield,
  FiGlobe,
  FiClock,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdHealthAndSafety,
  MdMonitorHeart,
  MdMedicalServices,
  MdBiotech,
  MdVerifiedUser,
  MdEmergency,
  MdSecurity,
  MdAccountBalance,
  MdPersonalInjury,
  MdBloodtype,
  MdFavorite,
  MdContactPhone,
  MdLocationOn,
} from "react-icons/md";
import {
  FaStethoscope,
  FaUserMd,
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
  FaBandAid,
  FaVials,
  FaAllergies,
} from "react-icons/fa";
import { Card, Button, Input, Select, FileUpload } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import toast from "react-hot-toast";

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    bloodType: "",
    allergies: "",
    currentMedications: "",
    preferredDoctorAddress: "",
    preferredDoctorName: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationFee, setRegistrationFee] = useState("0");
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    registerPatient,
    getContractInfo,
    getAllApprovedDoctors,
    getUserType,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Check if user is already registered
        if (isConnected && address) {
          const userInfo = await getUserType(address);
          if (userInfo && userInfo.userType) {
            router.push("/");
            return;
          }
        }

        // Fetch contract info and doctors
        const [contractInfo, doctors] = await Promise.all([
          getContractInfo(),
          getAllApprovedDoctors(),
        ]);

        if (contractInfo) {
          setRegistrationFee(contractInfo.registrationPatientFee);
        }

        setAvailableDoctors(doctors || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [isConnected, address]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDoctorSelection = (doctorId) => {
    const doctor = availableDoctors.find(
      (doc) => doc.id.toString() === doctorId
    );
    if (doctor) {
      setSelectedDoctor(doctor);
      setFormData((prev) => ({
        ...prev,
        preferredDoctorAddress: doctor.accountAddress,
        preferredDoctorName: `Doctor #${doctor.id}`,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.name || !formData.age || !formData.gender) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Upload profile data to IPFS
      const profileData = {
        ...formData,
        registrationDate: new Date().toISOString(),
        walletAddress: address,
      };

      const ipfsResult = await ipfsService.uploadPatientProfile(
        profileData,
        profileImage
      );

      // Prepare medical history array
      const medicalHistory = [];
      if (formData.allergies) {
        medicalHistory.push(`Allergies: ${formData.allergies}`);
      }
      if (formData.currentMedications) {
        medicalHistory.push(
          `Current Medications: ${formData.currentMedications}`
        );
      }
      if (formData.bloodType) {
        medicalHistory.push(`Blood Type: ${formData.bloodType}`);
      }

      // If no medical history, add a placeholder
      if (medicalHistory.length === 0) {
        medicalHistory.push("No medical history recorded");
      }

      // Set default doctor if none selected
      let doctorAddress = formData.preferredDoctorAddress;
      let doctorName = formData.preferredDoctorName;

      if (!doctorAddress && availableDoctors.length > 0) {
        doctorAddress = availableDoctors[0].accountAddress;
        doctorName = `Doctor #${availableDoctors[0].id}`;
      }

      // Fallback to user's own address if no doctors available
      if (!doctorAddress) {
        doctorAddress = address;
        doctorName = "General";
      }

      console.log("Registration parameters:", {
        ipfsUrl: ipfsResult.metadataUrl,
        medicalHistory,
        accountAddress: address,
        boughtMedicines: [], // Empty array for new patients
        name: formData.name,
        doctorAddress,
        doctorName,
        userType: "patient",
        registrationFee,
      });

      // Register patient
      const tx = await registerPatient(
        ipfsResult.metadataUrl,
        medicalHistory,
        address,
        [], // Empty bought medicines array for new patients
        formData.name,
        doctorAddress,
        doctorName,
        "patient",
        registrationFee
      );

      console.log("Registration transaction:", tx);
      toast.success("Registration successful! Welcome to HealthChain!");
      // router.push("/patient/dashboard");
    } catch (error) {
      console.error("Registration error:", error);

      // More detailed error messages
      if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds for registration fee");
      } else if (error.message?.includes("user rejected")) {
        toast.error("Transaction was rejected");
      } else if (error.message?.includes("already registered")) {
        toast.error("This address is already registered");
      } else if (error.message?.includes("Incorrect registration fee")) {
        toast.error("Incorrect registration fee amount");
      } else {
        toast.error(`Registration failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getBloodTypeIcon = (bloodType) => {
    return <MdBloodtype className="h-4 w-4" />;
  };

  if (!isConnected) {
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
              <MdSecurity className="h-5 w-5 text-blue-600" />
              Wallet Connection Required
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Please connect your Web3 wallet to register as a patient on our
              secure blockchain healthcare platform.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-blue-600">
              <FiShield className="h-4 w-4" />
              <span className="font-medium">
                Private • Secure • Decentralized
              </span>
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
        <FaHeartbeat className="absolute top-20 right-20 h-32 w-32 text-blue-600 animate-pulse" />
        <FaStethoscope className="absolute bottom-20 left-20 h-24 w-24 text-emerald-600" />
        <MdLocalHospital className="absolute top-1/2 left-1/4 h-28 w-28 text-teal-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Enhanced Header */}
      <div className="text-center mb-12 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl shadow-2xl">
              <FaHospitalUser className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-300 rounded-full border-4 border-white">
              <FaHeartbeat className="h-4 w-4 text-blue-700 m-1 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-indigo-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          Patient Registration
          <MdHealthAndSafety className="h-8 w-8 text-blue-600" />
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Join our secure decentralized healthcare platform and take control of
          your medical journey with blockchain technology
        </p>
        <div className="mt-4 flex items-center justify-center space-x-6 text-blue-600">
          <div className="flex items-center space-x-2">
            <MdHealthAndSafety className="h-5 w-5" />
            <span className="text-sm font-medium">HIPAA Protected</span>
          </div>
          <div className="flex items-center space-x-2">
            <MdBiotech className="h-5 w-5" />
            <span className="text-sm font-medium">Blockchain Secured</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiGlobe className="h-5 w-5" />
            <span className="text-sm font-medium">Global Access</span>
          </div>
        </div>
      </div>

      {/* Enhanced Registration Fee Info */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
            <MdAccountBalance className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
              Patient Registration Fee
              <MdSecurity className="h-5 w-5" />
            </h3>
            <p className="text-blue-800 leading-relaxed">
              A one-time registration fee of{" "}
              <span className="font-bold text-indigo-700">
                {registrationFee} ETH
              </span>{" "}
              is required to join our secure healthcare platform. This ensures
              platform security and access to verified medical professionals.
            </p>
            <div className="mt-3 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-blue-600">
                <FiShield className="h-4 w-4" />
                <span className="font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-1 text-indigo-600">
                <MdBiotech className="h-4 w-4" />
                <span className="font-medium">Blockchain Verified</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Profile Section */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaHospitalUser className="h-6 w-6 text-blue-600" />
              Patient Photo
            </h2>
            <div className="text-center">
              <div className="mb-6">
                {imagePreview ? (
                  <div className="relative w-40 h-40 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center">
                      <MdHealthAndSafety className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-full mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-blue-200 flex items-center justify-center shadow-lg">
                    <FaHospitalUser className="h-16 w-16 text-blue-600" />
                  </div>
                )}
              </div>
              <FileUpload
                accept="image/*"
                onChange={handleImageChange}
                preview={imagePreview}
              />
              <p className="text-sm text-gray-600 mt-3 flex items-center justify-center gap-1">
                <MdHealthAndSafety className="h-4 w-4" />
                Optional patient photo
              </p>
            </div>
          </Card>

          {/* Enhanced Personal Information */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MdPersonalInjury className="h-6 w-6 text-emerald-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Input
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                required
                placeholder="Enter your age"
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="patient@example.com"
                className="md:col-span-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Input
                label="Complete Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Patient St, Health City, HC 12345"
                className="md:col-span-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Input
                label="Emergency Contact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Emergency contact number"
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Select
                label="Blood Type"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleInputChange}
                className="focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+ (A Positive)</option>
                <option value="A-">A- (A Negative)</option>
                <option value="B+">B+ (B Positive)</option>
                <option value="B-">B- (B Negative)</option>
                <option value="AB+">AB+ (AB Positive)</option>
                <option value="AB-">AB- (AB Negative)</option>
                <option value="O+">O+ (O Positive)</option>
                <option value="O-">O- (O Negative)</option>
              </Select>
            </div>
          </Card>
        </div>

        {/* Enhanced Medical Information */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaNotesMedical className="h-6 w-6 text-purple-600" />
            Medical History & Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaAllergies className="h-4 w-4 text-red-500" />
                Known Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="List any known allergies (medications, food, environmental, etc.)&#10;Example: Penicillin, Peanuts, Dust mites, Latex"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                rows="4"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaPrescriptionBottleAlt className="h-4 w-4 text-blue-500" />
                Current Medications
              </label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleInputChange}
                placeholder="List any medications you are currently taking with dosage and frequency&#10;Example: Lisinopril 10mg daily, Metformin 500mg twice daily"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                rows="4"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <MdHealthAndSafety className="h-4 w-4" />
              <span className="font-medium">
                This information helps doctors provide safer, more personalized
                care. All medical data is encrypted and stored securely.
              </span>
            </p>
          </div>
        </Card>

        {/* Enhanced Preferred Doctor Selection */}
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaUserMd className="h-6 w-6 text-teal-600" />
            Preferred Doctor Selection
          </h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-100 to-cyan-100 p-4 rounded-xl border border-teal-200">
              <p className="text-teal-800 flex items-center gap-2">
                <MdVerifiedUser className="h-5 w-5" />
                <span className="font-medium">
                  You can select a preferred doctor for consultations. This is
                  optional and can be changed later from your patient dashboard.
                </span>
              </p>
            </div>
            {availableDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDoctors.slice(0, 6).map((doctor) => (
                  <div
                    key={doctor.id.toString()}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                      selectedDoctor?.id.toString() === doctor.id.toString()
                        ? "border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg"
                        : "border-teal-200 hover:border-teal-300 bg-white hover:shadow-md"
                    }`}
                    onClick={() => handleDoctorSelection(doctor.id.toString())}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-xl ${
                          selectedDoctor?.id.toString() === doctor.id.toString()
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : "bg-gradient-to-r from-teal-100 to-cyan-100"
                        }`}
                      >
                        <FaUserMd
                          className={`h-6 w-6 ${
                            selectedDoctor?.id.toString() ===
                            doctor.id.toString()
                              ? "text-white"
                              : "text-teal-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          Doctor #{doctor.id.toString()}
                          {selectedDoctor?.id.toString() ===
                            doctor.id.toString() && (
                            <MdVerifiedUser className="h-4 w-4 text-teal-600" />
                          )}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <FaStethoscope className="h-3 w-3" />
                            {doctor.appointmentCount?.toString() || 0}{" "}
                            appointments
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <MdFavorite className="h-3 w-3" />
                            {doctor.successfulTreatmentCount?.toString() ||
                              0}{" "}
                            successful treatments
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <FaUserMd className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  No Doctors Available Yet
                </h3>
                <p className="text-gray-500">
                  Verified doctors will appear here once they join the platform
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Enhanced Terms and Conditions */}
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MdSecurity className="h-6 w-6 text-gray-600" />
              Patient Agreement & Privacy Policy
            </h3>
            <div className="text-gray-700 space-y-4 leading-relaxed">
              <p className="font-medium">
                By registering as a patient on HealthChain, you agree to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Provide accurate and truthful medical information</li>
                  <li>Keep your profile information up to date</li>
                  <li>Follow all medical advice from verified doctors</li>
                  <li>
                    Pay the registration fee of{" "}
                    <span className="font-bold text-indigo-700">
                      {registrationFee} ETH
                    </span>
                  </li>
                  <li>Use the platform responsibly and ethically</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Respect healthcare providers and platform policies</li>
                  <li>Maintain confidentiality of medical consultations</li>
                  <li>Report any platform issues or concerns promptly</li>
                  <li>Comply with HIPAA and privacy regulations</li>
                  <li>Only share accurate health information</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-6">
                <p className="text-blue-800 font-medium flex items-center gap-2">
                  <MdHealthAndSafety className="h-5 w-5" />
                  Your medical data will be securely encrypted and stored on
                  IPFS with blockchain protection. Only you and your authorized
                  healthcare providers will have access.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Submit Section */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            disabled={loading}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <FiHeart className="mr-2 h-5 w-5" />
            Return to Home
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={
              loading || !formData.name || !formData.age || !formData.gender
            }
            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-xl"
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="small" color="white" />
                <span className="ml-3">Processing Registration...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FaHospitalUser className="mr-3 h-6 w-6" />
                Register as Patient
                <div className="ml-3 flex items-center space-x-1 bg-white bg-opacity-20 rounded-lg px-3 py-1">
                  <MdAccountBalance className="h-4 w-4" />
                  <span className="text-sm">{registrationFee} ETH</span>
                </div>
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Enhanced Information Cards */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="text-center p-8 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl w-fit mx-auto shadow-lg">
              <FaNotesMedical className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-300 rounded-full animate-pulse"></div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Secure Medical Records
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Your medical records are encrypted and stored securely on IPFS with
            blockchain technology for maximum privacy and data integrity.
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <FiShield className="h-4 w-4 text-emerald-500" />
            <MdBiotech className="h-4 w-4 text-green-500" />
            <MdHealthAndSafety className="h-4 w-4 text-emerald-500" />
          </div>
        </Card>

        <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl w-fit mx-auto shadow-lg">
              <FaUserMd className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-300 rounded-full animate-pulse"></div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Verified Medical Professionals
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Access healthcare from verified and approved medical professionals
            who have been thoroughly vetted by our medical board.
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <FaUserMd className="h-4 w-4 text-blue-500" />
            <MdVerifiedUser className="h-4 w-4 text-indigo-500" />
            <FaStethoscope className="h-4 w-4 text-blue-500" />
          </div>
        </Card>

        <Card className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl w-fit mx-auto shadow-lg">
              <MdMonitorHeart className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-300 rounded-full animate-pulse"></div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Complete Healthcare Journey
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Book appointments, get prescriptions, buy medicines, and manage your
            complete healthcare journey on one secure platform.
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <FaHeartbeat className="h-4 w-4 text-purple-500" />
            <FaPrescriptionBottleAlt className="h-4 w-4 text-pink-500" />
            <MdMonitorHeart className="h-4 w-4 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Healthcare Services Showcase */}
      <div className="mt-16 bg-gradient-to-r from-gray-50 to-slate-50 rounded-3xl p-8 border-2 border-gray-200">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <MdHealthAndSafety className="h-7 w-7 text-blue-600" />
            Your Healthcare Services
          </h3>
          <p className="text-gray-600">
            Comprehensive medical services available on our platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Consultations", icon: FaStethoscope, color: "blue" },
            {
              name: "Prescriptions",
              icon: FaPrescriptionBottleAlt,
              color: "green",
            },
            { name: "Medical Records", icon: FaNotesMedical, color: "purple" },
            { name: "Lab Reports", icon: FaVials, color: "teal" },
            { name: "Emergency Care", icon: FaAmbulance, color: "red" },
            { name: "Health Monitoring", icon: MdMonitorHeart, color: "pink" },
            {
              name: "Medicine Orders",
              icon: FaPrescriptionBottleAlt,
              color: "indigo",
            },
            { name: "Telemedicine", icon: MdMedicalServices, color: "cyan" },
          ].map((service, index) => (
            <div
              key={service.name}
              className={`flex flex-col items-center p-4 bg-white rounded-xl border border-${service.color}-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:border-${service.color}-300`}
            >
              <div
                className={`p-3 bg-gradient-to-r from-${service.color}-100 to-${service.color}-200 rounded-lg mb-2`}
              >
                <service.icon className={`h-6 w-6 text-${service.color}-600`} />
              </div>
              <span className={`text-xs font-medium text-${service.color}-700`}>
                {service.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
            <MdHealthAndSafety className="h-4 w-4" />
            All services are provided by verified medical professionals
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
