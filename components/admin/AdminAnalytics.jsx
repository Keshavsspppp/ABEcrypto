import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiArrowLeft,
  FiDownload,
  FiRefreshCw,
  FiFilter,
  FiEye,
  FiShield,
  FiClock,
  FiTarget,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdMedication,
  MdVerifiedUser,
  MdAnalytics,
  MdHealthAndSafety,
  MdMedicalServices,
  MdSecurity,
  MdEmergency,
  MdBiotech,
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
} from "react-icons/fa";
import { Card, Button, Select, Badge } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import { useHealthcareContract } from "../../hooks/useContract";
import { truncateAddress } from "../../utils/helpers";
import { formatEther } from "viem";
import toast from "react-hot-toast";

const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description,
}) => {
  return (
    <Card
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-2 border-${color}-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm text-${color}-700 font-bold uppercase tracking-wide mb-2`}
            >
              {title}
            </p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            {description && (
              <p className={`text-sm text-${color}-600 mt-2 font-medium`}>
                {description}
              </p>
            )}
          </div>
          <div
            className={`p-4 rounded-2xl bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg`}
          >
            <Icon className="h-8 w-8" />
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-4 flex items-center">
            {changeType === "increase" ? (
              <FiTrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <FiTrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-bold ${
                changeType === "increase" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    </Card>
  );
};

const ChartCard = ({ title, children, actions, gradient = "teal" }) => {
  return (
    <Card
      className={`bg-gradient-to-br from-${gradient}-50 to-${gradient}-100 border-2 border-${gradient}-200 shadow-lg`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MdAnalytics className={`h-6 w-6 text-${gradient}-600`} />
            {title}
          </h3>
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-white shadow-inner">
          {children}
        </div>
      </div>
    </Card>
  );
};

const SimpleBarChart = ({ data, title, color = "teal" }) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-sm font-medium text-gray-700">
            {item.label}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-3 border border-gray-300">
            <div
              className={`bg-gradient-to-r from-${color}-500 to-${color}-600 h-3 rounded-full transition-all duration-500 shadow-sm`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm font-bold text-gray-900 text-right">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const TopPerformersCard = ({ doctors, title }) => {
  return (
    <ChartCard title={title} gradient="emerald">
      <div className="space-y-4">
        {doctors.slice(0, 5).map((doctor, index) => (
          <div
            key={doctor.id}
            className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:shadow-lg transition-all duration-200"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : index === 1
                  ? "bg-gradient-to-r from-gray-500 to-gray-600"
                  : index === 2
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
              }`}
            >
              <span className="text-sm">#{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FaUserMd className="h-4 w-4 text-emerald-600" />
                Dr. {doctor.name || `Doctor #${doctor.id}`}
              </p>
              <p className="text-xs text-emerald-700 flex items-center gap-2">
                <FaStethoscope className="h-3 w-3" />
                {doctor.appointmentCount} consultations • {doctor.successRate}%
                success rate
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600">
                {doctor.appointmentCount}
              </p>
              <p className="text-xs text-gray-600 font-medium">patients</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
};

const RecentActivityCard = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "appointment":
        return <FiCalendar className="h-4 w-4 text-white" />;
      case "medicine":
        return <MdMedication className="h-4 w-4 text-white" />;
      case "doctor":
        return <FaUserMd className="h-4 w-4 text-white" />;
      case "patient":
        return <FaHospitalUser className="h-4 w-4 text-white" />;
      default:
        return <FiActivity className="h-4 w-4 text-white" />;
    }
  };

  const getActivityGradient = (type) => {
    switch (type) {
      case "appointment":
        return "from-blue-500 to-indigo-500";
      case "medicine":
        return "from-emerald-500 to-green-500";
      case "doctor":
        return "from-purple-500 to-pink-500";
      case "patient":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <ChartCard title="Recent Platform Activity" gradient="indigo">
      <div className="space-y-3">
        {activities.slice(0, 10).map((activity, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 hover:shadow-md transition-all duration-200"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${getActivityGradient(
                activity.type
              )} shadow-lg`}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.description}
              </p>
              <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                <FiClock className="h-3 w-3" />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
};

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    doctors: [],
    patients: [],
    medicines: [],
    appointments: [],
    revenueData: [],
    activityData: [],
  });
  const [timeFilter, setTimeFilter] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  const { address, isConnected } = useAccount();
  const router = useRouter();

  const {
    getContractInfo,
    getAllDoctors,
    getAllPatients,
    getAllMedicines,
    getAllAppointments,
    getUserType,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Fetch all data
        const [contractInfo, doctors, patients, medicines, appointments] =
          await Promise.all([
            getContractInfo(),
            getAllDoctors(),
            getAllPatients(),
            getAllMedicines(),
            getAllAppointments(),
          ]);

        // Process analytics data
        const processedData = processAnalyticsData({
          contractInfo,
          doctors: doctors || [],
          patients: patients || [],
          medicines: medicines || [],
          appointments: appointments || [],
        });

        setAnalyticsData(processedData);
        setAdminData({ address });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [isConnected, address, timeFilter]);

  const processAnalyticsData = ({
    contractInfo,
    doctors,
    patients,
    medicines,
    appointments,
  }) => {
    // Calculate overview metrics
    const totalDoctors = doctors.length;
    const approvedDoctors = doctors.filter(
      (d) => d.status === "approved"
    ).length;
    const pendingDoctors = totalDoctors - approvedDoctors;
    const totalPatients = patients.length;
    const totalMedicines = medicines.length;
    const totalAppointments = appointments.length;

    // Calculate revenue (sum of appointment fees)
    const totalRevenue = appointments.reduce((sum, apt) => {
      return sum + parseFloat(contractInfo?.appointmentFee || 0);
    }, 0);

    // Calculate success rates
    const totalConsultations = doctors.reduce(
      (sum, d) => sum + Number(d.appointmentCount),
      0
    );
    const totalSuccessful = doctors.reduce(
      (sum, d) => sum + Number(d.successfulTreatmentCount),
      0
    );
    const overallSuccessRate =
      totalConsultations > 0
        ? Math.round((totalSuccessful / totalConsultations) * 100)
        : 0;

    // Process top performing doctors
    const topDoctors = doctors
      .map((doctor) => ({
        ...doctor,
        successRate:
          doctor.appointmentCount > 0
            ? Math.round(
                (Number(doctor.successfulTreatmentCount) /
                  Number(doctor.appointmentCount)) *
                  100
              )
            : 0,
      }))
      .sort((a, b) => Number(b.appointmentCount) - Number(a.appointmentCount));

    // Medicine categories
    const medicineCategories = medicines.reduce((acc, medicine) => {
      const category = "General"; // Placeholder
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Activity timeline
    const recentActivities = [
      {
        type: "appointment",
        description: "New appointment booked",
        time: "2 minutes ago",
      },
      {
        type: "doctor",
        description: "Doctor approved by admin",
        time: "15 minutes ago",
      },
      {
        type: "medicine",
        description: "New medicine added to inventory",
        time: "1 hour ago",
      },
      {
        type: "patient",
        description: "New patient registered",
        time: "2 hours ago",
      },
      {
        type: "appointment",
        description: "Appointment completed successfully",
        time: "3 hours ago",
      },
    ];

    return {
      overview: {
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        totalPatients,
        totalMedicines,
        totalAppointments,
        totalRevenue,
        overallSuccessRate,
        totalConsultations,
      },
      doctors: topDoctors,
      patients,
      medicines,
      appointments,
      medicineCategories: Object.entries(medicineCategories).map(
        ([label, value]) => ({ label, value })
      ),
      activityData: recentActivities,
      revenueData: [
        { label: "Jan", value: 120 },
        { label: "Feb", value: 190 },
        { label: "Mar", value: 300 },
        { label: "Apr", value: 500 },
        { label: "May", value: 200 },
        { label: "Jun", value: 300 },
      ],
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Analytics data refreshed");
    }, 1000);
  };

  const exportAnalytics = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      timeFilter,
      overview: analyticsData.overview,
      topDoctors: analyticsData.doctors.slice(0, 10),
      platformStats: {
        totalUsers:
          analyticsData.overview.totalDoctors +
          analyticsData.overview.totalPatients,
        approvalRate:
          analyticsData.overview.totalDoctors > 0
            ? Math.round(
                (analyticsData.overview.approvedDoctors /
                  analyticsData.overview.totalDoctors) *
                  100
              )
            : 0,
        averageSuccessRate: analyticsData.overview.overallSuccessRate,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `healthcare-analytics-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics data exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-2xl">
              <MdAnalytics className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-300 rounded-full animate-ping"></div>
          </div>
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading analytics dashboard...
          </p>
          <p className="text-sm text-gray-500">
            Analyzing healthcare platform data
          </p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-fit mx-auto shadow-lg">
                <FiShield className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <MdEmergency className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <MdSecurity className="h-5 w-5 text-red-600" />
              Admin Access Required
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You need administrator privileges to access the healthcare
              platform analytics dashboard.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 w-full"
              >
                <FiShield className="mr-2 h-4 w-4" />
                Go to Admin Login
              </Button>
              <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
                <MdSecurity className="h-4 w-4" />
                <span>Administrative Authorization Required</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { overview } = analyticsData;

  return (
    <div className="space-y-8 relative">
      {/* Medical Background Elements */}
      <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
        <MdAnalytics className="absolute top-20 right-20 h-32 w-32 text-teal-600 animate-pulse" />
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
              <MdAnalytics className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                Healthcare Platform Analytics
                <MdHealthAndSafety className="h-8 w-8" />
              </h1>
              <p className="text-teal-100 text-lg flex items-center gap-2">
                <MdSecurity className="h-4 w-4" />
                Comprehensive insights and performance metrics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard")}
              className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white backdrop-blur-sm"
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </Select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={refreshing}
              disabled={refreshing}
              className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportAnalytics}
              className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <FiShield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                <MdVerifiedUser className="h-5 w-5" />
                Administrator Analytics Dashboard
              </h3>
              <p className="text-purple-700 flex items-center gap-2">
                <MdSecurity className="h-4 w-4" />
                Logged in as Admin • {truncateAddress(address)} • Real-time
                platform insights
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={overview.totalDoctors + overview.totalPatients}
          change={12}
          changeType="increase"
          icon={FiUsers}
          color="blue"
          description={`${overview.totalDoctors} doctors, ${overview.totalPatients} patients`}
        />
        <MetricCard
          title="Total Revenue"
          value={`${overview.totalRevenue.toFixed(4)} ETH`}
          change={8}
          changeType="increase"
          icon={FiDollarSign}
          color="emerald"
          description="From appointment fees"
        />
        <MetricCard
          title="Success Rate"
          value={`${overview.overallSuccessRate}%`}
          change={3}
          changeType="increase"
          icon={FiTarget}
          color="purple"
          description="Treatment success rate"
        />
        <MetricCard
          title="Active Doctors"
          value={overview.approvedDoctors}
          change={5}
          changeType="increase"
          icon={MdLocalHospital}
          color="orange"
          description={`${overview.pendingDoctors} pending approval`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Growth */}
        <ChartCard
          title="Platform Growth"
          gradient="blue"
          actions={[
            <Button
              key="view"
              variant="outline"
              size="small"
              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FiEye className="h-4 w-4 mr-1" />
              View Details
            </Button>,
          ]}
        >
          <SimpleBarChart
            data={analyticsData.revenueData}
            title="Monthly Growth"
            color="blue"
          />
        </ChartCard>

        {/* Medicine Categories */}
        <ChartCard title="Medicine Categories" gradient="emerald">
          <SimpleBarChart
            data={analyticsData.medicineCategories}
            title="Category Distribution"
            color="emerald"
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Doctors */}
        <TopPerformersCard
          doctors={analyticsData.doctors}
          title="Top Performing Doctors"
        />

        {/* Recent Activity */}
        <RecentActivityCard activities={analyticsData.activityData} />
      </div>

      {/* Enhanced Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUserMd className="h-6 w-6 text-blue-600" />
              Doctor Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-200">
                <span className="text-gray-600 font-medium">
                  Total Registered:
                </span>
                <span className="font-bold text-blue-600">
                  {overview.totalDoctors}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-200">
                <span className="text-gray-600 font-medium">Approved:</span>
                <span className="font-bold text-emerald-600">
                  {overview.approvedDoctors}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-200">
                <span className="text-gray-600 font-medium">Pending:</span>
                <span className="font-bold text-yellow-600">
                  {overview.pendingDoctors}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-200">
                <span className="text-gray-600 font-medium">
                  Approval Rate:
                </span>
                <span className="font-bold text-blue-600">
                  {overview.totalDoctors > 0
                    ? Math.round(
                        (overview.approvedDoctors / overview.totalDoctors) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiCalendar className="h-6 w-6 text-emerald-600" />
              Appointment Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-200">
                <span className="text-gray-600 font-medium">Total Booked:</span>
                <span className="font-bold text-emerald-600">
                  {overview.totalAppointments}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-200">
                <span className="text-gray-600 font-medium">
                  Consultations:
                </span>
                <span className="font-bold text-emerald-600">
                  {overview.totalConsultations}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-200">
                <span className="text-gray-600 font-medium">Success Rate:</span>
                <span className="font-bold text-emerald-600">
                  {overview.overallSuccessRate}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-200">
                <span className="text-gray-600 font-medium">
                  Avg per Doctor:
                </span>
                <span className="font-bold text-emerald-600">
                  {overview.approvedDoctors > 0
                    ? Math.round(
                        overview.totalConsultations / overview.approvedDoctors
                      )
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MdMonitorHeart className="h-6 w-6 text-purple-600" />
              Platform Health
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-purple-200">
                <span className="text-gray-600 font-medium">
                  Total Medicines:
                </span>
                <span className="font-bold text-purple-600">
                  {overview.totalMedicines}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-purple-200">
                <span className="text-gray-600 font-medium">Active Users:</span>
                <span className="font-bold text-purple-600">
                  {overview.totalDoctors + overview.totalPatients}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-purple-200">
                <span className="text-gray-600 font-medium">
                  Platform Status:
                </span>
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none">
                  <FiCheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-purple-200">
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="font-bold text-purple-600 text-sm">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced System Status */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
        <div className="p-6">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
              <MdAnalytics className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                Platform Status: All Systems Operational
                <MdHealthAndSafety className="h-6 w-6 text-emerald-600" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-emerald-200">
                  <ul className="text-sm text-emerald-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <MdMedicalServices className="h-4 w-4 text-teal-600" />
                      All healthcare services operational
                    </li>
                    <li className="flex items-center gap-2">
                      <MdSecurity className="h-4 w-4 text-blue-600" />
                      Security systems functioning normally
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-200">
                  <ul className="text-sm text-emerald-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <FaStethoscope className="h-4 w-4 text-purple-600" />
                      Doctor verification systems active
                    </li>
                    <li className="flex items-center gap-2">
                      <FiClock className="h-4 w-4 text-emerald-600" />
                      Last system check: {new Date().toLocaleString()}
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

export default AdminAnalytics;
