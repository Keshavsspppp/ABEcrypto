import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import AdminDashboard from "../../components/admin/AdminDashboard";
import { useHealthcareContract } from "../../hooks/useContract";
import { Card } from "../../components/common";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { MdAdminPanelSettings } from "react-icons/md";

export default function AdminDashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { getContractInfo, getUserType } = useHealthcareContract();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isConnected || !address) {
        setIsChecking(false);
        return;
      }

      // Check if user is the owner/admin via environment variable FIRST - before any async calls
      const ownerAddress = process.env.NEXT_PUBLIC_OWNER_ADDRESS;
      if (ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase()) {
        // Owner address matches, allow access - don't redirect, don't check contract
        console.log("Owner address detected, allowing admin access");
        setHasAccess(true);
        setIsChecking(false);
        return; // Exit early, no need to check contract
      }

      // Only check contract if not owner
      try {
        // Check if user is registered and has admin role via contract
        const contractInfo = await getContractInfo();
        const isAdmin =
          contractInfo &&
          address &&
          address.toLowerCase() === contractInfo.admin?.toLowerCase();

        if (isAdmin) {
          setHasAccess(true);
        } else {
          // Not admin and not owner, just deny access - don't redirect
          console.log("Not admin, access denied");
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        // Error occurred and already confirmed not owner (check above), just deny access
        console.log("Error occurred and not owner, access denied");
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [isConnected, address, router, getContractInfo, getUserType]);

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <div className="text-center py-8">
            <MdAdminPanelSettings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Access Denied
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Please connect your wallet to access the admin dashboard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (hasAccess || (isConnected && address)) {
    // Check owner again before rendering to be safe
    const ownerAddress = process.env.NEXT_PUBLIC_OWNER_ADDRESS;
    if (ownerAddress && address?.toLowerCase() === ownerAddress.toLowerCase()) {
      return <AdminDashboard />;
    }
    
    if (hasAccess) {
      return <AdminDashboard />;
    }
  }

  // Fallback - should not reach here if owner
  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <div className="text-center py-8">
          <MdAdminPanelSettings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            You do not have permission to access the admin dashboard.
          </p>
        </div>
      </Card>
    </div>
  );
}
