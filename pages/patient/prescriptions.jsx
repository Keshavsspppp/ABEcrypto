import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { 
  FaPrescriptionBottleAlt, 
  FaPills, 
  FaUserMd,
  FaCalendarAlt,
  FaFilePrescription
} from "react-icons/fa";
import { 
  MdLocalPharmacy, 
  MdMedication,
  MdHealthAndSafety 
} from "react-icons/md";
import { 
  FiDownload, 
  FiSearch, 
  FiFilter,
  FiClock,
  FiCheck,
  FiAlertCircle
} from "react-icons/fi";
import { Button, Card, Badge, Input, Select } from "../../components/common";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PatientLayout from "../../components/layout/PatientLayout";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import toast from "react-hot-toast";

const safeNumberConversion = (value) => {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'object' && value !== null && typeof value.toString === 'function') {
    return Number(value.toString());
  }
  return Number(value);
};

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const PrescriptionCard = ({ prescription, doctor, medicine, onViewDetails }) => {
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMedicineData = async () => {
      if (medicine?.IPFS_URL) {
        setLoading(true);
        try {
          const data = await ipfsService.fetchFromIPFS(medicine.IPFS_URL);
          setMedicineData(data);
        } catch (error) {
          console.error("Error fetching medicine data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMedicineData();
  }, [medicine?.IPFS_URL]);

  const calculatePrice = () => {
    if (!medicine) return 0;
    const price = safeNumberConversion(medicine.price);
    const discount = safeNumberConversion(medicine.discount);
    return price - (price * discount / 100);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaPrescriptionBottleAlt className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">
                Prescription #{safeNumberConversion(prescription.id)}
              </h4>
              <p className="text-sm text-gray-600">
                {formatDate(safeNumberConversion(prescription.date))}
              </p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white">
            <FiCheck className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        {/* Medicine Information */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <FaPills className="h-5 w-5 text-purple-600" />
            <h5 className="font-semibold text-gray-900">Medicine Details</h5>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="small" />
            </div>
          ) : medicineData ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold text-gray-800">
                  {medicineData.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-800">
                  {medicineData.category || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dosage:</span>
                <span className="font-medium text-gray-800">
                  {medicineData.dosage || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-purple-600">
                  {calculatePrice().toFixed(4)} ETH
                </span>
              </div>
              {medicine && safeNumberConversion(medicine.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <Badge className="bg-red-500 text-white">
                    {safeNumberConversion(medicine.discount)}% OFF
                  </Badge>
                </div>
              )}
              {medicineData.description && (
                <div className="pt-2 border-t border-purple-200">
                  <span className="text-gray-600">Description:</span>
                  <p className="text-gray-800 mt-1">
                    {medicineData.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Medicine details not available</p>
          )}
        </div>

        {/* Doctor Information */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <FaUserMd className="h-5 w-5 text-blue-600" />
            <h5 className="font-semibold text-gray-900">Prescribed By</h5>
          </div>
          {doctor ? (
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                Dr. {doctor.name || `Doctor #${safeNumberConversion(doctor.id)}`}
              </p>
              <p className="text-gray-600">
                {doctor.specialization || "General Practice"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Doctor information not available</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewDetails(prescription)}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <FiAlertCircle className="h-4 w-4 mr-2" />
            View Full Details
          </Button>
          <Button
            onClick={() => {
              // Navigate to buy medicine page
              window.location.href = `/patient/buy-medicine?medicineId=${safeNumberConversion(prescription.medicineId)}`;
            }}
            variant="outline"
            className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <MdLocalPharmacy className="h-4 w-4 mr-2" />
            Buy Medicine
          </Button>
        </div>
      </div>
    </Card>
  );
};

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    getPatientId,
    getPatientPrescriptions,
    getAllDoctors,
    getAllMedicines,
    getDoctorDetails,
    getUserType,
  } = useHealthcareContract();

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address) {
        router.push("/patient/register");
        return;
      }

      try {
        setLoading(true);

        // Verify user is a patient
        const userInfo = await getUserType(address);
        if (!userInfo || userInfo.userType !== "patient") {
          router.push("/patient/register");
          return;
        }

        // Get patient ID
        const patientIdValue = await getPatientId(address);
        if (!patientIdValue) {
          router.push("/patient/register");
          return;
        }
        const patientIdNumber = safeNumberConversion(patientIdValue);
        setPatientId(patientIdNumber);

        // Fetch data
        const [patientPrescriptions, allDoctors, allMedicines] = await Promise.all([
          getPatientPrescriptions(patientIdNumber).catch(() => []),
          getAllDoctors().catch(() => []),
          getAllMedicines().catch(() => []),
        ]);

        // Process prescriptions
        const processedPrescriptions = (patientPrescriptions || []).map((prescription) => ({
          ...prescription,
          id: safeNumberConversion(prescription.id),
          medicineId: safeNumberConversion(prescription.medicineId),
          doctorId: safeNumberConversion(prescription.doctorId),
          patientId: safeNumberConversion(prescription.patientId),
          date: safeNumberConversion(prescription.date),
        }));

        // Process doctors
        const processedDoctors = (allDoctors || []).map((doctor) => ({
          ...doctor,
          id: safeNumberConversion(doctor.id),
        }));

        // Fetch doctor profiles from IPFS
        const doctorsWithProfiles = await Promise.all(
          processedDoctors.map(async (doctor) => {
            try {
              if (doctor.IPFS_URL) {
                const profile = await ipfsService.fetchFromIPFS(doctor.IPFS_URL);
                return { ...doctor, ...profile };
              }
              return doctor;
            } catch (error) {
              console.error(`Error fetching doctor ${doctor.id} profile:`, error);
              return doctor;
            }
          })
        );

        // Process medicines
        const processedMedicines = (allMedicines || []).map((medicine) => ({
          ...medicine,
          id: safeNumberConversion(medicine.id),
          price: safeNumberConversion(medicine.price),
          quantity: safeNumberConversion(medicine.quantity),
          discount: safeNumberConversion(medicine.discount),
        }));

        setPrescriptions(processedPrescriptions);
        setDoctors(doctorsWithProfiles);
        setMedicines(processedMedicines);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        toast.error("Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address, router]);

  const handleViewDetails = (prescription) => {
    toast.success("Viewing prescription details");
    // You can open a modal or navigate to a detailed page
  };

  const getDoctorById = (doctorId) => {
    return doctors.find((d) => d.id === doctorId);
  };

  const getMedicineById = (medicineId) => {
    return medicines.find((m) => m.id === medicineId);
  };

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const medicine = getMedicineById(prescription.medicineId);
    const doctor = getDoctorById(prescription.doctorId);

    const matchesSearch =
      searchTerm === "" ||
      medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDoctor =
      doctorFilter === "" || prescription.doctorId.toString() === doctorFilter;

    return matchesSearch && matchesDoctor;
  });

  const uniqueDoctors = Array.from(
    new Set(prescriptions.map((p) => p.doctorId))
  ).map((id) => getDoctorById(id));

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FaPrescriptionBottleAlt className="h-8 w-8" />
                My Prescriptions
              </h1>
              <p className="text-purple-100 text-lg">
                View and manage your prescribed medications
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{prescriptions.length}</div>
              <div className="text-sm text-purple-100">Total Prescriptions</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <MdHealthAndSafety className="h-6 w-6 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Prescription Information</p>
              <p>
                All prescriptions are securely stored on the blockchain. Click "Buy Medicine" 
                to purchase prescribed medications directly from our pharmacy.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-6 bg-white">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiFilter className="h-5 w-5" />
            Filter Prescriptions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Medicine or Doctor
              </label>
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<FiSearch className="h-4 w-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Doctor
              </label>
              <Select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
              >
                <option value="">All Doctors</option>
                {uniqueDoctors.map((doctor) => (
                  doctor && (
                    <option key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.name || `Doctor #${doctor.id}`}
                    </option>
                  )
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setDoctorFilter("");
                }}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
            <FaPrescriptionBottleAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Prescriptions Found
            </h3>
            <p className="text-gray-600 mb-6">
              {prescriptions.length === 0
                ? "You don't have any prescriptions yet."
                : "No prescriptions match your filter criteria."}
            </p>
            {prescriptions.length > 0 && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setDoctorFilter("");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                doctor={getDoctorById(prescription.doctorId)}
                medicine={getMedicineById(prescription.medicineId)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default PrescriptionsPage;