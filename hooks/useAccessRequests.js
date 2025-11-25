import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";
import toast from "react-hot-toast";

export const useAccessRequests = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const { writeContract } = useWriteContract();

  /**
   * Request access to a patient's medical record
   */
  const requestAccess = useCallback(
    async (patientId, medicalRecordIndex, reason) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "REQUEST_ACCESS",
          args: [patientId, medicalRecordIndex, reason],
        });
        toast.success("Access request submitted successfully!");
        return result;
      } catch (error) {
        console.error("Error requesting access:", error);
        toast.error("Failed to submit access request");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  /**
   * Approve an access request (patient only)
   */
  const approveAccessRequest = useCallback(
    async (requestId) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "APPROVE_ACCESS_REQUEST",
          args: [requestId],
        });
        toast.success("Access request approved!");
        return result;
      } catch (error) {
        console.error("Error approving access request:", error);
        toast.error("Failed to approve access request");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  /**
   * Deny an access request (patient only)
   */
  const denyAccessRequest = useCallback(
    async (requestId) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "DENY_ACCESS_REQUEST",
          args: [requestId],
        });
        toast.success("Access request denied");
        return result;
      } catch (error) {
        console.error("Error denying access request:", error);
        toast.error("Failed to deny access request");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected]
  );

  /**
   * Get all access requests for a patient
   */
  const getPatientAccessRequests = useCallback(
    async (patientId) => {
      if (!isConnected) {
        return [];
      }

      try {
        const { data } = await useReadContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_PATIENT_ACCESS_REQUESTS",
          args: [patientId],
        });
        return data || [];
      } catch (error) {
        console.error("Error fetching patient access requests:", error);
        return [];
      }
    },
    [isConnected]
  );

  /**
   * Get all access requests made by a doctor
   */
  const getDoctorAccessRequests = useCallback(
    async (doctorId) => {
      if (!isConnected) {
        return [];
      }

      try {
        const { data } = await useReadContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_DOCTOR_ACCESS_REQUESTS",
          args: [doctorId],
        });
        return data || [];
      } catch (error) {
        console.error("Error fetching doctor access requests:", error);
        return [];
      }
    },
    [isConnected]
  );

  /**
   * Check if a doctor has access to a specific medical record
   */
  const hasAccessToRecord = useCallback(
    async (patientId, medicalRecordIndex, doctorAddress) => {
      try {
        const { data } = await useReadContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "HAS_ACCESS_TO_RECORD",
          args: [patientId, medicalRecordIndex, doctorAddress],
        });
        return data || false;
      } catch (error) {
        console.error("Error checking access to record:", error);
        return false;
      }
    },
    []
  );

  /**
   * Get doctors by speciality
   */
  const getDoctorsBySpeciality = useCallback(
    async (speciality) => {
      try {
        const { data } = await useReadContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_DOCTORS_BY_SPECIALITY",
          args: [speciality],
        });
        return data || [];
      } catch (error) {
        console.error("Error fetching doctors by speciality:", error);
        return [];
      }
    },
    []
  );

  return {
    requestAccess,
    approveAccessRequest,
    denyAccessRequest,
    getPatientAccessRequests,
    getDoctorAccessRequests,
    hasAccessToRecord,
    getDoctorsBySpeciality,
    loading,
  };
};

export default useAccessRequests;
