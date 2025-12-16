import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiShoppingBag,
  FiActivity,
  FiFileText,
  FiMessageSquare,
  FiSettings,
  FiHeart,
  FiPlusCircle,
  FiList,
  FiUserPlus,
  FiX,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdAdminPanelSettings,
  MdMedicalServices,
  MdHealthAndSafety,
  MdMonitorHeart,
  MdLocalPharmacy,
  MdBiotech,
  MdVerifiedUser,
  MdEmergency,
  MdVaccines,
  MdPersonalInjury,
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
} from "react-icons/fa";

const Sidebar = ({ isOpen, onClose, userType }) => {
  const router = useRouter();
  const { isConnected } = useAccount();

  const getUserRole = () => {
    if (!userType) return "guest";
    return userType.userType?.toLowerCase() || "guest";
  };

  const navigation = {
    guest: [
      { name: "Home", href: "/", icon: FiHome, color: "emerald" },
      {
        name: "Register as Doctor",
        href: "/doctor/register",
        icon: FaUserMd,
        color: "teal",
      },
      {
        name: "Register as Patient",
        href: "/patient/register",
        icon: FaHospitalUser,
        color: "cyan",
      },
      {
        name: "View Medicines",
        href: "/medicines",
        icon: FaPrescriptionBottleAlt,
        color: "blue",
      },
      {
        name: "Find Doctors",
        href: "/doctors",
        icon: FaStethoscope,
        color: "indigo",
      },
    ],
    admin: [
      {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: MdMonitorHeart,
        color: "emerald",
      },
      {
        name: "Manage Medicines",
        href: "/admin/medicines",
        icon: MdLocalPharmacy,
        color: "blue",
      },
      {
        name: "Manage Doctors",
        href: "/admin/doctors",
        icon: FaUserMd,
        color: "teal",
      },
      {
        name: "View Patients",
        href: "/admin/patients",
        icon: FaHospitalUser,
        color: "cyan",
      },
      {
        name: "All Appointments",
        href: "/admin/appointments",
        icon: FaStethoscope,
        color: "purple",
      },
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: FiTrendingUp,
        color: "pink",
      },
      {
        name: "Settings",
        href: "/admin/settings",
        icon: FiSettings,
        color: "gray",
      },
      {
        name: "Messages",
        href: "/chat",
        icon: FiMessageSquare,
        color: "orange",
      },
    ],
    doctor: [
      {
        name: "Dashboard",
        href: "/doctor/dashboard",
        icon: MdMonitorHeart,
        color: "emerald",
      },
      {
        name: "My Appointments",
        href: "/doctor/appointments",
        icon: FaStethoscope,
        color: "teal",
      },
      {
        name: "Patients List",
        href: "/doctor/patients",
        icon: FaHospitalUser,
        color: "cyan",
      },
      {
        name: "Prescribe Medicine",
        href: "/doctor/prescribe",
        icon: FaPrescriptionBottleAlt,
        color: "blue",
      },
      {
        name: "Medical Records",
        href: "/doctor/records",
        icon: FaNotesMedical,
        color: "indigo",
      },
      {
        name: "Messages",
        href: "/chat",
        icon: FiMessageSquare,
        color: "purple",
      },
      {
        name: "Profile",
        href: "/doctor/profile",
        icon: FiSettings,
        color: "gray",
      },
    ],
    patient: [
      {
        name: "Dashboard",
        href: "/patient/dashboard",
        icon: MdMonitorHeart,
        color: "emerald",
      },
      {
        name: "Book Appointment",
        href: "/patient/appointment",
        icon: FaStethoscope,
        color: "teal",
      },
      {
        name: "Buy Medicine",
        href: "/patient/medicines",
        icon: FaPrescriptionBottleAlt,
        color: "cyan",
      },
      {
        name: "Medical History",
        href: "/patient/history",
        icon: FaNotesMedical,
        color: "blue",
      },
      {
        name: "My Prescriptions",
        href: "/patient/prescriptions",
        icon: FaSyringe,
        color: "indigo",
      },
      {
        name: "My Orders",
        href: "/patient/orders",
        icon: FiShoppingBag,
        color: "purple",
      },
      {
        name: "Messages",
        href: "/chat",
        icon: FiMessageSquare,
        color: "pink",
      },
      {
        name: "Profile",
        href: "/patient/profile",
        icon: FiSettings,
        color: "gray",
      },
    ],
  };

  const currentRole = getUserRole();
  const menuItems = navigation[currentRole] || navigation.guest;

  const handleNavigation = (href) => {
    router.push(href);
    onClose();
  };

  const isActivePath = (href) => {
    return router.pathname === href;
  };

  const getRoleDisplayName = () => {
    switch (currentRole) {
      case "admin":
        return "Administrator";
      case "doctor":
        return "Medical Doctor";
      case "patient":
        return "Patient";
      default:
        return "Guest User";
    }
  };

  const getRoleIcon = () => {
    switch (currentRole) {
      case "admin":
        return <MdAdminPanelSettings className="w-6 h-6" />;
      case "doctor":
        return <FaUserMd className="w-6 h-6" />;
      case "patient":
        return <FaHospitalUser className="w-6 h-6" />;
      default:
        return <FiUsers className="w-6 h-6" />;
    }
  };

  const getRoleColor = () => {
    switch (currentRole) {
      case "admin":
        return "from-rose-500 to-red-500";
      case "doctor":
        return "from-brand-500 to-purple-600";
      case "patient":
        return "from-accent-500 to-sky-500";
      default:
        return "from-brand-500 to-purple-600";
    }
  };

  const getColorClasses = (color, isActive = false) => {
    if (isActive) {
      const activeColors = {
        emerald:
          "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-r-4 border-emerald-500",
        teal: "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border-r-4 border-teal-500",
        cyan: "bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border-r-4 border-cyan-500",
        blue: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-4 border-blue-500",
        indigo:
          "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-r-4 border-indigo-500",
        purple:
          "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-r-4 border-purple-500",
        pink: "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border-r-4 border-pink-500",
        orange:
          "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-r-4 border-orange-500",
        gray: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-r-4 border-gray-500",
      };
      return activeColors[color] || activeColors.emerald;
    } else {
      return "text-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700";
    }
  };

  const getIconColor = (color, isActive = false) => {
    if (isActive) {
      const iconColors = {
        emerald: "text-emerald-600",
        teal: "text-teal-600",
        cyan: "text-cyan-600",
        blue: "text-blue-600",
        indigo: "text-indigo-600",
        purple: "text-purple-600",
        pink: "text-pink-600",
        orange: "text-orange-600",
        gray: "text-gray-600",
      };
      return iconColors[color] || iconColors.emerald;
    } else {
      return "text-gray-400 group-hover:text-emerald-500";
    }
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-2xl shadow-2xl transform ${
          isOpen ? "translate-x-0" : "-translate-x-full "
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-slate-200/60 relative overflow-hidden`}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-24 -right-10 w-56 h-56 bg-gradient-to-br from-emerald-200/60 via-cyan-100/40 to-transparent rounded-full blur-[90px]" />
          <div className="absolute bottom-10 -left-24 w-72 h-72 bg-gradient-to-br from-indigo-200/60 via-purple-100/30 to-transparent rounded-full blur-[110px]" />
        </div>

        <div
          className={`flex items-center justify-between h-20 px-6 bg-gradient-to-br ${getRoleColor()} relative overflow-hidden shadow-lg`}
        >
          {/* Medical background pattern */}
          <div className="absolute inset-0 opacity-10">
            <FaHeartbeat className="absolute top-2 right-4 h-8 w-8 text-white animate-pulse" />
            <FaStethoscope className="absolute bottom-2 left-4 h-6 w-6 text-white" />
          </div>

          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-2 bg-white bg-opacity-25 rounded-xl backdrop-blur-sm border border-white border-opacity-30">
              <div className="relative">
                <MdLocalHospital className="h-8 w-8 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">MediChain</h2>
              <p className="text-xs text-white text-opacity-90 flex items-center gap-1">
                <MdBiotech className="h-3 w-3" />
                Medical DApp Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-20 lg:hidden transition-all duration-200 backdrop-blur-sm"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Modern User role indicator */}
        {isConnected && userType && (
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border-b border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 bg-gradient-to-r ${getRoleColor()} rounded-xl shadow-lg relative`}
              >
                <div className="text-white">{getRoleIcon()}</div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white">
                  <MdVerifiedUser className="h-2 w-2 text-white m-0.5" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {userType.name}
                  <MdHealthAndSafety className="h-4 w-4 text-emerald-600" />
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {getRoleDisplayName()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 font-medium">
                    Verified Account
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
          {menuItems.map((item, index) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`group w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl border border-transparent transition-all duration-300 ease-out transform hover:scale-[1.015] active:scale-100 ${getColorClasses(
                item.color,
                isActivePath(item.href)
              )}`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300 group-hover:scale-110 ${
                isActivePath(item.href) 
                  ? "bg-white/80 shadow-lg ring-2 ring-white/50" 
                  : "bg-white/50 group-hover:bg-white/80"
              }`}>
                <item.icon
                  className={`h-5 w-5 ${getIconColor(
                    item.color,
                    isActivePath(item.href)
                  )}`}
                />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium block">{item.name}</span>
                {!isActivePath(item.href) && (
                  <span className="text-[11px] text-gray-400 group-hover:text-emerald-500 transition">
                    {index % 2 === 0 ? "Secure access" : "Medical data"}
                  </span>
                )}
              </div>
              {isActivePath(item.href) && (
                <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse shadow-sm"></div>
              )}
            </button>
          ))}
        </nav>

        

        {/* Modern Quick actions footer */}
        <div className="px-4 py-4 border-t border-gray-200/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/40 backdrop-blur-lg relative z-10">
          {currentRole === "guest" && (
            <div className="space-y-3">
              <button
                onClick={() => handleNavigation("/doctor/register")}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <FaUserMd className="mr-2 h-5 w-5" />
                Join as Doctor
                <MdMedicalServices className="ml-2 h-4 w-4" />
              </button>
              <button
                onClick={() => handleNavigation("/patient/register")}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-teal-600 bg-white border-2 border-teal-200 rounded-xl hover:bg-teal-50 transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                <FaHospitalUser className="mr-2 h-5 w-5" />
                Join as Patient
                <FaHeartbeat className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}

          {currentRole === "admin" && (
            <button
              onClick={() => handleNavigation("/admin/medicines/add")}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <MdLocalPharmacy className="mr-2 h-5 w-5" />
              Add Medicine
              <FiPlusCircle className="ml-2 h-4 w-4" />
            </button>
          )}

          {currentRole === "doctor" && (
            <button
              onClick={() => handleNavigation("/doctor/prescribe")}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaPrescriptionBottleAlt className="mr-2 h-5 w-5" />
              Quick Prescribe
              <FaSyringe className="ml-2 h-4 w-4" />
            </button>
          )}

          {currentRole === "patient" && (
            <button
              onClick={() => handleNavigation("/patient/appointment")}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaStethoscope className="mr-2 h-5 w-5" />
              Book Appointment
              <FaAmbulance className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>

        {/* Modern Connection status */}
        <div className="px-4 py-3 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-emerald-50/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  isConnected
                    ? "bg-gradient-to-r from-emerald-500 to-green-500"
                    : "bg-gradient-to-r from-red-500 to-pink-500"
                }`}
              >
                {isConnected ? (
                  <MdHealthAndSafety className="h-4 w-4 text-white" />
                ) : (
                  <MdEmergency className="h-4 w-4 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-red-400 animate-ping"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isConnected ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {isConnected ? "Blockchain Connected" : "Connection Lost"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FiShield className="h-3 w-3" />
                  {isConnected ? "Secure & Encrypted" : "Reconnecting..."}
                </p>
              </div>
            </div>
            {isConnected && (
              <div className="text-emerald-600">
                <FaHeartbeat className="h-4 w-4 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
