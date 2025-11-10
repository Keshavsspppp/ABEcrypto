import { useEffect } from "react";
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

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Check if user is registered and has admin role
        const userInfo = await getUserType(address);
        const contractInfo = await getContractInfo();

        const isAdmin =
          contractInfo &&
          address &&
          address.toLowerCase() === contractInfo.admin?.toLowerCase();
      } catch (error) {
        console.error("Error checking admin access:", error);
        router.push("/");
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

  return <AdminDashboard />;
}
