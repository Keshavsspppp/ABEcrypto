import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiUser,
  FiEdit3,
  FiSave,
  FiX,
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiActivity,
  FiClock,
  FiDownload,
  FiUpload,
  FiCamera,
  FiShield,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiExternalLink,
  FiAward,
  FiBookOpen,
  FiTrendingUp,
  FiUsers,
  FiCheckCircle,
  FiStar,
  FiInfo,
  FiHeart,
  FiAlertCircle,
  FiSearch,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdVerifiedUser,
  MdMedicalServices,
  MdSchool,
  MdHealthAndSafety,
  MdSecurity,
  MdBiotech,
  MdPersonalInjury,
  MdMonitorHeart,
  MdInventory,
  MdHistory,
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
  FaCertificate,
  FaStar,
} from "react-icons/fa";

import { Card, Button, Input, Select, Badge } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import { truncateAddress } from "../../utils/helpers";
import { formatEther } from "viem";
import toast from "react-hot-toast";

const ProfileImageUpload = ({ currentImage, onImageUpdate, loading }) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);

      // Upload to IPFS
      const ipfsHash = await ipfsService.uploadToIPFS(file);
      onImageUpdate(ipfsHash);

      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = () => {
    if (previewImage) return previewImage;
    if (currentImage) return ipfsService.getIPFSUrl(currentImage);
    return null;
  };

  return (
    <div className="relative">
      <div className="w-40 h-40 mx-auto bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-teal-200 shadow-xl">
        {loading || uploading ? (
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="text-xs text-teal-600 mt-2">Uploading...</p>
          </div>
        ) : getImageUrl() ? (
          <img
            src={getImageUrl()}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <FaUserMd className="h-16 w-16 text-teal-600 mx-auto mb-2" />
            <p className="text-xs text-teal-600">Upload Photo</p>
          </div>
        )}
      </div>

      <label className="absolute bottom-2 right-1/2 transform translate-x-1/2 translate-y-2 cursor-pointer">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-110">
          <FiCamera className="h-5 w-5" />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploading || loading}
        />
      </label>
    </div>
  );
};

const QualificationSection = ({ qualifications, onUpdate, isEditing }) => {
  const [quals, setQuals] = useState(qualifications || []);
  const [newQual, setNewQual] = useState({
    degree: "",
    institution: "",
    year: "",
  });

  const handleAddQualification = () => {
    if (
      !newQual.degree.trim() ||
      !newQual.institution.trim() ||
      !newQual.year.trim()
    ) {
      toast.error("Please fill all qualification fields");
      return;
    }

    const updatedQuals = [...quals, newQual];
    setQuals(updatedQuals);
    onUpdate(updatedQuals);
    setNewQual({ degree: "", institution: "", year: "" });
  };

  const handleRemoveQualification = (index) => {
    const updatedQuals = quals.filter((_, i) => i !== index);
    setQuals(updatedQuals);
    onUpdate(updatedQuals);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <FaCertificate className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Qualifications & Education
                <MdSchool className="h-6 w-6 text-purple-600" />
              </h3>
              <p className="text-gray-600">
                Professional certifications and degrees
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm border-none shadow-md">
            <FaStar className="w-4 h-4 mr-1" />
            {quals.length} Qualifications
          </Badge>
        </div>

        <div className="space-y-4">
          {quals.map((qual, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl border-2 border-purple-100 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                      <MdSchool className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {qual.degree}
                    </span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs border-none shadow-md">
                      <FiCalendar className="w-3 h-3 mr-1" />
                      {qual.year}
                    </Badge>
                  </div>
                  <p className="text-gray-600 font-medium ml-11">
                    {qual.institution}
                  </p>
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleRemoveQualification(index)}
                    className="border-2 border-red-300 text-red-700 hover:bg-red-50 shadow-md"
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-2 border-dashed border-purple-300 rounded-2xl">
              <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <FiBookOpen className="h-5 w-5" />
                Add New Qualification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="text"
                  placeholder="Degree/Certification"
                  value={newQual.degree}
                  onChange={(e) =>
                    setNewQual({ ...newQual, degree: e.target.value })
                  }
                  className="border-2 border-purple-200 focus:border-purple-400 rounded-xl shadow-md"
                />
                <Input
                  type="text"
                  placeholder="Institution"
                  value={newQual.institution}
                  onChange={(e) =>
                    setNewQual({ ...newQual, institution: e.target.value })
                  }
                  className="border-2 border-purple-200 focus:border-purple-400 rounded-xl shadow-md"
                />
                <div className="flex space-x-3">
                  <Input
                    type="number"
                    placeholder="Year"
                    value={newQual.year}
                    onChange={(e) =>
                      setNewQual({ ...newQual, year: e.target.value })
                    }
                    className="flex-1 border-2 border-purple-200 focus:border-purple-400 rounded-xl shadow-md"
                  />
                  <Button
                    size="small"
                    onClick={handleAddQualification}
                    disabled={
                      !newQual.degree.trim() ||
                      !newQual.institution.trim() ||
                      !newQual.year.trim()
                    }
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                  >
                    <FiCheckCircle className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {quals.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border-2 border-gray-200">
              <div className="p-4 bg-gradient-to-r from-gray-400 to-purple-400 rounded-full w-fit mx-auto mb-4 shadow-lg">
                <MdSchool className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No Qualifications Added
              </h3>
              {isEditing ? (
                <p className="text-gray-600">
                  Add your first qualification above to showcase your
                  credentials
                </p>
              ) : (
                <p className="text-gray-600">
                  Professional qualifications will appear here once added
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const AppointmentStatsSection = ({ appointments, doctorData }) => {
  const totalAppointments = Number(doctorData.appointmentCount) || 0;
  const successfulTreatments = Number(doctorData.successfulTreatmentCount) || 0;
  const successRate =
    totalAppointments > 0
      ? Math.round((successfulTreatments / totalAppointments) * 100)
      : 0;

  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center p-8">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
              <FiUsers className="h-10 w-10 text-white" />
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {totalAppointments}
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Total Consultations
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center p-8">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
              <FiTrendingUp className="h-10 w-10 text-white" />
            </div>
            <p className="text-3xl font-bold text-emerald-600 mb-2">
              {successfulTreatments}
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Successful Treatments
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center p-8">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
              <FiAward className="h-10 w-10 text-white" />
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2">
              {successRate}%
            </p>
            <p className="text-sm text-gray-600 font-medium">Success Rate</p>
          </div>
        </Card>
      </div>

      {/* Enhanced Recent Appointments */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
                <FiCalendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Recent Appointments
                  <MdHistory className="h-6 w-6 text-teal-600" />
                </h3>
                <p className="text-gray-600">Latest patient consultations</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm border-none shadow-md">
              <FiActivity className="w-4 h-4 mr-1" />
              {appointments.length} Total
            </Badge>
          </div>

          <div className="space-y-4">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-teal-50 p-6 rounded-2xl border-2 border-teal-100 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl shadow-md">
                        <FaHospitalUser className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            Patient #{appointment.patientId}
                          </span>
                          <Badge
                            className={`text-xs border-none shadow-md ${
                              appointment.status === "completed"
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                                : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                            }`}
                          >
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                            {appointment.status || "pending"}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2 flex items-center gap-2">
                          <MdMedicalServices className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Condition:</span>{" "}
                          {appointment.condition}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FiClock className="h-3 w-3" />
                          {appointment.appointmentDate} • {appointment.from} -{" "}
                          {appointment.to}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl border-2 border-gray-200">
                <div className="p-4 bg-gradient-to-r from-gray-400 to-teal-400 rounded-full w-fit mx-auto mb-4 shadow-lg">
                  <FiCalendar className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No Appointments Yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Once patients book appointments with you, they will appear
                  here. Make sure your profile is complete to attract more
                  patients.
                </p>
              </div>
            )}
          </div>

          {appointments.length > 5 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                size="small"
                className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50 shadow-md"
              >
                <FiEye className="h-4 w-4 mr-2" />
                View All Appointments
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const DoctorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    consultationFee: "",
    qualifications: [],
    address: "",
    clinicName: "",
    clinicAddress: "",
    availableHours: "",
    bio: "",
    languages: "",
    profileImage: "",
  });

  const { address, isConnected } = useAccount();
  const router = useRouter();

  const { getDoctorId, getDoctorDetails, getDoctorAppointments, getUserType } =
    useHealthcareContract();

  useEffect(() => {
    const fetchDoctorProfile = async () => {
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

        const [doctorDetails, doctorAppointments] = await Promise.all([
          getDoctorDetails(doctorId),
          getDoctorAppointments(doctorId),
        ]);

        setDoctorData(doctorDetails);
        setAppointments(doctorAppointments || []);

        // Fetch IPFS profile data
        if (doctorDetails.IPFS_URL) {
          try {
            const hash = doctorDetails.IPFS_URL.replace(
              "https://gateway.pinata.cloud/ipfs/",
              ""
            );
            const ipfsData = await ipfsService.fetchFromIPFS(hash);
            setProfileData(ipfsData);

            // Populate form with IPFS data
            setFormData({
              name: ipfsData.name || doctorDetails.name || "",
              email: ipfsData.email || "",
              phone: ipfsData.phone || "",
              specialization: ipfsData.specialization || "",
              experience: ipfsData.experience || "",
              consultationFee: ipfsData.consultationFee || "",
              qualifications: ipfsData.qualifications || [],
              address: ipfsData.address || "",
              clinicName: ipfsData.clinicName || "",
              clinicAddress: ipfsData.clinicAddress || "",
              availableHours: ipfsData.availableHours || "",
              bio: ipfsData.bio || "",
              languages: ipfsData.languages || "",
              profileImage: ipfsData.profileImage || "",
            });
          } catch (error) {
            console.error("Error fetching IPFS data:", error);
          }
        } else {
          // Use blockchain data
          setFormData((prev) => ({
            ...prev,
            name: doctorDetails.name || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [isConnected, address]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQualificationsUpdate = (newQualifications) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: newQualifications,
    }));
  };

  const handleImageUpdate = (ipfsHash) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: ipfsHash,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Upload updated profile data to IPFS
      const profileDataToUpload = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      const ipfsHash = await ipfsService.uploadToIPFS(profileDataToUpload);

      // In a real implementation, you would update the doctor's IPFS_URL on the blockchain
      // For now, we'll simulate the save

      setProfileData(profileDataToUpload);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getApprovalStatus = () => {
    return doctorData?.status === "approved" ? "approved" : "pending";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="p-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <FaUserMd className="h-16 w-16 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-cyan-300 rounded-full animate-ping animation-delay-1000"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-6 text-gray-700 font-bold text-lg">
            Loading Doctor Profile...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Accessing professional information
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
              You need to register as a healthcare professional to access your
              doctor profile and manage your professional information.
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
        <FaUserMd className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaStethoscope className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdMedicalServices className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Enhanced Header */}
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
                <FaUserMd className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  Doctor Profile
                  <MdHealthAndSafety className="h-8 w-8" />
                </h1>
                <p className="text-teal-100 text-lg flex items-center gap-2">
                  <MdSecurity className="h-4 w-4" />
                  Manage your professional information and credentials
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm shadow-lg"
                >
                  <FiX className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  loading={saving}
                  disabled={saving}
                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm shadow-lg"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 backdrop-blur-sm shadow-lg"
              >
                <FiEdit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-xl">
            <div className="text-center p-8">
              <ProfileImageUpload
                currentImage={formData.profileImage}
                onImageUpdate={handleImageUpdate}
                loading={saving}
              />

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Dr. {formData.name || `Doctor #${doctorData.id}`}
                </h2>
                <p className="text-sm text-gray-600 mb-4 flex items-center justify-center gap-2">
                  <MdSecurity className="h-4 w-4" />
                  Doctor ID: #{doctorData.id}
                </p>

                <div className="flex items-center justify-center mb-4">
                  <Badge
                    className={`text-sm border-none shadow-lg ${
                      getApprovalStatus() === "approved"
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                        : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                    }`}
                  >
                    <MdVerifiedUser className="w-4 h-4 mr-2" />
                    {getApprovalStatus() === "approved"
                      ? "Verified Doctor"
                      : "Pending Approval"}
                  </Badge>
                </div>

                {formData.specialization && (
                  <div className="bg-white rounded-xl p-4 border-2 border-teal-200 shadow-md mb-4">
                    <p className="text-lg font-bold text-teal-600 flex items-center justify-center gap-2">
                      <MdMedicalServices className="h-5 w-5" />
                      {formData.specialization}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Medical Specialization
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Professional Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-teal-200">
                <div className="text-center p-4 bg-white rounded-xl border-2 border-blue-200 shadow-md">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl w-fit mx-auto mb-2">
                    <FiUsers className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {Number(doctorData.appointmentCount) || 0}
                  </p>
                  <p className="text-xs text-gray-500">Consultations</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border-2 border-green-200 shadow-md">
                  <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl w-fit mx-auto mb-2">
                    <FiClock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-xl font-bold text-emerald-600">
                    {formData.experience || "0"}
                  </p>
                  <p className="text-xs text-gray-500">Years Experience</p>
                </div>
              </div>

              {/* Professional Info */}
              {(formData.consultationFee || formData.availableHours) && (
                <div className="mt-6 pt-6 border-t-2 border-teal-200 space-y-3">
                  {formData.consultationFee && (
                    <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MdInventory className="h-4 w-4" />
                          <span>Consultation Fee:</span>
                        </div>
                        <span className="font-bold text-purple-600">
                          ${formData.consultationFee}
                        </span>
                      </div>
                    </div>
                  )}
                  {formData.availableHours && (
                    <div className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-md">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiClock className="h-4 w-4" />
                          <span>Available Hours:</span>
                        </div>
                        <span className="font-bold text-orange-600">
                          {formData.availableHours}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Blockchain Info */}
              <div className="mt-6 pt-6 border-t-2 border-teal-200">
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-md">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiShield className="h-4 w-4" />
                      <span>Wallet Address:</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-mono text-gray-900 text-xs">
                      {truncateAddress(address)}
                    </span>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => copyToClipboard(address)}
                      className="border-2 border-gray-300 hover:bg-gray-50 shadow-sm"
                    >
                      <FiCopy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiActivity className="h-6 w-6 text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-blue-300 text-blue-700 hover:bg-blue-50 shadow-md transform hover:scale-105 transition-all duration-200"
                  onClick={() => router.push("/doctor/prescribe")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaPrescriptionBottleAlt className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>Prescribe Medicine</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 shadow-md transform hover:scale-105 transition-all duration-200"
                  onClick={() => router.push("/doctor/records")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FaNotesMedical className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span>Medical Records</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-purple-300 text-purple-700 hover:bg-purple-50 shadow-md transform hover:scale-105 transition-all duration-200"
                  onClick={() => router.push("/chat")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiMail className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Message Patients</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Profile Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced Professional Information */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                    <MdMedicalServices className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Professional Information
                    </h3>
                    <p className="text-gray-600">
                      Your medical credentials and contact details
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                  className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 shadow-md"
                >
                  {showPrivateInfo ? (
                    <>
                      <FiEyeOff className="h-4 w-4 mr-2" />
                      Hide Private
                    </>
                  ) : (
                    <>
                      <FiEye className="h-4 w-4 mr-2" />
                      Show Private
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiUser className="h-4 w-4" />
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <MdMedicalServices className="h-4 w-4" />
                    Specialization *
                  </label>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  >
                    <option value="">Select specialization</option>
                    <option value="general-practice">General Practice</option>
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
                    <option value="other">Other</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiClock className="h-4 w-4" />
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Years of experience"
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <MdInventory className="h-4 w-4" />
                    Consultation Fee ($)
                  </label>
                  <Input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Consultation fee"
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiMail className="h-4 w-4" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiPhone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={showPrivateInfo ? formData.phone : "***-***-****"}
                    onChange={handleInputChange}
                    disabled={!isEditing || !showPrivateInfo}
                    placeholder="Enter your phone number"
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiClock className="h-4 w-4" />
                    Available Hours
                  </label>
                  <Input
                    type="text"
                    name="availableHours"
                    value={formData.availableHours}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiActivity className="h-4 w-4" />
                    Languages Spoken
                  </label>
                  <Input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., English, Spanish, French"
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-xl shadow-md"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiBookOpen className="h-4 w-4" />
                    Professional Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Brief description of your medical background and expertise..."
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 shadow-md"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Clinic Information */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                  <MdLocalHospital className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Clinic Information
                  </h3>
                  <p className="text-gray-600">
                    Your practice location and details
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <MdLocalHospital className="h-4 w-4" />
                    Clinic Name
                  </label>
                  <Input
                    type="text"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter clinic name"
                    className="border-2 border-emerald-200 focus:border-emerald-400 rounded-xl shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiMapPin className="h-4 w-4" />
                    Personal Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={
                      showPrivateInfo
                        ? formData.address
                        : "****** ****** ******"
                    }
                    onChange={handleInputChange}
                    disabled={!isEditing || !showPrivateInfo}
                    placeholder="Enter your address"
                    className="border-2 border-emerald-200 focus:border-emerald-400 rounded-xl shadow-md"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiMapPin className="h-4 w-4" />
                    Clinic Address
                  </label>
                  <Input
                    type="text"
                    name="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter clinic address"
                    className="border-2 border-emerald-200 focus:border-emerald-400 rounded-xl shadow-md"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Qualifications */}
          <QualificationSection
            qualifications={formData.qualifications}
            onUpdate={handleQualificationsUpdate}
            isEditing={isEditing}
          />

          {/* Appointment Statistics */}
          <AppointmentStatsSection
            appointments={appointments}
            doctorData={doctorData}
          />

          {/* Enhanced Verification Status */}
          <Card
            className={`shadow-xl ${
              getApprovalStatus() === "approved"
                ? "bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200"
                : "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200"
            }`}
          >
            <div className="p-8">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-4 rounded-2xl shadow-lg ${
                    getApprovalStatus() === "approved"
                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                      : "bg-gradient-to-r from-yellow-500 to-orange-500"
                  }`}
                >
                  {getApprovalStatus() === "approved" ? (
                    <MdVerifiedUser className="h-8 w-8 text-white" />
                  ) : (
                    <FiClock className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      getApprovalStatus() === "approved"
                        ? "text-emerald-900"
                        : "text-yellow-900"
                    }`}
                  >
                    {getApprovalStatus() === "approved"
                      ? "Doctor Account Approved"
                      : "Pending Medical Board Approval"}
                  </h3>
                  <p
                    className={`leading-relaxed ${
                      getApprovalStatus() === "approved"
                        ? "text-emerald-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {getApprovalStatus() === "approved"
                      ? "Your doctor account has been verified and approved by our medical board. You can now receive appointments from patients and provide medical services."
                      : "Your doctor registration is currently under review by our medical board. You will be notified once your credentials are verified and approved."}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Professional Summary */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
                  <FiTrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-indigo-900 mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-gray-600">
                    Your medical practice at a glance
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-white rounded-2xl border-2 border-blue-200 shadow-lg">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl w-fit mx-auto mb-3">
                    <FiUsers className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {Number(doctorData.appointmentCount) || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Consultations
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl border-2 border-emerald-200 shadow-lg">
                  <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl w-fit mx-auto mb-3">
                    <FiTrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600 mb-1">
                    {Number(doctorData.successfulTreatmentCount) || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Successful Treatments
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl border-2 border-purple-200 shadow-lg">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl w-fit mx-auto mb-3">
                    <FaCertificate className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mb-1">
                    {formData.qualifications?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Qualifications
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl border-2 border-orange-200 shadow-lg">
                  <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl w-fit mx-auto mb-3">
                    <FiClock className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600 mb-1">
                    {formData.experience || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Years Experience
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Profile Visibility */}
          <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-4 bg-gradient-to-r from-gray-500 to-blue-500 rounded-2xl shadow-lg">
                  <FiEye className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Profile Visibility
                  </h3>
                  <p className="text-gray-600">
                    How your profile appears to patients
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                      <FiUsers className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        Public Profile
                      </h4>
                      <p className="text-sm text-gray-600">
                        Your profile is visible to patients for appointment
                        booking
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-sm border-none shadow-lg ${
                      getApprovalStatus() === "approved"
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                        : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                    }`}
                  >
                    <FiCheckCircle className="w-4 h-4 mr-1" />
                    {getApprovalStatus() === "approved" ? "Visible" : "Hidden"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                      <FiSearch className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        Search Results
                      </h4>
                      <p className="text-sm text-gray-600">
                        Appear in patient search for doctors
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-sm border-none shadow-lg ${
                      getApprovalStatus() === "approved"
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                        : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                    }`}
                  >
                    <FiStar className="w-4 h-4 mr-1" />
                    {getApprovalStatus() === "approved"
                      ? "Included"
                      : "Excluded"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Data Export */}
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
                    <FiDownload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Export Profile Data
                    </h4>
                    <p className="text-sm text-gray-600">
                      Download your complete profile information as JSON
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const dataStr = JSON.stringify(formData, null, 2);
                    const dataBlob = new Blob([dataStr], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `doctor-profile-${doctorData.id}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                    toast.success("Profile data exported successfully!");
                  }}
                  className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50 shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <FiDownload className="h-4 w-4" />
                    <span>Export Data</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>

          {/* Medical Guidelines */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-xl">
            <div className="p-8">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                  <MdHealthAndSafety className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Professional Healthcare Guidelines
                    <MdSecurity className="h-5 w-5 text-indigo-600" />
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md">
                      <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <FiShield className="h-5 w-5" />
                        Profile Standards
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <FiCheckCircle className="h-4 w-4 text-teal-600" />
                          Keep professional information current and accurate
                        </li>
                        <li className="flex items-center gap-2">
                          <MdVerifiedUser className="h-4 w-4 text-blue-600" />
                          Maintain valid medical licensing credentials
                        </li>
                        <li className="flex items-center gap-2">
                          <FiHeart className="h-4 w-4 text-red-600" />
                          Provide compassionate patient care
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md">
                      <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <MdMedicalServices className="h-5 w-5" />
                        Best Practices
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <FiClock className="h-4 w-4 text-orange-600" />
                          Respond to patient inquiries promptly
                        </li>
                        <li className="flex items-center gap-2">
                          <FaNotesMedical className="h-4 w-4 text-emerald-600" />
                          Document all patient interactions thoroughly
                        </li>
                        <li className="flex items-center gap-2">
                          <MdMonitorHeart className="h-4 w-4 text-purple-600" />
                          Follow evidence-based treatment protocols
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
