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
  FiHeart,
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
  FiCheckCircle,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdVerifiedUser,
  MdBloodtype,
  MdPersonPin,
  MdHealthAndSafety,
  MdMedicalServices,
  MdSecurity,
  MdEmergency,
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
  FaIdCard,
} from "react-icons/fa";
import { Card, Button, Input, Select, Badge } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import { truncateAddress, safeNumberConversion } from "../../utils/helpers";
import { formatEther } from "viem";
import toast from "react-hot-toast";

const ProfileImageUpload = ({ currentImage, onImageUpdate, loading }) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);

      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);

      const result = await ipfsService.uploadToIPFS(file, {
        name: `patient-profile-${Date.now()}`,
        type: "patient-profile-image",
      });

      onImageUpdate(result.hash);
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
      <div className="w-32 h-32 mx-auto bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
        {loading || uploading ? (
          <LoadingSpinner size="large" />
        ) : getImageUrl() ? (
          <img
            src={getImageUrl()}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <FaHospitalUser className="h-16 w-16 text-emerald-600" />
        )}
      </div>

      <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 cursor-pointer">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white p-3 rounded-full shadow-xl transition-all duration-200 transform hover:scale-105">
          <FiCamera className="h-4 w-4" />
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

const MedicalHistorySection = ({ medicalHistory, onUpdate, isEditing }) => {
  const [history, setHistory] = useState(medicalHistory || []);
  const [newRecord, setNewRecord] = useState("");

  useEffect(() => {
    setHistory(medicalHistory || []);
  }, [medicalHistory]);

  const handleAddRecord = () => {
    if (!newRecord.trim()) return;

    const updatedHistory = [...history, newRecord.trim()];
    setHistory(updatedHistory);
    onUpdate(updatedHistory);
    setNewRecord("");
    toast.success("Medical record added");
  };

  const handleRemoveRecord = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    onUpdate(updatedHistory);
    toast.success("Medical record removed");
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaNotesMedical className="h-6 w-6 text-blue-600" />
            Medical History
          </h3>
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none text-sm">
            <FiActivity className="w-3 h-3 mr-1" />
            {history.length} Records
          </Badge>
        </div>

        <div className="space-y-4">
          {history.map((record, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                    <FaNotesMedical className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 flex-1 break-words font-medium">
                    {record}
                  </p>
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleRemoveRecord(index)}
                    className="ml-2 flex-shrink-0 border-2 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <FiX className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <div className="mt-6">
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Add new medical record..."
                  value={newRecord}
                  onChange={(e) => setNewRecord(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddRecord();
                    }
                  }}
                  className="flex-1 border-2 border-blue-200 focus:border-blue-500"
                />
                <Button
                  onClick={handleAddRecord}
                  disabled={!newRecord.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                >
                  <FaNotesMedical className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {history.length === 0 && (
            <div className="text-center py-12">
              <div className="p-6 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full w-fit mx-auto mb-6 shadow-lg">
                <FiActivity className="h-12 w-12 text-white" />
              </div>
              <p className="text-gray-500 font-medium">
                No medical history records
              </p>
              {isEditing && (
                <p className="text-sm text-gray-400 mt-2">
                  Add your first medical record above
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const AppointmentHistorySection = ({ appointments, onViewAll }) => {
  const getStatusBadge = (appointment) => {
    if (appointment.isOpen === false) {
      return {
        className:
          "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none",
        label: "Completed",
        icon: FiCheckCircle,
      };
    } else if (appointment.isOpen === true) {
      return {
        className:
          "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none",
        label: "Scheduled",
        icon: FiCalendar,
      };
    } else {
      return {
        className:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none",
        label: "Pending",
        icon: FiClock,
      };
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiCalendar className="h-6 w-6 text-emerald-600" />
            Recent Appointments
          </h3>
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none text-sm">
            <FaUserMd className="w-3 h-3 mr-1" />
            {appointments.length} Total
          </Badge>
        </div>

        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.slice(0, 5).map((appointment, index) => {
              const appointmentId = safeNumberConversion(appointment.id);
              const appointmentDoctorId = safeNumberConversion(
                appointment.doctorId
              );
              const statusInfo = getStatusBadge(appointment);

              return (
                <div
                  key={appointmentId || index}
                  className="bg-white p-4 rounded-xl border-2 border-emerald-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-lg">
                          <FaUserMd className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-gray-900">
                            Dr.{" "}
                            {appointment.doctorName ||
                              `Doctor #${appointmentDoctorId}`}
                          </span>
                        </div>
                        <Badge className={statusInfo.className}>
                          <statusInfo.icon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FaNotesMedical className="h-3 w-3 text-emerald-600" />
                          <span className="text-sm text-gray-600 font-medium">
                            Condition:{" "}
                            {appointment.condition || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs text-gray-500 font-medium">
                            {appointment.appointmentDate ||
                              "Date not specified"}
                          </span>
                        </div>
                        {appointment.from && appointment.to && (
                          <div className="flex items-center space-x-2">
                            <FiClock className="h-3 w-3 text-emerald-600" />
                            <span className="text-xs text-gray-500 font-medium">
                              Time: {appointment.from} - {appointment.to}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="p-6 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full w-fit mx-auto mb-6 shadow-lg">
                <FiCalendar className="h-12 w-12 text-white" />
              </div>
              <p className="text-gray-500 font-medium mb-4">
                No appointments yet
              </p>
              <Button
                onClick={() =>
                  (window.location.href = "/patient/book-appointment")
                }
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg"
              >
                <FiCalendar className="h-4 w-4 mr-2" />
                Book First Appointment
              </Button>
            </div>
          )}
        </div>

        {appointments.length > 5 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              size="small"
              onClick={onViewAll}
              className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <FiEye className="h-4 w-4 mr-2" />
              View All Appointments
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

const PatientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    address: "",
    emergencyContact: "",
    emergencyContactName: "",
    allergies: "",
    currentMedications: "",
    profileImage: "",
  });

  const { address, isConnected } = useAccount();
  const router = useRouter();

  const {
    getPatientId,
    getPatientDetails,
    getPatientAppointments,
    getUserType,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (!isConnected || !address) {
        router.push("/patient/register");
        return;
      }

      try {
        setLoading(true);

        const userInfo = await getUserType(address);
        if (!userInfo || userInfo.userType !== "patient") {
          router.push("/patient/register");
          return;
        }

        const patientId = await getPatientId(address);
        if (!patientId) {
          router.push("/patient/register");
          return;
        }

        const [patientDetails, patientAppointments] = await Promise.all([
          getPatientDetails(patientId).catch(() => null),
          getPatientAppointments(patientId).catch(() => []),
        ]);

        if (!patientDetails) {
          router.push("/patient/register");
          return;
        }

        const processedAppointments = (patientAppointments || []).map(
          (appointment) => ({
            ...appointment,
            id: safeNumberConversion(appointment.id),
            doctorId: safeNumberConversion(appointment.doctorId),
            patientId: safeNumberConversion(appointment.patientId),
            date: safeNumberConversion(appointment.date),
          })
        );

        setPatientData({
          ...patientDetails,
          id: safeNumberConversion(patientDetails.id),
        });
        setAppointments(processedAppointments);

        if (patientDetails.IPFS_URL) {
          try {
            const hash = patientDetails.IPFS_URL.replace(
              "https://gateway.pinata.cloud/ipfs/",
              ""
            );
            const ipfsData = await ipfsService.fetchFromIPFS(hash);
            setProfileData(ipfsData);

            setFormData({
              name: ipfsData.name || "",
              email: ipfsData.email || "",
              phone: ipfsData.phone || "",
              age: ipfsData.age || "",
              gender: ipfsData.gender || "",
              bloodGroup: ipfsData.bloodGroup || "",
              address: ipfsData.address || "",
              emergencyContact: ipfsData.emergencyContact || "",
              emergencyContactName: ipfsData.emergencyContactName || "",
              allergies: ipfsData.allergies || "",
              currentMedications: ipfsData.currentMedications || "",
              profileImage: ipfsData.profileImage || "",
            });
          } catch (error) {
            console.error("Error fetching IPFS data:", error);
            setFormData((prev) => ({
              ...prev,
              name: patientDetails.name || "",
            }));
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            name: patientDetails.name || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching patient profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, [isConnected, address, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMedicalHistoryUpdate = (newHistory) => {
    console.log("Updated medical history:", newHistory);
    toast.info(
      "Medical history updated. Changes will be saved when you save the profile."
    );
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

      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }

      const profileDataToUpload = {
        ...formData,
        updatedAt: new Date().toISOString(),
        version: "1.0",
      };

      const result = await ipfsService.uploadJSONToIPFS(profileDataToUpload, {
        name: `patient-profile-${patientData.id}`,
        type: "patient-profile-metadata",
      });

      console.log("Profile uploaded to IPFS:", result);

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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleViewAllAppointments = () => {
    router.push("/patient/history");
  };

  const handleCancelEdit = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        age: profileData.age || "",
        gender: profileData.gender || "",
        bloodGroup: profileData.bloodGroup || "",
        address: profileData.address || "",
        emergencyContact: profileData.emergencyContact || "",
        emergencyContactName: profileData.emergencyContactName || "",
        allergies: profileData.allergies || "",
        currentMedications: profileData.currentMedications || "",
        profileImage: profileData.profileImage || "",
      });
    }
    setIsEditing(false);
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
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
          <p className="text-sm text-gray-500">
            Retrieving your medical profile
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
              You need to register as a patient to view and manage your medical
              profile.
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
        <FaHospitalUser className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
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
              <FaHospitalUser className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                Patient Profile
                <MdHealthAndSafety className="h-8 w-8" />
              </h1>
              <p className="text-teal-100 text-lg flex items-center gap-2">
                <MdSecurity className="h-4 w-4" />
                Manage your personal information and medical data
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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

        <div className="flex items-center space-x-3 relative z-10">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={saving}
                className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
              >
                <FiX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
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
              className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
            >
              <FiEdit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
            <div className="p-6 text-center">
              <ProfileImageUpload
                currentImage={formData.profileImage}
                onImageUpdate={handleImageUpdate}
                loading={saving}
              />

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.name || `Patient #${patientData.id}`}
                </h2>
                <p className="text-emerald-600 font-bold mt-2 flex items-center justify-center gap-2">
                  <FaIdCard className="h-4 w-4" />
                  Patient ID: #{patientData.id}
                </p>

                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none">
                    <MdVerifiedUser className="w-3 h-3 mr-1" />
                    Verified Patient
                  </Badge>
                </div>
              </div>

              {/* Basic Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t-2 border-emerald-200">
                <div className="text-center p-3 bg-white rounded-xl border border-emerald-200">
                  <p className="text-2xl font-bold text-emerald-600">
                    {appointments.length}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    Appointments
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-xl border border-emerald-200">
                  <p className="text-2xl font-bold text-blue-600">
                    {patientData.medicalHistory?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    Medical Records
                  </p>
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="mt-6 pt-6 border-t-2 border-emerald-200">
                <div className="bg-white p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">
                      Wallet Address:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-gray-900 font-bold">
                        {truncateAddress(address)}
                      </span>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => copyToClipboard(address)}
                        className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <FiCopy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MdMedicalServices className="h-6 w-6 text-purple-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                  onClick={() => router.push("/patient/book-appointment")}
                >
                  <FiCalendar className="h-4 w-4 mr-3" />
                  Book Appointment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => router.push("/patient/prescriptions")}
                >
                  <FaPrescriptionBottleAlt className="h-4 w-4 mr-3" />
                  View Prescriptions
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                  onClick={() => router.push("/chat")}
                >
                  <FiMail className="h-4 w-4 mr-3" />
                  Message Doctor
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaHospitalUser className="h-6 w-6 text-blue-600" />
                  Personal Information
                </h3>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                  className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {showPrivateInfo ? (
                    <FiEyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <FiEye className="h-4 w-4 mr-2" />
                  )}
                  {showPrivateInfo ? "Hide" : "Show"} Private Info
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className="border-2 border-blue-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                    className="border-2 border-blue-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={showPrivateInfo ? formData.phone : "***-***-****"}
                    onChange={handleInputChange}
                    disabled={!isEditing || !showPrivateInfo}
                    placeholder="Enter your phone number"
                    className="border-2 border-blue-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide">
                    Age
                  </label>
                  <Input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    className="border-2 border-blue-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide">
                    Gender
                  </label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="border-2 border-blue-200 focus:border-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <MdBloodtype className="h-4 w-4" />
                    Blood Group
                  </label>
                  <Select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="border-2 border-blue-200 focus:border-blue-500"
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide">
                    Address
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
                    className="border-2 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MdEmergency className="h-6 w-6 text-red-600" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-red-700 mb-2 uppercase tracking-wide">
                    Contact Name
                  </label>
                  <Input
                    type="text"
                    name="emergencyContactName"
                    value={
                      showPrivateInfo
                        ? formData.emergencyContactName
                        : "****** ******"
                    }
                    onChange={handleInputChange}
                    disabled={!isEditing || !showPrivateInfo}
                    placeholder="Emergency contact name"
                    className="border-2 border-red-200 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-red-700 mb-2 uppercase tracking-wide">
                    Contact Phone
                  </label>
                  <Input
                    type="tel"
                    name="emergencyContact"
                    value={
                      showPrivateInfo
                        ? formData.emergencyContact
                        : "***-***-****"
                    }
                    onChange={handleInputChange}
                    disabled={!isEditing || !showPrivateInfo}
                    placeholder="Emergency contact phone"
                    className="border-2 border-red-200 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Medical Information */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MdMedicalServices className="h-6 w-6 text-purple-600" />
                Medical Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-purple-700 mb-2 uppercase tracking-wide">
                    Known Allergies
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="List any known allergies..."
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-700 mb-2 uppercase tracking-wide">
                    Current Medications
                  </label>
                  <textarea
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="List current medications..."
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Medical History */}
          <MedicalHistorySection
            medicalHistory={patientData.medicalHistory}
            onUpdate={handleMedicalHistoryUpdate}
            isEditing={isEditing}
          />

          {/* Appointment History */}
          <AppointmentHistorySection
            appointments={appointments}
            onViewAll={handleViewAllAppointments}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
