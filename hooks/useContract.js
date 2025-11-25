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

  // Validate contract is deployed at the configured address on the current network
  const isContractDeployed = useCallback(async () => {
    try {
      if (!publicClient || !CONTRACT_ADDRESS) return false;
      const bytecode = await publicClient.getBytecode({ address: CONTRACT_ADDRESS });
      return !!bytecode;
    } catch (e) {
      return false;
    }
  }, [publicClient]);

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
    async (ipfsUrl, doctorAddress, name, userType, registrationFee, speciality) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);

        // Check if doctor is already registered
        try {
          const isRegistered = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "registeredDoctors",
            args: [doctorAddress],
          });
          if (isRegistered) {
            toast.error("This address is already registered as a doctor");
            return;
          }
        } catch (checkError) {
          console.warn("Could not check registration status:", checkError);
        }

        // Get the exact required fee from contract
        let requiredFee;
        try {
          const feeWei = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "registrationDoctorFee",
          });
          requiredFee = formatEther(feeWei);
        } catch (feeError) {
          console.warn("Could not fetch registration fee:", feeError);
          requiredFee = registrationFee;
        }

        // Validate fee matches exactly
        const feeDifference = Math.abs(parseFloat(requiredFee) - parseFloat(registrationFee));
        if (feeDifference > 0.0000001) {
          toast.error(
            `Registration fee mismatch. Required: ${requiredFee} ETH, Provided: ${registrationFee} ETH`
          );
          return;
        }

        // Validate inputs before attempting transaction
        if (!ipfsUrl || ipfsUrl.trim() === "") {
          toast.error("IPFS URL is required. Please ensure profile data was uploaded successfully.");
          return;
        }
        
        if (!name || name.trim() === "") {
          toast.error("Doctor name is required");
          return;
        }
        
        if (!userType || userType.trim() === "") {
          toast.error("User type is required");
          return;
        }

        if (!speciality || speciality.trim() === "") {
          toast.error("Speciality is required");
          return;
        }

        // Estimate gas first to catch revert reasons
        try {
          await publicClient.estimateContractGas({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "ADD_DOCTOR",
            args: [ipfsUrl, doctorAddress, name, userType, speciality],
            value: parseEther(registrationFee.toString()),
            account: address,
          });
        } catch (gasError) {
          // Extract revert reason from error
          let errorMessage = "Transaction would fail";
          
          // Check for specific error reasons
          if (gasError.message) {
            if (gasError.message.includes("Incorrect registration fee")) {
              errorMessage = `Incorrect registration fee. Required: ${requiredFee} ETH, Provided: ${registrationFee} ETH`;
            } else if (gasError.message.includes("already registered") || gasError.message.includes("Doctor is already registered")) {
              errorMessage = "This address is already registered as a doctor";
            } else if (gasError.message.includes("revert")) {
              // Try to extract the revert reason
              const revertMatch = gasError.message.match(/revert\s+(.+)/i);
              if (revertMatch) {
                errorMessage = revertMatch[1];
              } else {
                // Check for common revert reasons
                if (gasError.message.includes("Incorrect registration fee")) {
                  errorMessage = `Incorrect registration fee. Required: ${requiredFee} ETH`;
                } else {
                  errorMessage = "Transaction would revert. Please check: 1) Registration fee is correct, 2) You are not already registered, 3) All required fields are filled";
                }
              }
            } else {
              errorMessage = gasError.message;
            }
          }
          
          // Log detailed error for debugging
          console.error("Gas estimation failed:", {
            error: gasError,
            ipfsUrl,
            doctorAddress,
            name,
            userType,
            registrationFee,
            requiredFee,
            contractAddress: CONTRACT_ADDRESS
          });
          
          toast.error(errorMessage);
          throw gasError;
        }

        // Log transaction details for debugging
        console.log("Registering doctor with:", {
          contractAddress: CONTRACT_ADDRESS,
          ipfsUrl,
          doctorAddress,
          name,
          userType,
          speciality,
          registrationFee,
          feeInWei: parseEther(registrationFee.toString()).toString()
        });

        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "ADD_DOCTOR",
          args: [ipfsUrl, doctorAddress, name, userType, speciality],
          value: parseEther(registrationFee.toString()),
        });
        toast.success("Doctor registered successfully! Waiting for approval.");
        return result;
      } catch (error) {
        console.error("Error registering doctor:", error);
        
        // Detailed error logging
        console.error("Registration error details:", {
          error,
          errorMessage: error.message,
          shortMessage: error.shortMessage,
          cause: error.cause,
          data: error.data,
          ipfsUrl,
          doctorAddress,
          name,
          userType,
          registrationFee,
          contractAddress: CONTRACT_ADDRESS
        });
        
        // Extract more specific error messages
        let errorMessage = "Failed to register doctor";
        
        // Check for common error patterns
        const errorString = JSON.stringify(error).toLowerCase();
        const errorMsg = (error.message || "").toLowerCase();
        const shortMsg = (error.shortMessage || "").toLowerCase();
        
        if (errorMsg.includes("incorrect registration fee") || shortMsg.includes("incorrect registration fee")) {
          errorMessage = `Registration fee is incorrect. Required: ${requiredFee} ETH, Provided: ${registrationFee} ETH`;
        } else if (errorMsg.includes("already registered") || shortMsg.includes("already registered")) {
          errorMessage = "This address is already registered as a doctor";
        } else if (errorMsg.includes("revert") || shortMsg.includes("revert")) {
          // Try to extract revert reason
          const revertMatch = (error.message || error.shortMessage || "").match(/revert\s+(.+)/i);
          if (revertMatch) {
            errorMessage = `Transaction reverted: ${revertMatch[1]}`;
          } else {
            errorMessage = "Transaction reverted. Possible reasons: 1) Incorrect fee, 2) Already registered, 3) Invalid IPFS URL, 4) Contract address mismatch";
          }
        } else if (error.shortMessage) {
          errorMessage = error.shortMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected, publicClient, address]
  );

  const approveDoctorStatus = useCallback(
    async (doctorId) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        // Validate inputs
        if (!doctorId || doctorId <= 0) {
          toast.error("Invalid doctor ID");
          return;
        }

        // Check if user is admin before attempting transaction
        let isAdmin = false;
        let adminAddress = null;
        try {
          adminAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "admin",
          });
          
          isAdmin = address && address.toLowerCase() === adminAddress?.toLowerCase();
          
          if (!isAdmin) {
            toast.error(`Only admin can approve doctors. Admin address: ${adminAddress?.slice(0, 6)}...${adminAddress?.slice(-4)}`);
            return;
          }
        } catch (adminError) {
          console.warn("Could not verify admin status:", adminError);
          // Continue anyway, let the contract revert with better error
        }

        // Check if doctor exists
        try {
          const doctorCount = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "doctorCount",
          });
          
          if (Number(doctorId) > Number(doctorCount)) {
            toast.error(`Doctor ID ${doctorId} does not exist. Total doctors: ${doctorCount}`);
            return;
          }
        } catch (countError) {
          console.warn("Could not check doctor count:", countError);
        }

        // Check if doctor is already approved
        try {
          const doctorDetails = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "doctors",
            args: [doctorId],
          });
          
          if (doctorDetails?.isApproved) {
            toast.error("Doctor is already approved");
            return;
          }
        } catch (doctorError) {
          console.warn("Could not check doctor status:", doctorError);
        }

        // Estimate gas first to catch revert reasons
        try {
          await publicClient.estimateContractGas({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "APPROVE_DOCTOR_STATUS",
            args: [doctorId],
            account: address,
          });
        } catch (gasError) {
          // Extract revert reason from error
          let errorMessage = "Transaction would fail";
          
          if (gasError.message) {
            if (gasError.message.includes("Only admin")) {
              errorMessage = `Only admin can approve doctors. Your address: ${address?.slice(0, 6)}...${address?.slice(-4)}, Admin: ${adminAddress?.slice(0, 6)}...${adminAddress?.slice(-4)}`;
            } else if (gasError.message.includes("Doctor does not exist")) {
              errorMessage = `Doctor ID ${doctorId} does not exist`;
            } else if (gasError.message.includes("already approved")) {
              errorMessage = "Doctor is already approved";
            } else if (gasError.message.includes("revert")) {
              const revertMatch = gasError.message.match(/revert\s+(.+)/i);
              if (revertMatch) {
                errorMessage = `Transaction reverted: ${revertMatch[1]}`;
              } else {
                errorMessage = "Transaction would revert. Possible reasons: 1) Not admin, 2) Doctor doesn't exist, 3) Doctor already approved";
              }
            } else {
              errorMessage = gasError.message;
            }
          }
          
          console.error("Gas estimation failed:", {
            error: gasError,
            doctorId,
            address,
            adminAddress,
            isAdmin,
            contractAddress: CONTRACT_ADDRESS
          });
          
          toast.error(errorMessage);
          throw gasError;
        }

        // Log transaction details
        console.log("Approving doctor with:", {
          contractAddress: CONTRACT_ADDRESS,
          doctorId,
          address,
          adminAddress,
          isAdmin
        });

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
        
        // Detailed error logging
        console.error("Approve doctor error details:", {
          error,
          errorMessage: error.message,
          shortMessage: error.shortMessage,
          cause: error.cause,
          data: error.data,
          doctorId,
          address,
          contractAddress: CONTRACT_ADDRESS
        });
        
        // Extract more specific error messages
        let errorMessage = "Failed to approve doctor";
        
        const errorMsg = (error.message || "").toLowerCase();
        const shortMsg = (error.shortMessage || "").toLowerCase();
        
        if (errorMsg.includes("only admin") || shortMsg.includes("only admin")) {
          errorMessage = "Only the contract admin can approve doctors. Please ensure you're connected with the admin wallet.";
        } else if (errorMsg.includes("doctor does not exist") || shortMsg.includes("doctor does not exist")) {
          errorMessage = `Doctor ID ${doctorId} does not exist`;
        } else if (errorMsg.includes("already approved") || shortMsg.includes("already approved")) {
          errorMessage = "Doctor is already approved";
        } else if (errorMsg.includes("revert") || shortMsg.includes("revert")) {
          const revertMatch = (error.message || error.shortMessage || "").match(/revert\s+(.+)/i);
          if (revertMatch) {
            errorMessage = `Transaction reverted: ${revertMatch[1]}`;
          } else {
            errorMessage = "Transaction reverted. Possible reasons: 1) Not admin, 2) Doctor doesn't exist, 3) Doctor already approved";
          }
        } else if (error.shortMessage) {
          errorMessage = error.shortMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected, publicClient, address]
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
    async (patientId, newHistory, encrypt = true) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        setLoading(true);
        
        // Encrypt medical history if encryption is enabled
        let historyToStore = newHistory;
        if (encrypt && publicClient) {
          try {
            // Dynamic import to avoid circular dependency
            const { default: abeEncryption } = await import('../utils/encryption');
            
            // Get doctor ID and speciality if user is a doctor - call contract directly to avoid circular dependency
            let doctorId = null;
            let doctorSpeciality = null;
            try {
              // Check if user exists
              const userExists = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "CHECK_USER_EXISTS",
                args: [address],
              });

              if (userExists) {
                // Get user type
                const userInfo = await publicClient.readContract({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: "GET_USERNAME_TYPE",
                  args: [address],
                });

                if (userInfo?.userType === 'doctor') {
                  // Get doctor ID
                  const doctorIdResult = await publicClient.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: "GET_DOCTOR_ID",
                    args: [address],
                  });
                  doctorId = Number(doctorIdResult);
                  
                  // Get doctor details to fetch speciality
                  const doctorDetails = await publicClient.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: "GET_DOCTOR_DETAILS",
                    args: [doctorId],
                  });
                  doctorSpeciality = doctorDetails.speciality;
                }
              }
            } catch (e) {
              // Not a doctor or not registered
              console.warn('Could not get doctor ID for encryption:', e);
            }
            
            // Create access policy with speciality-based access
            const accessPolicy = abeEncryption.createMedicalRecordPolicy(
              patientId,
              doctorId,
              doctorSpeciality, // Include doctor speciality
              true, // allow admin
              [] // no pre-approved doctors initially
            );
            
            // Encrypt the history entry
            const encryptedPackage = await abeEncryption.encrypt(
              { entry: newHistory, timestamp: new Date().toISOString() },
              accessPolicy
            );
            
            // Convert to string for blockchain storage
            historyToStore = JSON.stringify(encryptedPackage);
          } catch (encryptError) {
            console.warn('Encryption failed, storing as plain text:', encryptError);
            // Continue with plain text if encryption fails
          }
        }
        
        const result = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "UPDATE_PATIENT_MEDICAL_HISTORY",
          args: [patientId, historyToStore],
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
    [writeContract, isConnected, address, publicClient]
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
        const hash = await writeContract({
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
        
        // Wait for transaction confirmation
        if (hash && publicClient) {
          toast.loading("Waiting for transaction confirmation...");
          await publicClient.waitForTransactionReceipt({ hash });
          toast.dismiss();
        }
        
        toast.success("Appointment booked successfully!");
        return hash;
      } catch (error) {
        console.error("Error booking appointment:", error);
        toast.dismiss();
        toast.error("Failed to book appointment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [writeContract, isConnected, publicClient]
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
      const deployed = await isContractDeployed();
      if (!deployed) {
        // Don't show toast, just return empty array silently
        return [];
      }

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "GET_ALL_REGISTERED_MEDICINES",
      });

      return data || [];
    } catch (error) {
      // Silently handle errors to avoid console noise
      return [];
    }
  }, [publicClient]);

  const getAllDoctors = useCallback(async () => {
    try {
      if (!publicClient) return [];
      const deployed = await isContractDeployed();
      if (!deployed) {
        // Don't show toast, just return empty array silently
        return [];
      }

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "GET_ALL_REGISTERED_DOCTORS",
      });

      return data || [];
    } catch (error) {
      // Silently handle errors to avoid console noise
      return [];
    }
  }, [publicClient]);

  const getAllApprovedDoctors = useCallback(async () => {
    try {
      if (!publicClient) return [];
      const deployed = await isContractDeployed();
      if (!deployed) {
        toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
        return [];
      }

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
      const deployed = await isContractDeployed();
      if (!deployed) {
        toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
        return [];
      }

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
      const deployed = await isContractDeployed();
      if (!deployed) {
        toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
        return [];
      }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return [];
        }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return null;
        }

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
      const deployed = await isContractDeployed();
      if (!deployed) {
        // Don't show toast error, just return null silently
        return null;
      }

      // Use Promise.allSettled to handle individual failures gracefully
      const results = await Promise.allSettled([
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "admin",
        }).catch(() => null),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "registrationDoctorFee",
        }).catch(() => null),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "registrationPatientFee",
        }).catch(() => null),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "appointmentFee",
        }).catch(() => null),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "medicineCount",
        }).catch(() => null),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "doctorCount",
        }).catch(() => null),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "patientCount",
        }).catch(() => null),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "prescriptionCount",
        }).catch(() => null),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "appointmentCount",
        }).catch(() => null),
      ]);

      // Extract values from Promise.allSettled results
      const admin = results[0].status === "fulfilled" ? results[0].value : null;
      const registrationDoctorFee = results[1].status === "fulfilled" ? results[1].value : null;
      const registrationPatientFee = results[2].status === "fulfilled" ? results[2].value : null;
      const appointmentFee = results[3].status === "fulfilled" ? results[3].value : null;
      const medicineCount = results[4].status === "fulfilled" ? results[4].value : null;
      const doctorCount = results[5].status === "fulfilled" ? results[5].value : null;
      const patientCount = results[6].status === "fulfilled" ? results[6].value : null;
      const prescriptionCount = results[7].status === "fulfilled" ? results[7].value : null;
      const appointmentCount = results[8].status === "fulfilled" ? results[8].value : null;

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
      // Silently handle errors - don't log to console to avoid red lines
      return null;
    }
  }, [publicClient]);

  const getDoctorId = useCallback(
    async (doctorAddress) => {
      try {
        if (!publicClient || !doctorAddress) return null;
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return null;
        }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return null;
        }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return null;
        }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return null;
        }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return [];
        }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return [];
        }

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
    async (patientId, decrypt = true) => {
      try {
        if (!publicClient || !patientId) return [];
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return [];
        }

        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "GET_PATIENT_MEDICIAL_HISTORY",
          args: [patientId],
        });

        const history = data || [];
        
        // Decrypt medical history entries if decryption is enabled
        if (decrypt && history.length > 0 && address) {
          try {
            // Dynamic import to avoid circular dependency
            const { default: abeEncryption } = await import('../utils/encryption');
            
            // Get user attributes - call contract directly to avoid circular dependency
            let userAttributes = null;
            try {
              // Check if user exists
              const userExists = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "CHECK_USER_EXISTS",
                args: [address],
              });

              if (userExists) {
                // Get user type
                const userInfo = await publicClient.readContract({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: "GET_USERNAME_TYPE",
                  args: [address],
                });

                if (userInfo) {
                  const role = userInfo.userType;
                  let doctorId = null;
                  
                  if (role === 'doctor') {
                    try {
                      const doctorIdResult = await publicClient.readContract({
                        address: CONTRACT_ADDRESS,
                        abi: CONTRACT_ABI,
                        functionName: "GET_DOCTOR_ID",
                        args: [address],
                      });
                      doctorId = Number(doctorIdResult);
                    } catch (e) {
                      // Doctor not registered
                    }
                  }
                  
                  userAttributes = abeEncryption.getUserAttributes(
                    address,
                    role,
                    role === 'patient' ? patientId : null,
                    doctorId
                  );
                }
              }
            } catch (e) {
              console.warn('Could not get user attributes for decryption:', e);
            }
            
            if (userAttributes) {
              // Decrypt each entry
              const decryptedHistory = await Promise.all(
                history.map(async (entry) => {
                  try {
                    // Check if it's encrypted (JSON with encryptedData)
                    const parsed = JSON.parse(entry);
                    if (parsed.encryptedData && parsed.encryptedKey) {
                      // Decrypt
                      const decrypted = await abeEncryption.decrypt(
                        parsed,
                        userAttributes
                      );
                      return decrypted.entry;
                    }
                    // Not encrypted, return as-is
                    return entry;
                  } catch (e) {
                    // Not JSON or decryption failed, return original
                    return entry;
                  }
                })
              );
              return decryptedHistory;
            }
          } catch (decryptError) {
            console.warn('Decryption failed, returning encrypted data:', decryptError);
            // Return encrypted data if decryption fails
          }
        }
        
        return history;
      } catch (error) {
        console.error("Error fetching medical history:", error);
        return [];
      }
    },
    [publicClient, isContractDeployed, address]
  );

  const getPatientPrescriptions = useCallback(
    async (patientId) => {
      try {
        if (!publicClient || !patientId) return [];
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return [];
        }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return [];
        }

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
        const deployed = await isContractDeployed();
        if (!deployed) {
          toast.error("Contract not found on current network. Check wallet network and NEXT_PUBLIC_CONTRACT_ADDRESS.");
          return [];
        }

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
