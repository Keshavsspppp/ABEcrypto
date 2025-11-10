import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiActivity,
  FiUpload,
  FiUser,
  FiFileText,
  FiUserCheck,
  FiInfo,
  FiShield,
  FiAward,
  FiGraduationCap,
  FiHeart,
  FiClock,
  FiGlobe,
  FiTrendingUp,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdVerifiedUser,
  MdMedicalServices,
  MdHealthAndSafety,
  MdMonitorHeart,
  MdLocalPharmacy,
  MdBiotech,
  MdEmergency,
  MdPersonalInjury,
  MdSecurity,
  MdAccountBalance,
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
  FaBrain,
  FaEye,
  FaTooth,
  FaBone,
  FaLungs,
} from "react-icons/fa";
import { Card, Button, Input, Select, FileUpload } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import toast from "react-hot-toast";

const DoctorRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    qualification: "",
    licenseNumber: "",
    phone: "",
    email: "",
    hospitalAffiliation: "",
    consultationFee: "",
    availableHours: "",
    languages: "",
    about: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registrationFee, setRegistrationFee] = useState("0");

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { registerDoctor, getContractInfo, getUserType } =
    useHealthcareContract();

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

        // Fetch contract info
        const contractInfo = await getContractInfo();
        if (contractInfo) {
          setRegistrationFee(contractInfo.registrationDoctorFee);
        }
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

  const handleCertificateChange = (e) => {
    const files = Array.from(e.target.files);
    setCertificateFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (
      !formData.name ||
      !formData.specialization ||
      !formData.qualification ||
      !formData.licenseNumber
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Upload certificates to IPFS
      let certificateHashes = [];
      if (certificateFiles.length > 0) {
        for (const file of certificateFiles) {
          const result = await ipfsService.uploadToIPFS(file, {
            name: `certificate-${formData.name}-${Date.now()}`,
            type: "doctor-certificate",
          });
          certificateHashes.push(result.hash);
        }
      }

      // Upload profile data to IPFS
      const profileData = {
        ...formData,
        certificates: certificateHashes,
        registrationDate: new Date().toISOString(),
        walletAddress: address,
        status: "pending_approval",
      };

      const ipfsResult = await ipfsService.uploadDoctorProfile(
        profileData,
        profileImage
      );

      // Register doctor
      const tx = await registerDoctor(
        ipfsResult.metadataUrl,
        address,
        formData.name,
        "doctor",
        registrationFee
      );

      toast.success(
        "Registration submitted successfully! Please wait for admin approval."
      );
      // router.push("/doctor/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationIcon = (specialization) => {
    const icons = {
      general: FaStethoscope,
      cardiology: FaHeartbeat,
      dermatology: FaUserNurse,
      endocrinology: FaSyringe,
      gastroenterology: FaNotesMedical,
      neurology: FaBrain,
      oncology: FaMicroscope,
      orthopedics: FaBone,
      pediatrics: FaHospitalUser,
      psychiatry: FaBrain,
      radiology: FaXRay,
      surgery: FaAmbulance,
      urology: FaUserMd,
      ophthalmology: FaEye,
      dentistry: FaTooth,
      pulmonology: FaLungs,
    };
    return icons[specialization] || FaStethoscope;
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-fit mx-auto shadow-lg">
                <FaUserMd className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <MdEmergency className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <MdSecurity className="h-5 w-5 text-emerald-600" />
              Wallet Connection Required
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Please connect your Web3 wallet to register as a verified medical
              professional on our blockchain healthcare platform.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-emerald-600">
              <FiShield className="h-4 w-4" />
              <span className="font-medium">
                Secure • Private • Decentralized
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 relative">
      {/* Medical Background Elements */}
      <div className="absolute  opacity-5 overflow-hidden">
        <FaStethoscope className="absolute top-20 right-20 h-32 w-32 text-emerald-600 animate-pulse" />
        <FaHeartbeat className="absolute bottom-20 left-20 h-24 w-24 text-teal-600" />
        <MdLocalHospital className="absolute top-1/2 left-1/4 h-28 w-28 text-cyan-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Enhanced Header */}
      <div className="text-center mb-12 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-2xl">
              <FaUserMd className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-300 rounded-full border-4 border-white">
              <MdVerifiedUser className="h-4 w-4 text-emerald-700 m-1" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-teal-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          Medical Doctor Registration
          <MdMedicalServices className="h-8 w-8 text-emerald-600" />
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Join our verified network of healthcare professionals and
          revolutionize medical care through blockchain technology
        </p>
        <div className="mt-4 flex items-center justify-center space-x-6 text-emerald-600">
          <div className="flex items-center space-x-2">
            <MdHealthAndSafety className="h-5 w-5" />
            <span className="text-sm font-medium">HIPAA Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <MdBiotech className="h-5 w-5" />
            <span className="text-sm font-medium">Blockchain Secured</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiGlobe className="h-5 w-5" />
            <span className="text-sm font-medium">Global Platform</span>
          </div>
        </div>
      </div>

      {/* Enhanced Registration Process */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl w-fit mx-auto shadow-lg">
              <FaNotesMedical className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-700">1</span>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Submit Medical Profile
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Complete your comprehensive medical profile with qualifications,
            certifications, and professional documents
          </p>
        </Card>

        <Card className="text-center p-8 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl w-fit mx-auto shadow-lg">
              <MdVerifiedUser className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">2</span>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Medical Board Review
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Our certified medical board will verify your credentials, licenses,
            and professional qualifications
          </p>
        </Card>

        <Card className="text-center p-8 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl w-fit mx-auto shadow-lg">
              <FaStethoscope className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-cyan-700">3</span>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Start Practicing
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Begin treating patients, managing medical records, and growing your
            practice on our secure platform
          </p>
        </Card>
      </div>

      {/* Enhanced Registration Fee Info */}
      <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
            <MdAccountBalance className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              Professional Registration Fee
              <MdSecurity className="h-5 w-5" />
            </h3>
            <p className="text-indigo-800 leading-relaxed">
              A one-time registration fee of{" "}
              <span className="font-bold text-purple-700">
                {registrationFee} ETH
              </span>{" "}
              is required to join our verified doctor network. This ensures the
              highest quality standards and authenticity of healthcare providers
              on our blockchain platform.
            </p>
            <div className="mt-3 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-indigo-600">
                <FiShield className="h-4 w-4" />
                <span className="font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-1 text-purple-600">
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
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaUserMd className="h-6 w-6 text-emerald-600" />
                Professional Photo
              </h2>
              <div className="text-center">
                <div className="mb-6">
                  {imagePreview ? (
                    <div className="relative w-40 h-40 mx-auto">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-40 h-40 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                        <MdVerifiedUser className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-emerald-200 flex items-center justify-center shadow-lg">
                      <FaUserMd className="h-16 w-16 text-emerald-600" />
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
                  Professional headshot recommended
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaNotesMedical className="h-6 w-6 text-teal-600" />
                Medical Certificates
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Upload your medical degree, license, board certifications, and
                  other relevant professional documents
                </p>
                <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                  <FiUpload className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleCertificateChange}
                    className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {certificateFiles.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 text-green-700">
                      <MdVerifiedUser className="h-5 w-5" />
                      <span className="font-medium">
                        {certificateFiles.length} document(s) ready for upload
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Enhanced Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaHospitalUser className="h-6 w-6 text-blue-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Dr. John Smith"
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@example.com"
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  label="Languages Spoken"
                  name="languages"
                  value={formData.languages}
                  onChange={handleInputChange}
                  placeholder="English, Spanish, French"
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Complete Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Medical Center Dr, Healthcare City, HC 12345"
                    className="focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Professional Information */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MdMedicalServices className="h-6 w-6 text-purple-600" />
                Professional Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Medical Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Your Specialization</option>
                  <option value="general">General Practice</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="gastroenterology">Gastroenterology</option>
                  <option value="neurology">Neurology</option>
                  <option value="oncology">Oncology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="radiology">Radiology</option>
                  <option value="surgery">Surgery</option>
                  <option value="urology">Urology</option>
                  <option value="ophthalmology">Ophthalmology</option>
                  <option value="dentistry">Dentistry</option>
                  <option value="pulmonology">Pulmonology</option>
                  <option value="other">Other Specialization</option>
                </Select>
                <Input
                  label="Years of Experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="10"
                  className="focus:ring-purple-500 focus:border-purple-500"
                />
                <Input
                  label="Medical License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="MD123456789"
                  className="focus:ring-purple-500 focus:border-purple-500"
                />
                <Input
                  label="Consultation Fee (USD)"
                  name="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  placeholder="100"
                  className="focus:ring-purple-500 focus:border-purple-500"
                />
                <Input
                  label="Medical Qualifications"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  required
                  placeholder="MBBS, MD, Fellowship"
                  className="md:col-span-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <Input
                  label="Hospital/Clinic Affiliation"
                  name="hospitalAffiliation"
                  value={formData.hospitalAffiliation}
                  onChange={handleInputChange}
                  placeholder="City General Hospital"
                  className="md:col-span-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <Input
                  label="Available Hours"
                  name="availableHours"
                  value={formData.availableHours}
                  onChange={handleInputChange}
                  placeholder="9:00 AM - 5:00 PM (Mon-Fri)"
                  className="md:col-span-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </Card>

            {/* About Section */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaHeartbeat className="h-6 w-6 text-green-600" />
                Professional Profile
              </h2>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                placeholder="Share your medical philosophy, areas of expertise, approach to patient care, achievements, and what makes you unique as a healthcare professional..."
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                rows="6"
              />
            </Card>
          </div>
        </div>

        {/* Enhanced Terms and Conditions */}
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MdSecurity className="h-6 w-6 text-gray-600" />
              Medical Professional Agreement
            </h3>
            <div className="text-gray-700 space-y-4 leading-relaxed">
              <p className="font-medium">
                By registering as a medical professional on HealthChain, you
                agree to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    Provide accurate and truthful professional information
                  </li>
                  <li>Maintain valid medical licenses and certifications</li>
                  <li>Follow all medical ethics and professional standards</li>
                  <li>
                    Pay the required registration fee of{" "}
                    <span className="font-bold text-purple-700">
                      {registrationFee} ETH
                    </span>
                  </li>
                  <li>Comply with platform policies and HIPAA guidelines</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Provide quality, compassionate care to all patients</li>
                  <li>Keep patient information confidential and secure</li>
                  <li>Update your profile and availability regularly</li>
                  <li>Respond to patient inquiries professionally</li>
                  <li>Maintain professional conduct on the platform</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-6">
                <p className="text-blue-800 font-medium flex items-center gap-2">
                  <MdVerifiedUser className="h-5 w-5" />
                  Your application will be reviewed by our certified medical
                  board. Only verified and qualified doctors will be approved to
                  practice on our platform.
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
            <FiActivity className="mr-2 h-5 w-5" />
            Return to Home
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={
              loading ||
              !formData.name ||
              !formData.specialization ||
              !formData.qualification ||
              !formData.licenseNumber
            }
            className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-xl"
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="small" color="white" />
                <span className="ml-3">Processing Registration...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FaUserMd className="mr-3 h-6 w-6" />
                Register as Medical Doctor
                <div className="ml-3 flex items-center space-x-1 bg-white bg-opacity-20 rounded-lg px-3 py-1">
                  <MdAccountBalance className="h-4 w-4" />
                  <span className="text-sm">{registrationFee} ETH</span>
                </div>
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Enhanced Benefits Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="text-center p-8 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl w-fit mx-auto shadow-lg">
              <MdSecurity className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-300 rounded-full animate-pulse"></div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Blockchain Security
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Your medical data and patient information are protected by
            military-grade blockchain encryption and decentralized storage
            systems.
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <FiShield className="h-4 w-4 text-emerald-500" />
            <MdBiotech className="h-4 w-4 text-green-500" />
            <MdHealthAndSafety className="h-4 w-4 text-emerald-500" />
          </div>
        </Card>

        <Card className="text-center p-8 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl w-fit mx-auto shadow-lg">
              <FiGlobe className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full animate-pulse"></div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Global Patient Network
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Connect with patients worldwide through our decentralized healthcare
            platform and expand your medical practice internationally.
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <FaHospitalUser className="h-4 w-4 text-teal-500" />
            <MdLocalHospital className="h-4 w-4 text-cyan-500" />
            <FiGlobe className="h-4 w-4 text-teal-500" />
          </div>
        </Card>

        <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl w-fit mx-auto shadow-lg">
              <FiTrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-300 rounded-full animate-pulse"></div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            Professional Growth
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Build your medical reputation, grow your practice, and advance your
            career with verified patient reviews and blockchain credentials.
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <FiAward className="h-4 w-4 text-blue-500" />
            <MdVerifiedUser className="h-4 w-4 text-indigo-500" />
            <FiTrendingUp className="h-4 w-4 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Medical Specializations Showcase */}
      <div className="mt-16 bg-gradient-to-r from-gray-50 to-slate-50 rounded-3xl p-8 border-2 border-gray-200">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <MdMedicalServices className="h-7 w-7 text-emerald-600" />
            Supported Medical Specializations
          </h3>
          <p className="text-gray-600">
            Join healthcare professionals across various medical specialties
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { name: "Cardiology", icon: FaHeartbeat, color: "red" },
            { name: "Neurology", icon: FaBrain, color: "purple" },
            { name: "Orthopedics", icon: FaBone, color: "blue" },
            { name: "Pediatrics", icon: FaHospitalUser, color: "green" },
            { name: "Surgery", icon: FaAmbulance, color: "orange" },
            { name: "Radiology", icon: FaXRay, color: "gray" },
            { name: "General", icon: FaStethoscope, color: "emerald" },
            { name: "Oncology", icon: FaMicroscope, color: "pink" },
            { name: "Psychiatry", icon: FaBrain, color: "indigo" },
            { name: "Dermatology", icon: FaUserNurse, color: "teal" },
            { name: "Urology", icon: FaUserMd, color: "cyan" },
            { name: "Ophthalmology", icon: FaEye, color: "yellow" },
            { name: "Dentistry", icon: FaTooth, color: "blue" },
            { name: "Pulmonology", icon: FaLungs, color: "green" },
          ].map((specialty, index) => (
            <div
              key={specialty.name}
              className={`flex flex-col items-center p-4 bg-white rounded-xl border border-${specialty.color}-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:border-${specialty.color}-300`}
            >
              <div
                className={`p-3 bg-gradient-to-r from-${specialty.color}-100 to-${specialty.color}-200 rounded-lg mb-2`}
              >
                <specialty.icon
                  className={`h-6 w-6 text-${specialty.color}-600`}
                />
              </div>
              <span
                className={`text-xs font-medium text-${specialty.color}-700`}
              >
                {specialty.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistration;
