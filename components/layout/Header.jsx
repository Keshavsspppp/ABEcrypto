import { useState, useEffect, useCallback, useMemo } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient } from "wagmi";
import {
  FiMenu,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiHeart,
  FiActivity,
  FiShield,
  FiWifi,
  FiClock,
} from "react-icons/fi";
import {
  MdLocalHospital,
  MdAdminPanelSettings,
  MdHealthAndSafety,
  MdNotifications,
  MdMedicalServices,
  MdEmergency,
  MdVerifiedUser,
  MdMonitorHeart,
  MdLocalPharmacy,
  MdBiotech,
  MdSecurityUpdate,
} from "react-icons/md";
import {
  FaStethoscope,
  FaUserMd,
  FaHospitalUser,
  FaHeartbeat,
  FaPrescriptionBottleAlt,
  FaAmbulance,
  FaNotesMedical,
  FaSyringe,
} from "react-icons/fa";
import { useHealthcareContract } from "../../hooks/useContract";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../config/contract";
import { formatTime } from "../../utils/helpers";
import CustomConnectButton from "../layout/CustomConnectButton";

const Header = ({ onMenuClick, userType }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenNotificationId, setLastSeenNotificationId] = useState(-1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { getNotifications } = useHealthcareContract();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("medichain_last_seen_notification_id");
    const storedId = Number(raw);
    if (!Number.isNaN(storedId)) {
      setLastSeenNotificationId(storedId);
    } else {
      setLastSeenNotificationId(-1);
    }
  }, []);

  const getNotificationIdentifier = useCallback((notification) => {
    if (!notification) return 0;
    if (notification.id !== undefined && notification.id !== null) {
      return Number(notification.id);
    }
    if (notification.timestamp) {
      return Number(notification.timestamp);
    }
    return 0;
  }, []);

  const markNotificationsAsRead = useCallback(
    (latestNotifications = []) => {
      if (!latestNotifications.length) {
        setUnreadCount(0);
        return;
      }

      const latestId = Math.max(
        lastSeenNotificationId ?? -1,
        ...latestNotifications.map((notification) =>
          getNotificationIdentifier(notification)
        )
      );

      setLastSeenNotificationId(latestId);
      setUnreadCount(0);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "medichain_last_seen_notification_id",
          String(latestId)
        );
      }
    },
    [getNotificationIdentifier, lastSeenNotificationId]
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isConnected && address) {
        try {
          const userNotifications = await getNotifications(address);
          const latestNotifications = userNotifications.slice(-5);
          setNotifications(latestNotifications); // Get latest 5 notifications

          if (showNotifications) {
            markNotificationsAsRead(latestNotifications);
          } else {
            const unseen = latestNotifications.filter(
              (notification) =>
                getNotificationIdentifier(notification) >
                (lastSeenNotificationId ?? -1)
            ).length;
            setUnreadCount(unseen);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [
    isConnected,
    address,
    getNotifications,
    getNotificationIdentifier,
    lastSeenNotificationId,
    markNotificationsAsRead,
    showNotifications,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Real-time notification updates via on-chain event subscription
  useEffect(() => {
    if (!publicClient || !isConnected || !address) return;

    const unwatch = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: "NOTIFICATiON_SENT",
      onLogs: async (logs) => {
        try {
          for (const log of logs) {
            const args = log?.args || {};
            const user = args.user || args[0];
            if (user && String(user).toLowerCase() === String(address).toLowerCase()) {
              const userNotifications = await getNotifications(address);
              const latestNotifications = userNotifications.slice(-5);
              setNotifications(latestNotifications);
              // Increment unread only if dropdown is closed
              setUnreadCount((prev) => (showNotifications ? 0 : prev + 1));
            }
          }
        } catch (e) {
          console.error("Error handling NOTIFICATiON_SENT logs:", e);
        }
      },
    });

    return () => {
      try {
        unwatch?.();
      } catch {}
    };
  }, [publicClient, isConnected, address, getNotifications, showNotifications]);

  const getUserRole = () => {
    if (!userType) return "Guest";
    return userType.userType || "User";
  };

  const getRoleIcon = () => {
    const role = getUserRole();
    switch (role.toLowerCase()) {
      case "admin":
        return <MdAdminPanelSettings className="w-5 h-5" />;
      case "doctor":
        return <FaUserMd className="w-5 h-5" />;
      case "patient":
        return <FaHospitalUser className="w-5 h-5" />;
      default:
        return <FiUser className="w-5 h-5" />;
    }
  };

  const getRoleBadgeColor = () => {
    const role = getUserRole();
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200";
      case "doctor":
        return "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border-teal-200";
      case "patient":
        return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200";
      default:
        return "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200";
    }
  };

  const currentTimeDisplay = useMemo(
    () =>
      currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [currentTime]
  );

  const currentDateDisplay = useMemo(
    () =>
      currentTime.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "2-digit",
      }),
    [currentTime]
  );

  const getNotificationIcon = (categoryType) => {
    switch (categoryType) {
      case "Medicine":
        return <FaPrescriptionBottleAlt className="w-4 h-4" />;
      case "Doctor":
        return <FaUserMd className="w-4 h-4" />;
      case "Patient":
        return <FaHospitalUser className="w-4 h-4" />;
      case "Appointment":
        return <FaStethoscope className="w-4 h-4" />;
      case "Emergency":
        return <MdEmergency className="w-4 h-4" />;
      default:
        return <MdNotifications className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (categoryType) => {
    switch (categoryType) {
      case "Medicine":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200";
      case "Doctor":
        return "bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border-teal-200";
      case "Patient":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
      case "Appointment":
        return "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200";
      case "Emergency":
        return "bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (!showNotifications && notifications.length) {
      markNotificationsAsRead(notifications);
    }
  };

  return (
    <header className="relative bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-30 transition-all duration-300">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-16 -right-8 w-52 h-52 bg-gradient-to-br from-emerald-200/60 via-cyan-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-10 w-64 h-64 bg-gradient-to-br from-indigo-200/70 via-purple-100/40 to-transparent rounded-full blur-[90px]"></div>
      </div>
      <div className="accent-divider relative z-10"></div>

      <div className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2.5 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 lg:hidden transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            {/* Logo */}
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex items-center space-x-3">
                <div className="relative p-2.5 bg-gradient-to-br from-brand-500 via-purple-600 to-accent-500 rounded-2xl shadow-elevated hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105">
                  <MdLocalHospital className="h-6 w-6 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-2">
                    MediChain
                    <MdBiotech className="h-5 w-5 text-brand-600" />
                  </h1>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <MdSecurityUpdate className="h-3 w-3 text-brand-500" />
                    Decentralized Platform
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center section - Time & Status */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-5 py-2 bg-white/75 rounded-2xl border border-emerald-100 shadow-sm backdrop-blur">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FiClock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Live Time
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {currentTimeDisplay}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-xs font-semibold text-slate-500">
                {currentDateDisplay}
              </div>
            </div>

            {isConnected && (
              <div className="flex items-center space-x-3 px-5 py-2 bg-white/75 rounded-2xl border border-teal-100 shadow-sm backdrop-blur">
                <div className="p-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 animate-pulse shadow-inner"></div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                    Network
                  </p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                    <MdHealthAndSafety className="h-4 w-4 text-teal-500" />
                    Secure
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right section - Enhanced */}
          <div className="flex items-center space-x-3">
            {/* Modern User Role Badge */}
            {isConnected && userType && (
              <div
                className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center space-x-2 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 ${getRoleBadgeColor()}`}
              >
                <div className="p-1.5 bg-white/80 rounded-lg backdrop-blur-sm">
                  {getRoleIcon()}
                </div>
                <span className="font-bold">{getUserRole()}</span>
                <MdVerifiedUser className="w-4 h-4" />
              </div>
            )}

            {/* Enhanced Notifications */}
            {isConnected && (
              <div className="relative z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleNotifications();
                  }}
                  className="relative p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  <MdNotifications className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <div className="relative">
                        <span className="flex h-5 w-5 items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full font-bold shadow-lg">
                          {unreadCount}
                        </span>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      </div>
                    </div>
                  )}
                </button>

                {/* Modern Notifications dropdown */}
                {showNotifications && (
                  <div 
                    className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-[100]"
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      animation: 'fadeIn 0.2s ease-in-out',
                      transform: 'translateY(0)',
                      opacity: 1
                    }}
                  >
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-t-2xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <MdNotifications className="h-5 w-5 text-emerald-600" />
                          Medical Notifications
                        </h3>
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FaHeartbeat className="h-4 w-4 text-emerald-600 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-25 hover:to-teal-25 transition-all duration-200"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
                                {getNotificationIcon(notification.categoryType)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full border font-medium flex items-center gap-1 ${getNotificationColor(
                                      notification.categoryType
                                    )}`}
                                  >
                                    {getNotificationIcon(
                                      notification.categoryType
                                    )}
                                    {notification.categoryType}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <FiClock className="h-3 w-3" />
                                    {formatTime(notification.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <div className="p-4 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl mb-4 w-fit mx-auto">
                            <MdNotifications className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            No notifications yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Medical updates will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Profile dropdown */}
            {isConnected && (
              <div className="relative z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfile(!showProfile);
                  }}
                  className="relative p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  <div className="relative">
                    <FiUser className="h-6 w-6" />
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                </button>

                {/* Modern Profile dropdown */}
                {showProfile && (
                  <div 
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-[100]"
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      animation: 'fadeIn 0.2s ease-in-out',
                      transform: 'translateY(0)',
                      opacity: 1
                    }}
                  >
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-t-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                          {getRoleIcon()}
                          <div className="text-white"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            {userType?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <MdHealthAndSafety className="h-3 w-3" />
                            {getUserRole()} Account
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-white bg-opacity-70 rounded-lg">
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <FiWifi className="h-3 w-3" />
                          {address}
                        </p>
                      </div>
                    </div>
                    <div className="py-2">
                      <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-emerald-25 hover:to-teal-25 flex items-center space-x-3 transition-all duration-200">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiUser className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span>Medical Profile</span>
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-teal-25 hover:to-cyan-25 flex items-center space-x-3 transition-all duration-200">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <FiSettings className="w-4 h-4 text-teal-600" />
                        </div>
                        <span>Healthcare Settings</span>
                      </button>
                      <div className="border-t border-emerald-100 mt-2 pt-2">
                        <button className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-25 hover:to-pink-25 flex items-center space-x-3 transition-all duration-200">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <FiLogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Wallet Connect Button */}
            <div className="ml-2">
              <div className="relative">
                <CustomConnectButton />
                {isConnected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border border-white"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-[90] bg-black bg-opacity-20 backdrop-blur-sm"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
