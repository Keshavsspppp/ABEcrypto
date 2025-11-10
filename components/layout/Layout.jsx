import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useHealthcareContract } from "../../hooks/useContract";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  MdMonitorHeart,
  MdLocalHospital,
  MdHealthAndSafety,
  MdMedicalServices,
  MdBiotech,
} from "react-icons/md";
import {
  FaStethoscope,
  FaHeartbeat,
  FaUserMd,
  FaHospitalUser,
} from "react-icons/fa";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { getUserType } = useHealthcareContract();

  useEffect(() => {
    const fetchUserType = async () => {
      if (isConnected && address) {
        try {
          const userInfo = await getUserType(address);
          setUserType(userInfo);
        } catch (error) {
          console.error("Error fetching user type:", error);
        }
      }
      setLoading(false);
    };

    fetchUserType();
  }, [isConnected, address, getUserType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden">
        {/* Medical Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-10 w-72 h-72 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-32 left-32 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>

          {/* Floating Medical Icons */}
          <div className="absolute top-20 right-1/4 opacity-5 animate-float">
            <FaStethoscope className="h-24 w-24 text-emerald-600" />
          </div>
          <div className="absolute bottom-20 left-1/4 opacity-5 animate-float animation-delay-3000">
            <FaHeartbeat className="h-20 w-20 text-teal-600" />
          </div>
          <div className="absolute top-1/2 right-20 opacity-5 animate-float animation-delay-1000">
            <MdLocalHospital className="h-28 w-28 text-cyan-600" />
          </div>
          <div className="absolute bottom-1/3 right-1/3 opacity-5 animate-float animation-delay-5000">
            <FaUserMd className="h-16 w-16 text-emerald-600" />
          </div>
        </div>

        <div className="text-center relative z-10">
          {/* Enhanced Loading Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative p-6 bg-white rounded-full shadow-2xl border-4 border-emerald-100">
              <div className="relative">
                <MdMonitorHeart className="h-12 w-12 text-emerald-600 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Orbiting Medical Icons */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <FaStethoscope className="h-6 w-6 text-emerald-500 opacity-60" />
              </div>
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
                <FaHeartbeat className="h-6 w-6 text-teal-500 opacity-60" />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <MdMedicalServices className="h-6 w-6 text-cyan-500 opacity-60" />
              </div>
              <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
                <MdHealthAndSafety className="h-6 w-6 text-blue-500 opacity-60" />
              </div>
            </div>
          </div>

          <LoadingSpinner size="large" />

          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <MdLocalHospital className="h-6 w-6 text-emerald-600" />
              Loading HealthChain
            </h3>
            <p className="text-gray-600 font-medium">
              Connecting to blockchain network...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <MdBiotech className="h-4 w-4 text-emerald-500 animate-spin" />
              <span>Securing your medical data</span>
            </div>
          </div>

          {/* Loading Progress Indicator */}
          <div className="mt-8 w-64 mx-auto">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full animate-pulse w-3/4 transition-all duration-1000"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Initializing healthcare platform...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 relative overflow-hidden">
      {/* Modern Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-20">
          <FaStethoscope className="h-20 w-20 text-emerald-600" />
        </div>
        <div className="absolute bottom-20 right-20">
          <MdLocalHospital className="h-24 w-24 text-teal-600" />
        </div>
        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <FaHeartbeat className="h-16 w-16 text-cyan-600" />
        </div>
        <div className="absolute top-1/3 right-1/3">
          <FaUserMd className="h-18 w-18 text-emerald-600" />
        </div>
        <div className="absolute bottom-1/3 left-1/3">
          <FaHospitalUser className="h-14 w-14 text-teal-600" />
        </div>
      </div>
      
      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-50/20 to-transparent pointer-events-none"></div>

      {/* Enhanced Sidebar */}
      <div className="relative z-10">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userType={userType}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Enhanced Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} userType={userType} />

        {/* Main content with modern styling */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white/80 backdrop-blur-sm relative">
          {/* Modern Content Background Effects */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-3xl"></div>
          </div>

          {/* Modern Container */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
            {/* Content Area with Modern Styling */}
            <div className="relative animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Medical Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4">
              <FaStethoscope className="h-16 w-16 text-white animate-pulse" />
            </div>
            <div className="absolute bottom-1/4 right-1/4">
              <FaHeartbeat className="h-12 w-12 text-white animate-pulse animation-delay-2000" />
            </div>
          </div>
        </div>
      )}

      {/* Medical Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        {isConnected && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Connected</span>
            <MdHealthAndSafety className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced CSS animations for medical theme
const medicalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 10s linear infinite;
  }
  
  .animation-delay-1000 {
    animation-delay: 1s;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-3000 {
    animation-delay: 3s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  
  .animation-delay-5000 {
    animation-delay: 5s;
  }
  
  /* Medical gradient backgrounds */
  .bg-emerald-25 {
    background-color: rgba(16, 185, 129, 0.025);
  }
  
  .bg-teal-25 {
    background-color: rgba(20, 184, 166, 0.025);
  }
  
  /* Enhanced backdrop blur for medical theme */
  .backdrop-blur-medical {
    backdrop-filter: blur(8px) saturate(120%) brightness(110%);
  }
`;

export default Layout;
