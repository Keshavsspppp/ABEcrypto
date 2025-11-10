import {
  useWriteContract,
  useReadContract,
  useAccount,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export const useHealthcareContract = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();

  // Write contract hook
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Medicine functions
  const addMedicine = useCallback(
    async (ipfsUrl, price, quantity, discount, location) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "ADD_MEDICINE",
          args: [
            ipfsUrl,
            parseEther(price.toString()),
            quantity,
            discount,
            location,
          ],
        });
        toast.success("Medicine added successfully!");
        return result;
      } catch (error) {
        console.error("Error adding medicine:", error);
        toast.error("Failed to add medicine");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const updateMedicinePrice = useCallback(
    async (medicineId, newPrice) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_MEDICINE_PRICE",
          args: [medicineId, parseEther(newPrice.toString())],
        });
        toast.success("Medicine price updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating medicine price:", error);
        toast.error("Failed to update medicine price");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const updateMedicineQuantity = useCallback(
    async (medicineId, newQuantity) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_MEDICINE_QUANTITY",
          args: [medicineId, newQuantity],
        });
        toast.success("Medicine quantity updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating medicine quantity:", error);
        toast.error("Failed to update medicine quantity");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const updateMedicineDiscount = useCallback(
    async (medicineId, newDiscount) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_MEDICINE_DISCOUNT",
          args: [medicineId, newDiscount],
        });
        toast.success("Medicine discount updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating medicine discount:", error);
        toast.error("Failed to update medicine discount");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const toggleMedicineActive = useCallback(
    async (medicineId) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_MEDICINE_ACTIVE",
          args: [medicineId],
        });
        toast.success("Medicine status updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating medicine status:", error);
        toast.error("Failed to update medicine status");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  // Doctor functions
  const registerDoctor = useCallback(
    async (ipfsUrl, doctorAddress, name, userType, registrationFee) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "ADD_DOCTOR",
          args: [ipfsUrl, doctorAddress, name, userType],
          value: parseEther(registrationFee.toString()),
        });
        toast.success("Doctor registered successfully! Waiting for approval.");
        return result;
      } catch (error) {
        console.error("Error registering doctor:", error);
        toast.error("Failed to register doctor");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const approveDoctorStatus = useCallback(
    async (doctorId) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "APPROVE_DOCTOR_STATUS",
          args: [doctorId],
        });
        toast.success("Doctor approved successfully!");
        return result;
      } catch (error) {
        console.error("Error approving doctor:", error);
        toast.error("Failed to approve doctor");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const prescribeMedicine = useCallback(
    async (medicineId, patientId) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "PRESCRIBE_MEDICINE",
          args: [medicineId, patientId],
        });
        toast.success("Medicine prescribed successfully!");
        return result;
      } catch (error) {
        console.error("Error prescribing medicine:", error);
        toast.error("Failed to prescribe medicine");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const updatePatientMedicalHistory = useCallback(
    async (patientId, newHistory) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_PATIENT_MEDICAL_HISTORY",
          args: [patientId, newHistory],
        });
        toast.success("Medical history updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating medical history:", error);
        toast.error("Failed to update medical history");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const completeAppointment = useCallback(
    async (appointmentId) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "COMPLETE_APPOINTMENT",
          args: [appointmentId],
        });
        toast.success("Appointment completed successfully!");
        return result;
      } catch (error) {
        console.error("Error completing appointment:", error);
        toast.error("Failed to complete appointment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  // Patient functions
  const registerPatient = useCallback(
    async (
      ipfsUrl,
      medicalHistory,
      accountAddress,
      boughtMedicines,
      name,
      doctorAddress,
      doctorName,
      userType,
      registrationFee
    ) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      // Validation
      if (!ipfsUrl || !name || !accountAddress) {
        toast.error("Missing required registration information");
        return;
      }

      // Ensure arrays are proper format
      const medicalHistoryArray = Array.isArray(medicalHistory)
        ? medicalHistory
        : [medicalHistory || "No medical history"];
      const boughtMedicinesArray = Array.isArray(boughtMedicines)
        ? boughtMedicines
        : [];

      try {
        setLoading(true);

        console.log("Registering patient with params:", {
          ipfsUrl,
          medicalHistoryArray,
          accountAddress,
          boughtMedicinesArray,
          name,
          doctorAddress,
          doctorName,
          userType,
          registrationFee: `${registrationFee} ETH`,
        });

        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "ADD_PATIENTS",
          args: [
            ipfsUrl,
            medicalHistoryArray,
            accountAddress,
            boughtMedicinesArray,
            name,
            doctorAddress || accountAddress, // Fallback to patient's address
            doctorName || "General",
            userType,
          ],
          value: parseEther(registrationFee.toString()),
        });

        console.log("Registration transaction result:", result);
        toast.success("Patient registered successfully!");
        return result;
      } catch (error) {
        console.error("Error registering patient:", error);

        // More specific error handling
        if (error.message?.includes("Patient is already registered")) {
          toast.error("This address is already registered as a patient");
        } else if (error.message?.includes("Incorrect registration fee")) {
          toast.error(
            `Incorrect registration fee. Required: ${registrationFee} ETH`
          );
        } else if (error.message?.includes("insufficient funds")) {
          toast.error("Insufficient funds for registration fee");
        } else {
          toast.error(
            `Registration failed: ${
              error.shortMessage || error.message || "Unknown error"
            }`
          );
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const bookAppointment = useCallback(
    async (
      patientId,
      doctorId,
      from,
      to,
      appointmentDate,
      condition,
      message,
      doctorAddress,
      doctorName,
      appointmentFee
    ) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "BOOK_APPOINTMENT",
          args: [
            patientId,
            doctorId,
            from,
            to,
            appointmentDate,
            condition,
            message,
            doctorAddress,
            doctorName,
          ],
          value: parseEther(appointmentFee.toString()),
        });
        toast.success("Appointment booked successfully!");
        return result;
      } catch (error) {
        console.error("Error booking appointment:", error);
        toast.error("Failed to book appointment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const buyMedicine = useCallback(
    async (patientId, medicineId, quantity, totalPrice) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "BUY_MEDICINE",
          args: [patientId, medicineId, quantity],
          value: parseEther(totalPrice.toString()),
        });
        toast.success("Medicine purchased successfully!");
        return result;
      } catch (error) {
        console.error("Error buying medicine:", error);
        toast.error("Failed to buy medicine");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  // Chat functions
  const sendMessage = useCallback(
    async (friendKey, myAddress, message) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "_SEND_MESSAGE",
          args: [friendKey, myAddress, message],
        });
        toast.success("Message sent successfully!");
        return result;
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  // Admin functions
  const updateRegistrationFee = useCallback(
    async (newFee) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_REGISTRATION_FEE",
          args: [parseEther(newFee.toString())],
        });
        toast.success("Registration fee updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating registration fee:", error);
        toast.error("Failed to update registration fee");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const updateAppointmentFee = useCallback(
    async (newFee) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_APPOINTMENT_FEE",
          args: [parseEther(newFee.toString())],
        });
        toast.success("Appointment fee updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating appointment fee:", error);
        toast.error("Failed to update appointment fee");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const updatePatientRegistrationFee = useCallback(
    async (newFee) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_REGISTRATION_PATIENT_FEE",
          args: [parseEther(newFee.toString())],
        });
        toast.success("Patient registration fee updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating patient registration fee:", error);
        toast.error("Failed to update patient registration fee");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  const updateAdminAddress = useCallback(
    async (newAddress) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_ADMIN_ADDRESS",
          args: [newAddress],
        });
        toast.success("Admin address updated successfully!");
        return result;
      } catch (error) {
        console.error("Error updating admin address:", error);
        toast.error("Failed to update admin address");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  // Direct contract read functions using viem publicClient
  const getAllMedicines = useCallback(async () => {
    try {
      if (!publicClient) return [];

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "GET_ALL_REGISTERED_MEDICINES",
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching medicines:", error);
      return [];
    }
  }, [publicClient]);

  const getAllDoctors = useCallback(async () => {
    try {
      if (!publicClient) return [];

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "GET_ALL_REGISTERED_DOCTORS",
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  }, [publicClient]);

  const getAllApprovedDoctors = useCallback(async () => {
    try {
      if (!publicClient) return [];

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "GET_ALL_APPROVED_DOCTORS",
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching approved doctors:", error);
      return [];
    }
  }, [publicClient]);

  const getAllPatients = useCallback(async () => {
    try {
      if (!publicClient) return [];

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "GET_ALL_REGISTERED_PATIENTS",
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching patients:", error);
      return [];
    }
  }, [publicClient]);

  const getAllAppointments = useCallback(async () => {
    try {
      if (!publicClient) return [];

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "GET_ALL_APPOINTMENTS",
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  }, [publicClient]);

  const getNotifications = useCallback(
    async (userAddress) => {
      try {
        if (!publicClient || !userAddress) return [];

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_NOTIFICATIONS",
          args: [userAddress],
        });

        return data || [];
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getUserType = useCallback(
    async (userAddress) => {
      try {
        if (!publicClient || !userAddress) return null;

        // Check if user exists first
        const userExists = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "CHECK_USER_EXISTS",
          args: [userAddress],
        });

        if (!userExists) return null;

        // Get user type
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_USERNAME_TYPE",
          args: [userAddress],
        });

        return data;
      } catch (error) {
        console.error("Error fetching user type:", error);
        return null;
      }
    },
    [publicClient]
  );

  const getContractInfo = useCallback(async () => {
    try {
      if (!publicClient) return null;

      const [
        admin,
        registrationDoctorFee,
        registrationPatientFee,
        appointmentFee,
        medicineCount,
        doctorCount,
        patientCount,
        prescriptionCount,
        appointmentCount,
      ] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "admin",
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "registrationDoctorFee",
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "registrationPatientFee",
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "appointmentFee",
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "medicineCount",
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "doctorCount",
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "patientCount",
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "prescriptionCount",
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "appointmentCount",
        }),
      ]);

      return {
        admin,
        registrationDoctorFee: registrationDoctorFee
          ? formatEther(registrationDoctorFee)
          : "0",
        registrationPatientFee: registrationPatientFee
          ? formatEther(registrationPatientFee)
          : "0",
        appointmentFee: appointmentFee ? formatEther(appointmentFee) : "0",
        medicineCount: medicineCount ? Number(medicineCount) : 0,
        doctorCount: doctorCount ? Number(doctorCount) : 0,
        patientCount: patientCount ? Number(patientCount) : 0,
        prescriptionCount: prescriptionCount ? Number(prescriptionCount) : 0,
        appointmentCount: appointmentCount ? Number(appointmentCount) : 0,
      };
    } catch (error) {
      console.error("Error fetching contract info:", error);
      return null;
    }
  }, [publicClient]);

  const getDoctorId = useCallback(
    async (doctorAddress) => {
      try {
        if (!publicClient || !doctorAddress) return null;

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_DOCTOR_ID",
          args: [doctorAddress],
        });

        return Number(data);
      } catch (error) {
        console.error("Error fetching doctor ID:", error);
        return null;
      }
    },
    [publicClient]
  );

  const getPatientId = useCallback(
    async (patientAddress) => {
      try {
        if (!publicClient || !patientAddress) return null;

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_PATIENT_ID",
          args: [patientAddress],
        });

        return Number(data);
      } catch (error) {
        console.error("Error fetching patient ID:", error);
        return null;
      }
    },
    [publicClient]
  );

  const getDoctorDetails = useCallback(
    async (doctorId) => {
      try {
        if (!publicClient || !doctorId) return null;

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_DOCTOR_DETAILS",
          args: [doctorId],
        });

        return data;
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        return null;
      }
    },
    [publicClient]
  );

  const getPatientDetails = useCallback(
    async (patientId) => {
      try {
        if (!publicClient || !patientId) return null;

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_PATIENT_DETAILS",
          args: [patientId],
        });

        return data;
      } catch (error) {
        console.error("Error fetching patient details:", error);
        return null;
      }
    },
    [publicClient]
  );

  const getPatientAppointments = useCallback(
    async (patientId) => {
      try {
        if (!publicClient || !patientId) return [];

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_PATIENT_APPOINTMENT_HISTORYS",
          args: [patientId],
        });

        return data || [];
      } catch (error) {
        console.error("Error fetching patient appointments:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getDoctorAppointments = useCallback(
    async (doctorId) => {
      try {
        if (!publicClient || !doctorId) return [];

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_DOCTOR_APPOINTMENTS_HISTORYS",
          args: [doctorId],
        });

        return data || [];
      } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getPatientMedicalHistory = useCallback(
    async (patientId) => {
      try {
        if (!publicClient || !patientId) return [];

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_PATIENT_MEDICIAL_HISTORY",
          args: [patientId],
        });

        return data || [];
      } catch (error) {
        console.error("Error fetching medical history:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getPatientPrescriptions = useCallback(
    async (patientId) => {
      try {
        if (!publicClient || !patientId) return [];

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_ALL_PRESCRIBED_MEDICINES_OF_PATIENT",
          args: [patientId],
        });

        return data || [];
      } catch (error) {
        console.error("Error fetching patient prescriptions:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getPatientOrders = useCallback(
    async (patientId) => {
      try {
        if (!publicClient || !patientId) return [];

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_ALL_PATIENT_ORDERS",
          args: [patientId],
        });

        return data || [];
      } catch (error) {
        console.error("Error fetching patient orders:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getChatMessages = useCallback(
    async (friendAddress, myAddress) => {
      try {
        if (!publicClient || !friendAddress || !myAddress) return [];

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_READ_MESSAGE",
          args: [friendAddress, myAddress],
        });

        return data || [];
      } catch (error) {
        console.error("Error fetching chat messages:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getFriendsList = useCallback(
    async (userAddress) => {
      try {
        if (!publicClient || !userAddress) return [];

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_MY_FRIEND_LIST",
          args: [userAddress],
        });

        return data || [];
      } catch (error) {
        console.error("Error fetching friends list:", error);
        return [];
      }
    },
    [publicClient]
  );

  // Hook-based functions for direct use in components
  const useContractRead = (functionName, args = []) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName,
      args,
    });
  };

  return {
    // Loading states
    loading: loading || isPending || isConfirming,
    isConfirmed,

    // Medicine functions
    addMedicine,
    updateMedicinePrice,
    updateMedicineQuantity,
    updateMedicineDiscount,
    toggleMedicineActive,
    getAllMedicines,

    // Doctor functions
    registerDoctor,
    approveDoctorStatus,
    prescribeMedicine,
    updatePatientMedicalHistory,
    completeAppointment,
    getAllDoctors,
    getAllApprovedDoctors,
    getDoctorId,
    getDoctorDetails,
    getDoctorAppointments,

    // Patient functions
    registerPatient,
    bookAppointment,
    buyMedicine,
    getAllPatients,
    getPatientId,
    getPatientDetails,
    getPatientAppointments,
    getPatientMedicalHistory,
    getPatientPrescriptions,
    getPatientOrders,

    // Chat functions
    sendMessage,
    getChatMessages,
    getFriendsList,

    // Admin functions
    updateRegistrationFee,
    updateAppointmentFee,
    updatePatientRegistrationFee,
    updateAdminAddress,

    // Utility functions
    getNotifications,
    getUserType,
    getContractInfo,
    getAllAppointments,

    // Hooks for individual reads
    useContractRead,
  };
};
