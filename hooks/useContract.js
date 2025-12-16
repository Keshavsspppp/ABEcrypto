import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import HealthcareABI from "../web3/artifacts/contracts/Healthcare.sol/Healthcare.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const useHealthcareContract = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    let isMounted = true;
    let contractInstance = null;
    
    const initContract = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        if (!CONTRACT_ADDRESS) {
          console.error("❌ Contract address not found");
          return;
        }

        if (isConnected && window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
          
          // Disable polling on provider
          provider.pollingInterval = 60000; // 60 seconds
          
          const signer = provider.getSigner();
          
          contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            HealthcareABI.abi,
            signer
          );
          
          if (isMounted) {
            setContract(contractInstance);
            console.log("✅ Contract initialized with signer");
          }
        } else if (publicClient) {
          const provider = new ethers.providers.JsonRpcProvider(
            publicClient.chain.rpcUrls.default.http[0]
          );
          
          // Disable polling on provider
          provider.pollingInterval = 60000; // 60 seconds
          
          contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            HealthcareABI.abi,
            provider
          );
          
          if (isMounted) {
            setContract(contractInstance);
            console.log("✅ Contract initialized (read-only)");
          }
        }
      } catch (error) {
        console.error("❌ Error initializing contract:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initContract();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (contractInstance) {
        // Remove all event listeners
        contractInstance.removeAllListeners();
      }
    };
  }, [isConnected, publicClient, address]); // Remove walletClient from dependencies

  // Helper function - allow read-only operations without wallet
  const ensureContract = (requireSigner = true) => {
    if (!contract) {
      const message = requireSigner 
        ? "Please connect your wallet to perform this action."
        : "Contract not initialized. Please check your configuration.";
      throw new Error(message);
    }
    
    if (requireSigner && !isConnected) {
      throw new Error("Please connect your wallet to perform this action.");
    }
    
    return contract;
  };

  // ============ NOTIFICATION FUNCTIONS ============

  const getNotifications = async (userAddress) => {
    try {
      const contractInstance = ensureContract(false); // Read-only
      const notifications = await contractInstance.GET_NOTIFICATIONS(userAddress);
      
      return notifications.map((notif) => ({
        id: Number(notif.id || 0),
        userAddress: notif.userAddress,
        message: notif.message,
        timestamp: Number(notif.timestamp || 0),
        categoryType: notif.categoryType,
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  };

  // ============ ENCRYPTED MEDICAL RECORDS FUNCTIONS ============

  const getPatientEncryptedRecords = async (patientId) => {
    try {
      const contractInstance = ensureContract(false);
      const records = await contractInstance.getPatientEncryptedRecords(patientId);
      
      return records.map((record) => ({
        id: Number(record.id || 0),
        patientId: Number(record.patientId || 0),
        ipfsHash: record.ipfsHash,
        encryptedAESKey: record.encryptedAESKey,
        accessPolicy: record.accessPolicy,
        timestamp: Number(record.timestamp || 0),
        uploadedBy: record.uploadedBy,
        isActive: record.isActive,
      }));
    } catch (error) {
      console.error("Error fetching encrypted records:", error);
      return [];
    }
  };

  const getPatientAccessRequests = async (patientId) => {
    try {
      const contractInstance = ensureContract(false);
      const requests = await contractInstance.getPatientAccessRequests(patientId);
      
      return requests.map((request) => ({
        id: Number(request.id || 0),
        recordId: Number(request.recordId || 0),
        doctorId: Number(request.doctorId || 0),
        patientId: Number(request.patientId || 0),
        reason: request.reason,
        timestamp: Number(request.timestamp || 0),
        isPending: request.isPending,
        isApproved: request.isApproved,
      }));
    } catch (error) {
      console.error("Error fetching access requests:", error);
      return [];
    }
  };

  const uploadEncryptedMedicalRecord = async (
    patientId,
    ipfsHash,
    encryptedAESKey,
    accessPolicy
  ) => {
    try {
      const contractInstance = ensureContract(true); // Requires wallet
      
      console.log("📤 Uploading encrypted medical record...");
      console.log("Patient ID:", patientId);
      console.log("IPFS Hash:", ipfsHash);
      console.log("Policy:", accessPolicy);
      
      const tx = await contractInstance.uploadEncryptedMedicalRecord(
        patientId,
        ipfsHash,
        encryptedAESKey,
        JSON.stringify(accessPolicy)
      );

      console.log("📤 Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.transactionHash);
      
      return receipt;
    } catch (error) {
      console.error("❌ Error uploading encrypted medical record:", error);
      
      // Better error messages
      if (error.code === 4001) {
        throw new Error("Transaction rejected by user");
      } else if (error.code === -32603) {
        throw new Error("Internal error. Check if you have enough gas.");
      } else if (error.message?.includes("insufficient funds")) {
        throw new Error("Insufficient funds for transaction");
      }
      
      throw error;
    }
  };

  const requestRecordAccess = async (patientId, recordId, reason) => {
    try {
      const contractInstance = ensureContract(true);
      
      console.log("📤 Requesting record access...");
      console.log("Patient ID:", patientId, "Record ID:", recordId);
      
      const tx = await contractInstance.requestRecordAccess(patientId, recordId, reason);
      const receipt = await tx.wait();
      
      console.log("✅ Access request sent:", receipt.transactionHash);
      return receipt;
    } catch (error) {
      console.error("❌ Error requesting record access:", error);
      throw error;
    }
  };

  const approveAccessRequest = async (requestIndex) => {
    try {
      const contractInstance = ensureContract(true);
      
      console.log("📤 Approving access request:", requestIndex);
      
      const tx = await contractInstance.approveAccessRequest(requestIndex);
      const receipt = await tx.wait();
      
      console.log("✅ Access request approved:", receipt.transactionHash);
      return receipt;
    } catch (error) {
      console.error("❌ Error approving access request:", error);
      throw error;
    }
  };

  const denyAccessRequest = async (requestIndex) => {
    try {
      const contractInstance = ensureContract(true);
      
      console.log("📤 Denying access request:", requestIndex);
      
      const tx = await contractInstance.denyAccessRequest(requestIndex);
      const receipt = await tx.wait();
      
      console.log("✅ Access request denied:", receipt.transactionHash);
      return receipt;
    } catch (error) {
      console.error("❌ Error denying access request:", error);
      throw error;
    }
  };

  const hasDoctorAccess = async (patientId, doctorId) => {
    try {
      const contractInstance = ensureContract(false);
      const hasAccess = await contractInstance.hasDoctorAccess(patientId, doctorId);
      return hasAccess;
    } catch (error) {
      console.error("Error checking doctor access:", error);
      return false;
    }
  };

  const revokeAccess = async (doctorId) => {
    try {
      const contractInstance = ensureContract(true);
      
      console.log("📤 Revoking access for doctor:", doctorId);
      
      const tx = await contractInstance.revokeAccess(doctorId);
      const receipt = await tx.wait();
      
      console.log("✅ Access revoked:", receipt.transactionHash);
      return receipt;
    } catch (error) {
      console.error("❌ Error revoking access:", error);
      throw error;
    }
  };

  const getEncryptedRecord = async (patientId, recordId) => {
    try {
      const contractInstance = ensureContract(false);
      const record = await contractInstance.getEncryptedRecord(patientId, recordId);
      
      return {
        id: Number(record.id || 0),
        patientId: Number(record.patientId || 0),
        ipfsHash: record.ipfsHash,
        encryptedAESKey: record.encryptedAESKey,
        accessPolicy: record.accessPolicy,
        timestamp: Number(record.timestamp || 0),
        uploadedBy: record.uploadedBy,
        isActive: record.isActive,
      };
    } catch (error) {
      console.error("Error fetching encrypted record:", error);
      throw error;
    }
  };

  // ============ PATIENT FUNCTIONS ============

  const getUserType = async (userAddress) => {
    try {
      const contractInstance = ensureContract(false);
      const user = await contractInstance.GET_USERNAME_TYPE(userAddress);
      return {
        name: user.name,
        userType: user.userType,
      };
    } catch (error) {
      console.error("Error getting user type:", error);
      return null;
    }
  };

  const getPatientId = async (patientAddress) => {
    try {
      const contractInstance = ensureContract(false);
      const patientId = await contractInstance.GET_PATIENT_ID(patientAddress);
      return Number(patientId || 0);
    } catch (error) {
      console.error("Error getting patient ID:", error);
      throw error;
    }
  };

  const getPatientDetails = async (patientId) => {
    try {
      const contractInstance = ensureContract(false);
      const patient = await contractInstance.GET_PATIENT_DETAILS(patientId);
      return patient;
    } catch (error) {
      console.error("Error getting patient details:", error);
      throw error;
    }
  };

  const getPatientAppointments = async (patientId) => {
    try {
      const contractInstance = ensureContract(false);
      const appointments = await contractInstance.GET_PATIENT_APPOINTMENT_HISTORYS(patientId);
      return appointments;
    } catch (error) {
      console.error("Error getting patient appointments:", error);
      return [];
    }
  };

  const getPatientMedicalHistory = async (patientId) => {
    try {
      const contractInstance = ensureContract(false);
      const history = await contractInstance.GET_PATIENT_MEDICIAL_HISTORY(patientId);
      return history;
    } catch (error) {
      console.error("Error getting patient medical history:", error);
      return [];
    }
  };

  const getPatientPrescriptions = async (patientId) => {
    try {
      const contractInstance = ensureContract(false);
      const prescriptions = await contractInstance.GET_ALL_PRESCRIBED_MEDICINES_OF_PATIENT(patientId);
      return prescriptions;
    } catch (error) {
      console.error("Error getting patient prescriptions:", error);
      return [];
    }
  };

  // ============ DOCTOR FUNCTIONS ============

  const getAllDoctors = async () => {
    try {
      const contractInstance = ensureContract(false);
      const doctors = await contractInstance.GET_ALL_REGISTERED_DOCTORS();
      return doctors;
    } catch (error) {
      console.error("Error getting all doctors:", error);
      return [];
    }
  };

  const getDoctorDetails = async (doctorId) => {
    try {
      const contractInstance = ensureContract(false);
      const doctor = await contractInstance.GET_DOCTOR_DETAILS(doctorId);
      return doctor;
    } catch (error) {
      console.error("Error getting doctor details:", error);
      throw error;
    }
  };

  const getDoctorId = async (doctorAddress) => {
    try {
      const contractInstance = ensureContract(false);
      const doctorId = await contractInstance.GET_DOCTOR_ID(doctorAddress);
      return Number(doctorId || 0);
    } catch (error) {
      console.error("Error getting doctor ID:", error);
      throw error;
    }
  };

  // ============ MEDICINE FUNCTIONS ============

  const getAllMedicines = async () => {
    try {
      const contractInstance = ensureContract(false);
      const medicines = await contractInstance.GET_ALL_REGISTERED_MEDICINES();
      return medicines;
    } catch (error) {
      console.error("Error getting all medicines:", error);
      return [];
    }
  };

  const getMedicineDetails = async (medicineId) => {
    try {
      const contractInstance = ensureContract(false);
      const medicine = await contractInstance.GET_MEDICINE_DETAILS(medicineId);
      return medicine;
    } catch (error) {
      console.error("Error getting medicine details:", error);
      throw error;
    }
  };

  // Return all functions
  return {
    contract,
    loading,
    isConnected,
    address,
    
    // Notifications
    getNotifications,
    
    // Encrypted Medical Records
    getPatientEncryptedRecords,
    getPatientAccessRequests,
    uploadEncryptedMedicalRecord,
    requestRecordAccess,
    approveAccessRequest,
    denyAccessRequest,
    hasDoctorAccess,
    revokeAccess,
    getEncryptedRecord,
    
    // Patient Functions
    getUserType,
    getPatientId,
    getPatientDetails,
    getPatientAppointments,
    getPatientMedicalHistory,
    getPatientPrescriptions,
    
    // Doctor Functions
    getAllDoctors,
    getDoctorDetails,
    getDoctorId,
    
    // Medicine Functions
    getAllMedicines,
    getMedicineDetails,
  };
};
