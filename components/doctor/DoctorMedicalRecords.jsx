import { FiSearch, FiArrowLeft, FiRefreshCw, FiShield, FiX } from "react-icons/fi";
import { FaUserInjured, FaNotesMedical, FaStethoscope, FaHospitalUser, FaPrescriptionBottleAlt } from "react-icons/fa";
import { MdHealthAndSafety, MdHistory, MdVerifiedUser, MdSecurity, MdBiotech } from "react-icons/md";
import { Button, Card, Input, Select, Badge } from "../common";
import LoadingSpinner from "../common/LoadingSpinner";
import DoctorMedicalRecordAccess from "./DoctorMedicalRecordAccess";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import toast from "react-hot-toast";

const PatientRecordCard = ({ patient, onSelect, onViewHistory }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient.IPFS_URL) {
      loadPatientData();
    }
  }, [patient.IPFS_URL]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const data = await ipfsService.fetchFromIPFS(patient.IPFS_URL);
      setPatientData(data);
    } catch (error) {
      console.error("Error loading patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <FaUserInjured className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                {loading ? "Loading..." : patientData?.name || "Patient"}
              </h4>
              <p className="text-sm text-gray-600">
                Patient ID: #{Number(patient.id)}
              </p>
              {patientData?.age && (
                <p className="text-sm text-gray-600">Age: {patientData.age}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={() => onViewHistory(patient)}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
          >
            <MdHealthAndSafety className="h-4 w-4 mr-2" />
            View Medical Records
          </Button>
        </div>
      </div>
    </Card>
  );
};

const DoctorMedicalRecords = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);
  const [doctorData, setDoctorData] = useState(null);

  const { address } = useAccount();
  const { getDoctorId, getDoctorDetails, getDoctorPatients } = useHealthcareContract();

  useEffect(() => {
    loadDoctorData();
  }, [address]);

  const loadDoctorData = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const docId = await getDoctorId(address);
      setDoctorId(docId);

      const details = await getDoctorDetails(docId);
      
      // Fetch doctor profile from IPFS
      if (details.IPFS_URL) {
        const profileData = await ipfsService.fetchFromIPFS(details.IPFS_URL);
        setDoctorData(profileData);
      }

      const patientsList = await getDoctorPatients(docId);
      setPatients(patientsList || []);
    } catch (error) {
      console.error("Error loading doctor data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Patient Medical Records</h2>
        <p className="text-blue-100">
          Access encrypted medical records with hybrid AES + CP-ABE security
        </p>
      </div>

      {!selectedPatient ? (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Select a Patient
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <Card
                key={patient.id}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="p-4">
                  <h4 className="font-bold text-gray-900">
                    {patient.name || `Patient #${patient.id}`}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Click to view medical records
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <Button
            onClick={() => setSelectedPatient(null)}
            variant="outline"
            className="mb-4"
          >
            ← Back to Patients
          </Button>

          <DoctorMedicalRecordAccess
            patientId={selectedPatient.id}
            doctorId={doctorId}
            doctorData={doctorData}
          />
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;
