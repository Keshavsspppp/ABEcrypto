import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  FiUsers,
  FiShoppingBag,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiUserCheck,
  FiUserX,
  FiDollarSign,
  FiSettings,
  FiPlusCircle,
  FiEye,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBarChart,
  FiDatabase,
  FiLock,
  FiGlobe,
  FiServer,
  FiMonitor,
} from "react-icons/fi";
import {
  MdAdminPanelSettings,
  MdSecurity,
  MdVerifiedUser,
  MdHealthAndSafety,
  MdMedicalServices,
  MdLocalHospital,
  MdBiotech,
  MdInventory,
  MdMonitorHeart,
  MdAccountBalance,
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
  FaUserShield,
} from "react-icons/fa";

import { Card, Badge, Button } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import { useRouter } from "next/router";

const AdminDashboard = () => {
  const [contractInfo, setContractInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    approvedDoctors: 0,
    pendingDoctors: 0,
    totalPatients: 0,
    totalMedicines: 0,
    activeMedicines: 0,
    totalAppointments: 0,
    activeAppointments: 0,
  });

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getContractInfo,
    getAllDoctors,
    getAllPatients,
    getAllMedicines,
    getAllAppointments,
    approveDoctorStatus,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all admin data with Promise.allSettled to handle individual failures gracefully
        const results = await Promise.allSettled([
          getContractInfo().catch((err) => {
            console.warn("Failed to fetch contract info:", err.message);
            return null;
          }),
          getAllDoctors().catch((err) => {
            console.warn("Failed to fetch doctors:", err.message);
            return [];
          }),
          getAllPatients().catch((err) => {
            console.warn("Failed to fetch patients:", err.message);
            return [];
          }),
          getAllMedicines().catch((err) => {
            console.warn("Failed to fetch medicines:", err.message);
            return [];
          }),
          getAllAppointments().catch((err) => {
            console.warn("Failed to fetch appointments:", err.message);
            return [];
          }),
        ]);

        // Extract values from Promise.allSettled results
        const contractData = results[0].status === "fulfilled" ? results[0].value : null;
        const allDoctors = results[1].status === "fulfilled" ? (results[1].value || []) : [];
        const allPatients = results[2].status === "fulfilled" ? (results[2].value || []) : [];
        const allMedicines = results[3].status === "fulfilled" ? (results[3].value || []) : [];
        const allAppointments = results[4].status === "fulfilled" ? (results[4].value || []) : [];

        setContractInfo(contractData);
        setDoctors(allDoctors);
        setPatients(allPatients);
        setMedicines(allMedicines);
        setAppointments(allAppointments);

        // Calculate stats
        const approvedDoctors =
          allDoctors?.filter((doc) => doc.isApproved)?.length || 0;
        const pendingDoctors =
          allDoctors?.filter((doc) => !doc.isApproved)?.length || 0;
        const activeMedicines =
          allMedicines?.filter((med) => med.active)?.length || 0;
        const activeAppointments =
          allAppointments?.filter((apt) => apt.isOpen)?.length || 0;

        setStats({
          totalDoctors: allDoctors?.length || 0,
          approvedDoctors,
          pendingDoctors,
          totalPatients: allPatients?.length || 0,
          totalMedicines: allMedicines?.length || 0,
          activeMedicines,
          totalAppointments: allAppointments?.length || 0,
          activeAppointments,
        });
      } catch (error) {
        // Only log critical errors, not contract call failures
        console.error("Critical error in admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isConnected, address]);

  const handleApproveDoctor = async (doctorId) => {
    try {
      await approveDoctorStatus(doctorId);
      // Refresh data after approval
      window.location.reload();
    } catch (error) {
      console.error("Error approving doctor:", error);
    }
  };

  const formatEther = (value) => {
    return `${value} ETH`;
  };

  const getStatusBadge = (isApproved) => {
    return isApproved ? (
      <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none shadow-md">
        <FiCheckCircle className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    ) : (
      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none shadow-md">
        <FiClock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-2xl">
              <MdAdminPanelSettings className="h-16 w-16 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-300 rounded-full animate-ping animation-delay-1000"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-6 text-gray-700 font-bold text-lg">
            Loading Admin Dashboard...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Initializing healthcare management system
          </p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin =
    contractInfo &&
    address &&
    address.toLowerCase() === contractInfo.admin.toLowerCase();

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 shadow-2xl">
          <div className="text-center py-12">
            <div className="relative mb-8">
              <div className="p-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-fit mx-auto shadow-2xl">
                <FaUserShield className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <FiAlertCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <MdSecurity className="h-6 w-6 text-red-600" />
              Access Denied
            </h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              You need administrator privileges to access this healthcare
              management dashboard. Only authorized system administrators can
              view this content.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
                <FiShield className="h-4 w-4" />
                <span>Admin Authorization Required</span>
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
        <MdAdminPanelSettings className="absolute top-20 right-20 h-32 w-32 text-indigo-600 animate-pulse" />
        <FaStethoscope className="absolute bottom-20 left-20 h-24 w-24 text-purple-600" />
        <MdHealthAndSafety className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Modern Welcome Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform -translate-x-16 translate-y-16"></div>

        <div className="flex items-center space-x-6 relative z-10">
          <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
            <MdAdminPanelSettings className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              Healthcare Admin Dashboard
              <MdHealthAndSafety className="h-8 w-8" />
            </h1>
            <p className="text-indigo-100 text-lg flex items-center gap-2">
              <MdSecurity className="h-4 w-4" />
              Complete healthcare system management and oversight
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 rounded-lg px-3 py-1">
                <FiDatabase className="h-4 w-4" />
                <span>Contract Admin</span>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 rounded-lg px-3 py-1">
                <FiGlobe className="h-4 w-4" />
                <span>Global Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="gradient" className="border-teal-200/50 hover:border-teal-300 transition-all duration-300 group">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25 group-hover:shadow-xl group-hover:shadow-teal-500/40 transition-all duration-300 transform group-hover:scale-110">
              <FaUserMd className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-xs text-teal-700 font-bold uppercase tracking-wide mb-1">
                Total Doctors
              </p>
              <p className="text-3xl font-bold text-teal-600">
                {stats.totalDoctors}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                <FiCheckCircle className="h-3 w-3 text-emerald-500" />
                {stats.approvedDoctors} approved
              </p>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="border-blue-200/50 hover:border-blue-300 transition-all duration-300 group">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 transform group-hover:scale-110">
              <FaHospitalUser className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalPatients}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                <MdVerifiedUser className="h-3 w-3 text-blue-500" />
                registered users
              </p>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="border-purple-200/50 hover:border-purple-300 transition-all duration-300 group">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-300 transform group-hover:scale-110">
              <FaPrescriptionBottleAlt className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-xs text-purple-700 font-bold uppercase tracking-wide mb-1">
                Total Medicines
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalMedicines}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                <MdInventory className="h-3 w-3 text-emerald-500" />
                {stats.activeMedicines} active
              </p>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="border-orange-200/50 hover:border-orange-300 transition-all duration-300 group">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25 group-hover:shadow-xl group-hover:shadow-orange-500/40 transition-all duration-300 transform group-hover:scale-110">
              <FiCalendar className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-xs text-orange-700 font-bold uppercase tracking-wide mb-1">
                Appointments
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.totalAppointments}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                <FiActivity className="h-3 w-3 text-orange-500" />
                {stats.activeAppointments} active
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Contract Settings */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-xl">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
              <MdAccountBalance className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Contract Settings
              </h2>
              <p className="text-gray-600">
                Blockchain contract configuration and fees
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-white to-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
                  <FaUserMd className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Doctor Registration Fee
                </h3>
              </div>
              <p className="text-3xl font-bold text-emerald-600 mb-2">
                {contractInfo
                  ? formatEther(contractInfo.registrationDoctorFee)
                  : "Loading..."}
              </p>
              <p className="text-sm text-gray-500">
                Professional registration cost
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                  <FaHospitalUser className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Patient Registration Fee
                </h3>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {contractInfo
                  ? formatEther(contractInfo.registrationPatientFee)
                  : "Loading..."}
              </p>
              <p className="text-sm text-gray-500">Patient registration cost</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl border-2 border-purple-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                  <FiCalendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Appointment Fee
                </h3>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {contractInfo
                  ? formatEther(contractInfo.appointmentFee)
                  : "Loading..."}
              </p>
              <p className="text-sm text-gray-500">Consultation booking fee</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
              <FiActivity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quick Actions
              </h2>
              <p className="text-gray-600">
                Administrative tools and management functions
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button
              onClick={() => router.push("/admin/medicines/add")}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FiPlusCircle className="h-6 w-6" />
                </div>
                <span>Add Medicine</span>
              </div>
            </Button>
            <Button
              onClick={() => router.push("/admin/doctors")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FiEye className="h-6 w-6" />
                </div>
                <span>Review Doctors</span>
              </div>
            </Button>
            <Button
              onClick={() => router.push("/admin/analytics")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FiTrendingUp className="h-6 w-6" />
                </div>
                <span>View Analytics</span>
              </div>
            </Button>
            <Button
              onClick={() => router.push("/admin/appointments")}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FiCalendar className="h-6 w-6" />
                </div>
                <span>Appointments</span>
              </div>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Pending Doctor Approvals */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-xl">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                  <FiUserCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Pending Doctor Approvals
                  </h2>
                  <p className="text-gray-600">
                    Medical professionals awaiting verification
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-4 py-2 border-none shadow-lg">
                <FiClock className="w-4 h-4 mr-2" />
                {stats.pendingDoctors}
              </Badge>
            </div>
            <div className="space-y-4">
              {doctors
                .filter((doc) => !doc.isApproved)
                .slice(0, 3)
                .map((doctor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-yellow-50 rounded-2xl border-2 border-yellow-200 shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl shadow-md">
                        <FaUserMd className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          Doctor ID: #{doctor.id?.toString()}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FiShield className="h-3 w-3" />
                          Address: {doctor.accountAddress?.slice(0, 6)}...
                          {doctor.accountAddress?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleApproveDoctor(doctor.id)}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg"
                    >
                      <FiCheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                ))}
              {stats.pendingDoctors === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-white to-yellow-50 rounded-2xl border-2 border-yellow-200">
                  <div className="p-4 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full w-fit mx-auto mb-4 shadow-lg">
                    <FiUserCheck className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-gray-600">
                    No pending doctor approvals at this time
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-xl">
          <div className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
                <FiActivity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Activity
                </h2>
                <p className="text-gray-600">
                  Latest system registrations and updates
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {/* Recent doctor registrations */}
              {doctors.slice(-3).map((doctor, index) => (
                <div
                  key={`doctor-${index}`}
                  className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-200 shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-md">
                      <FaUserMd className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        New doctor registered
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MdSecurity className="h-3 w-3" />
                        Doctor ID: #{doctor.id?.toString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(doctor.isApproved)}
                </div>
              ))}

              {/* Recent patient registrations */}
              {patients.slice(-2).map((patient, index) => (
                <div
                  key={`patient-${index}`}
                  className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl shadow-md">
                      <FaHospitalUser className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        New patient registered
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MdVerifiedUser className="h-3 w-3" />
                        Patient ID: #{patient.id?.toString()}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none shadow-md">
                    <FiCheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              ))}

              {doctors.length === 0 && patients.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-white to-teal-50 rounded-2xl border-2 border-teal-200">
                  <div className="p-4 bg-gradient-to-r from-gray-400 to-teal-400 rounded-full w-fit mx-auto mb-4 shadow-lg">
                    <FiActivity className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Recent Activity
                  </h3>
                  <p className="text-gray-600">
                    System activity will appear here as users register
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced System Statistics */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-xl">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
              <FiBarChart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                System Statistics
              </h2>
              <p className="text-gray-600">
                Healthcare platform performance metrics
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-200 shadow-lg">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl w-fit mx-auto mb-4 shadow-md">
                <FiActivity className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalAppointments}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Total Consultations
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Platform-wide medical consultations
              </p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-white to-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl w-fit mx-auto mb-4 shadow-md">
                <FiTrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 mb-2">
                {stats.totalDoctors > 0
                  ? Math.round(
                      (stats.approvedDoctors / stats.totalDoctors) * 100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Doctor Approval Rate
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Medical professional verification success
              </p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-white to-purple-50 rounded-2xl border-2 border-purple-200 shadow-lg">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl w-fit mx-auto mb-4 shadow-md">
                <FaPrescriptionBottleAlt className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {stats.totalMedicines > 0
                  ? Math.round(
                      (stats.activeMedicines / stats.totalMedicines) * 100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Active Medicines
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Available pharmaceutical inventory
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Platform Health */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-xl">
        <div className="p-8">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
              <FiMonitor className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Platform Health & Status
                <MdHealthAndSafety className="h-6 w-6 text-teal-600" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border-2 border-teal-200 shadow-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                      <FiCheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      System Status:
                    </p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                    <FiActivity className="h-4 w-4" />
                    Operational
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border-2 border-teal-200 shadow-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                      <FiDatabase className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      Contract Version:
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">v1.0.0</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border-2 border-teal-200 shadow-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                      <FiUsers className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      Total Users:
                    </p>
                  </div>
                  <p className="text-lg font-bold text-purple-600">
                    {stats.totalDoctors + stats.totalPatients}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border-2 border-teal-200 shadow-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                      <FiGlobe className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">Network:</p>
                  </div>
                  <p className="text-lg font-bold text-orange-600 flex items-center gap-2">
                    <FiServer className="h-4 w-4" />
                    Polygon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Security & Compliance */}
      <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 shadow-xl">
        <div className="p-8">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-r from-gray-500 to-blue-500 rounded-2xl shadow-lg">
              <FiShield className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Security & Compliance Overview
                <MdSecurity className="h-6 w-6 text-gray-600" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiLock className="h-5 w-5 text-emerald-600" />
                    Security Features
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-3">
                      <div className="p-1 bg-emerald-100 rounded-full">
                        <FiCheckCircle className="h-3 w-3 text-emerald-600" />
                      </div>
                      Blockchain-secured medical records
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 bg-emerald-100 rounded-full">
                        <FiCheckCircle className="h-3 w-3 text-emerald-600" />
                      </div>
                      Encrypted patient data storage
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 bg-emerald-100 rounded-full">
                        <FiCheckCircle className="h-3 w-3 text-emerald-600" />
                      </div>
                      Multi-signature admin controls
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MdHealthAndSafety className="h-5 w-5 text-blue-600" />
                    Compliance Standards
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-3">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <FiCheckCircle className="h-3 w-3 text-blue-600" />
                      </div>
                      HIPAA-compliant data handling
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <FiCheckCircle className="h-3 w-3 text-blue-600" />
                      </div>
                      Medical license verification
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <FiCheckCircle className="h-3 w-3 text-blue-600" />
                      </div>
                      Audit trail maintenance
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Admin Guidelines */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-l-8 border-indigo-400 border-2 border-indigo-200 shadow-xl">
        <div className="p-8">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
              <MdAdminPanelSettings className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                Administrative Guidelines & Best Practices
                <MdSecurity className="h-5 w-5 text-indigo-600" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md">
                  <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <FiShield className="h-5 w-5" />
                    System Management
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="h-4 w-4 text-teal-600" />
                      Review doctor applications promptly
                    </li>
                    <li className="flex items-center gap-2">
                      <MdVerifiedUser className="h-4 w-4 text-blue-600" />
                      Verify medical credentials thoroughly
                    </li>
                    <li className="flex items-center gap-2">
                      <FiMonitor className="h-4 w-4 text-purple-600" />
                      Monitor system performance regularly
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md">
                  <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <MdHealthAndSafety className="h-5 w-5" />
                    Healthcare Compliance
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <FiDatabase className="h-4 w-4 text-orange-600" />
                      Maintain secure patient data standards
                    </li>
                    <li className="flex items-center gap-2">
                      <MdMedicalServices className="h-4 w-4 text-emerald-600" />
                      Ensure medicine inventory accuracy
                    </li>
                    <li className="flex items-center gap-2">
                      <FiActivity className="h-4 w-4 text-red-600" />
                      Track platform usage analytics
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
