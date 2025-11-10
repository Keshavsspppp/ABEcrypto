import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  FiCalendar,
  FiUsers,
  FiFileText,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiAward,
  FiUserCheck,
  FiShield,
  FiInfo,
  FiAlertCircle,
  FiArrowRight,
  FiHeart,
} from "react-icons/fi";
import {
  MdVerifiedUser,
  MdLocalHospital,
  MdHealthAndSafety,
  MdMedicalServices,
  MdSchedule,
  MdEmergency,
  MdBiotech,
  MdSecurity,
  MdPayment,
  MdInventory,
  MdMonitorHeart,
  MdPersonalInjury,
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
import { Card, Badge, Button } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import { useRouter } from "next/router";

const DoctorDashboard = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeAppointments: 0,
    completedTreatments: 0,
    totalPatients: 0,
  });

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getDoctorId,
    getDoctorDetails,
    getDoctorAppointments,
    getAllPatients,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get doctor ID
        const doctorId = await getDoctorId(address);
        if (!doctorId) {
          setLoading(false);
          return;
        }

        // Fetch doctor data
        const [doctorDetails, doctorAppointments, allPatients] =
          await Promise.all([
            getDoctorDetails(doctorId),
            getDoctorAppointments(doctorId),
            getAllPatients(),
          ]);
        console.log(doctorDetails);
        setDoctorData(doctorDetails);
        setAppointments(doctorAppointments || []);

        // Get recent patients from appointments
        const patientIds = new Set();
        doctorAppointments?.forEach((apt) => {
          patientIds.add(apt.patientId?.toString());
        });

        const relevantPatients =
          allPatients?.filter((patient) =>
            patientIds.has(patient.id?.toString())
          ) || [];
        setRecentPatients(relevantPatients.slice(0, 5));

        // Calculate stats
        const activeAppointments =
          doctorAppointments?.filter((apt) => apt.isOpen)?.length || 0;
        setStats({
          totalAppointments: Number(doctorDetails.appointmentCount) || 0,
          activeAppointments,
          completedTreatments:
            Number(doctorDetails.successfulTreatmentCount) || 0,
          totalPatients: patientIds.size,
        });
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [isConnected, address]);

  const formatDate = (timestamp) => {
    // Convert BigInt to Number for date operations
    const timeInMs = Number(timestamp) * 1000;
    return new Date(timeInMs).toLocaleDateString();
  };

  const getAppointmentStatus = (appointment) => {
    if (appointment.isOpen) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none text-xs">
          <FiClock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none text-xs">
          <FiCheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
  };

  const getApprovalStatus = () => {
    if (!doctorData) return null;

    if (doctorData.isApproved) {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none shadow-lg">
          <MdVerifiedUser className="w-4 h-4 mr-2" />
          Verified Doctor
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none shadow-lg">
          <FiClock className="w-4 h-4 mr-2" />
          Pending Approval
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <FaUserMd className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full animate-ping"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading doctor dashboard...
          </p>
          <p className="text-sm text-gray-500">
            Connecting to healthcare network
          </p>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-fit mx-auto shadow-lg">
                <FaUserMd className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <MdEmergency className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <MdHealthAndSafety className="h-5 w-5 text-red-600" />
              Doctor Registration Required
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You need to register as a healthcare professional to access the
              doctor dashboard and provide medical services.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/doctor/register")}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 w-full"
              >
                <FaUserMd className="mr-2 h-4 w-4" />
                Register as Doctor
              </Button>
              <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
                <FiShield className="h-4 w-4" />
                <span>Medical License Verification Required</span>
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
        <FaStethoscope className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
        <FaHeartbeat className="absolute bottom-20 left-20 h-24 w-24 text-cyan-600" />
        <MdLocalHospital className="absolute top-1/2 left-1/4 h-28 w-28 text-blue-600 animate-pulse animation-delay-2000" />
      </div>

      {/* Modern Welcome Header */}
      <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform -translate-x-16 translate-y-16"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
              <FaUserMd className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                Welcome back, Doctor!
                <MdHealthAndSafety className="h-8 w-8" />
              </h1>
              <p className="text-teal-100 text-lg flex items-center gap-2">
                <MdSecurity className="h-4 w-4" />
                Doctor ID: #{doctorData.id?.toString()}
              </p>
            </div>
          </div>
          <div className="text-right">{getApprovalStatus()}</div>
        </div>
      </div>

      {/* Enhanced Approval Notice */}
      {!doctorData.isApproved && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-8 border-yellow-400 border-2 border-yellow-200 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <FiClock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Account Pending Medical Board Approval
              </h3>
              <p className="text-yellow-800 leading-relaxed mb-3">
                Your healthcare professional account is currently under review
                by our medical board. Some features may be limited until
                verification is complete.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-yellow-700">
                  <MdBiotech className="h-4 w-4" />
                  <span className="font-medium">
                    License Verification in Progress
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-orange-700">
                  <MdSecurity className="h-4 w-4" />
                  <span className="font-medium">
                    Medical Credentials Review
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="gradient" className="border-blue-200/50 hover:border-blue-300 transition-all duration-300 group">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 transform group-hover:scale-110">
              <MdSchedule className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1">
                Total Appointments
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalAppointments}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 group">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 group-hover:shadow-xl group-hover:shadow-emerald-500/40 transition-all duration-300 transform group-hover:scale-110">
              <FiCheckCircle className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide mb-1">
                Successful Treatments
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.completedTreatments}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
              <FiClock className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-purple-700 font-bold uppercase tracking-wide">
                Active Appointments
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.activeAppointments}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
              <FiUsers className="h-8 w-8" />
            </div>
            <div className="ml-6">
              <p className="text-sm text-orange-700 font-bold uppercase tracking-wide">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.totalPatients}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      {doctorData.isApproved && (
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MdMedicalServices className="h-6 w-6 text-teal-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button
                onClick={() => router.push("/doctor/appointments")}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <MdSchedule className="h-6 w-6" />
                  <span>View Appointments</span>
                  <FiArrowRight className="h-5 w-5" />
                </div>
              </Button>
              <Button
                onClick={() => router.push("/doctor/prescribe")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <FaPrescriptionBottleAlt className="h-6 w-6" />
                  <span>Prescribe Medicine</span>
                  <FiArrowRight className="h-5 w-5" />
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/doctor/patients")}
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-bold py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <FiUsers className="h-6 w-6" />
                  <span>Patient Records</span>
                  <FiArrowRight className="h-5 w-5" />
                </div>
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Recent Appointments */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MdSchedule className="h-6 w-6 text-blue-600" />
                Recent Appointments
              </h2>
              <Button
                variant="outline"
                size="small"
                onClick={() => router.push("/doctor/appointments")}
                className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <span>View All</span>
                <FiArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {appointments.slice(0, 3).map((appointment, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl border-2 border-teal-200">
                        <FaHospitalUser className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">
                          Patient ID: #{appointment.patientId?.toString()}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          {appointment.appointmentDate}
                        </p>
                        <p className="text-sm text-gray-700 font-medium">
                          {appointment.condition}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getAppointmentStatus(appointment)}
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                        <FiClock className="h-3 w-3" />
                        {appointment.from} - {appointment.to}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border-2 border-blue-200">
                  <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                    <MdSchedule className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No appointments scheduled yet
                  </p>
                  <p className="text-sm text-gray-400">
                    Patient appointments will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Enhanced Recent Patients */}
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaHospitalUser className="h-6 w-6 text-emerald-600" />
                Recent Patients
              </h2>
              <Button
                variant="outline"
                size="small"
                onClick={() => router.push("/doctor/patients")}
                className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <span>View All</span>
                <FiArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentPatients.slice(0, 3).map((patient, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border-2 border-emerald-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl border-2 border-emerald-200">
                        <FaHospitalUser className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">
                          Patient ID: #{patient.id?.toString()}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <FaNotesMedical className="h-3 w-3" />
                          {patient.medicalHistory?.length || 0} medical records
                        </p>
                      </div>
                    </div>
                    <Button
                      size="small"
                      variant="outline"
                      className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      View Patient
                    </Button>
                  </div>
                </div>
              ))}
              {recentPatients.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border-2 border-emerald-200">
                  <div className="p-4 bg-emerald-100 rounded-full w-fit mx-auto mb-4">
                    <FaHospitalUser className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No patients yet</p>
                  <p className="text-sm text-gray-400">
                    Patient consultations will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Performance Metrics */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiTrendingUp className="h-6 w-6 text-purple-600" />
            Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl w-fit mx-auto mb-4 border-2 border-blue-200">
                <FiTrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalAppointments}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Total Consultations
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border-2 border-emerald-200 hover:shadow-lg transition-all duration-200">
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl w-fit mx-auto mb-4 border-2 border-emerald-200">
                <FaHeartbeat className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 mb-2">
                {stats.totalAppointments > 0
                  ? Math.round(
                      (stats.completedTreatments / stats.totalAppointments) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-600 font-medium">Success Rate</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl w-fit mx-auto mb-4 border-2 border-purple-200">
                <FaHospitalUser className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {stats.totalPatients}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Patients Treated
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Professional Tips */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
              <MdHealthAndSafety className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Professional Healthcare Reminders
                <MdMedicalServices className="h-5 w-5 text-indigo-600" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-indigo-200">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <FaNotesMedical className="h-4 w-4 text-teal-600" />
                      Review patient medical history before appointments
                    </li>
                    <li className="flex items-center gap-2">
                      <FiFileText className="h-4 w-4 text-blue-600" />
                      Update treatment records after consultations
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-200">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <FaPrescriptionBottleAlt className="h-4 w-4 text-purple-600" />
                      Prescribe medications based on patient conditions
                    </li>
                    <li className="flex items-center gap-2">
                      <MdSecurity className="h-4 w-4 text-emerald-600" />
                      Maintain professional communication with patients
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

export default DoctorDashboard;
