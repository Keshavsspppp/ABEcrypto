/**
 * Hook for handling encryption/decryption in components
 * Provides easy access to ABE encryption with user context
 */

import { useAccount } from 'wagmi';
import { useState, useCallback } from 'react';
import abeEncryption from '../utils/encryption';
import { useHealthcareContract } from './useContract';

export const useEncryption = () => {
  const { address } = useAccount();
  const { getPatientId, getDoctorId, getUserType } = useHealthcareContract();
  const [loading, setLoading] = useState(false);

  /**
   * Get user attributes for encryption/decryption
   */
  const getUserAttributes = useCallback(async () => {
    if (!address) return null;

    try {
      const userInfo = await getUserType(address);
      if (!userInfo) return null;

      const role = userInfo.userType;
      let patientId = null;
      let doctorId = null;

      if (role === 'patient') {
        try {
          patientId = await getPatientId(address);
        } catch (e) {
          // Patient not registered yet
        }
      } else if (role === 'doctor') {
        try {
          doctorId = await getDoctorId(address);
        } catch (e) {
          // Doctor not registered yet
        }
      }

      return abeEncryption.getUserAttributes(address, role, patientId, doctorId);
    } catch (error) {
      console.error('Error getting user attributes:', error);
      return null;
    }
  }, [address, getUserType, getPatientId, getDoctorId]);

  /**
   * Encrypt medical history entry
   */
  const encryptMedicalHistory = useCallback(async (entry, patientId, doctorId = null) => {
    try {
      setLoading(true);
      const accessPolicy = abeEncryption.createMedicalRecordPolicy(
        patientId,
        doctorId,
        true // allow admin
      );

      // Encrypt the entry
      const encryptedPackage = await abeEncryption.encrypt(
        { entry, timestamp: new Date().toISOString() },
        accessPolicy
      );

      // Convert to string for blockchain storage
      // Note: For large entries, consider storing on IPFS instead
      return JSON.stringify(encryptedPackage);
    } catch (error) {
      console.error('Error encrypting medical history:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDecryptedEntry = (payload) => {
    if (!payload) return "";

    if (typeof payload === "string") {
      return payload;
    }

    const baseEntry =
      typeof payload.entry === "string"
        ? payload.entry
        : JSON.stringify(payload.entry ?? payload);
    const updatedBy = payload.updatedBy;
    const timestamp = payload.timestamp;

    if (!updatedBy && !timestamp) {
      return baseEntry;
    }

    let metaLine = "— Updated";
    if (updatedBy) {
      metaLine += ` by ${updatedBy}`;
    }
    if (timestamp) {
      const readable = new Date(timestamp).toLocaleString();
      metaLine += ` on ${readable}`;
    }

    return `${baseEntry}\n\n${metaLine}`;
  };

  /**
   * Decrypt medical history entry
   */
  const decryptMedicalHistory = useCallback(async (encryptedEntryString) => {
    try {
      setLoading(true);
      
      // Check if it's encrypted (has encryptedData field)
      let encryptedPackage;
      try {
        encryptedPackage = JSON.parse(encryptedEntryString);
        if (!encryptedPackage.encryptedData) {
          // Not encrypted, return as-is (backward compatibility)
          return encryptedEntryString;
        }
      } catch (e) {
        // Not JSON, probably plain text (backward compatibility)
        return encryptedEntryString;
      }

      // Get user attributes
      const userAttributes = await getUserAttributes();
      if (!userAttributes) {
        throw new Error('Unable to get user attributes for decryption');
      }

      // Decrypt
      const decrypted = await abeEncryption.decrypt(
        encryptedPackage,
        userAttributes
      );

      return formatDecryptedEntry(decrypted);
    } catch (error) {
      console.error('Error decrypting medical history:', error);
      // If decryption fails, return the original (might be plain text)
      return encryptedEntryString;
    } finally {
      setLoading(false);
    }
  }, [getUserAttributes]);

  /**
   * Decrypt array of medical history entries
   */
  const decryptMedicalHistoryArray = useCallback(async (encryptedEntries) => {
    if (!Array.isArray(encryptedEntries)) return [];

    try {
      const decryptedEntries = await Promise.all(
        encryptedEntries.map(entry => decryptMedicalHistory(entry))
      );
      return decryptedEntries;
    } catch (error) {
      console.error('Error decrypting medical history array:', error);
      return encryptedEntries; // Return original on error
    }
  }, [decryptMedicalHistory]);

  /**
   * Encrypt patient profile data for IPFS
   */
  const encryptPatientProfile = useCallback(async (profileData, patientId, doctorId = null) => {
    try {
      setLoading(true);
      const accessPolicy = abeEncryption.createMedicalRecordPolicy(
        patientId,
        doctorId,
        true
      );

      const encryptedPackage = await abeEncryption.encrypt(
        profileData,
        accessPolicy
      );

      return encryptedPackage;
    } catch (error) {
      console.error('Error encrypting patient profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Decrypt patient profile data from IPFS
   */
  const decryptPatientProfile = useCallback(async (encryptedPackage) => {
    try {
      setLoading(true);
      
      // Check if encrypted
      if (!encryptedPackage.encryptedData || !encryptedPackage.encryptedKey) {
        // Not encrypted, return as-is
        return encryptedPackage;
      }

      const userAttributes = await getUserAttributes();
      if (!userAttributes) {
        throw new Error('Unable to get user attributes for decryption');
      }

      const decrypted = await abeEncryption.decrypt(
        encryptedPackage,
        userAttributes
      );

      return decrypted;
    } catch (error) {
      console.error('Error decrypting patient profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getUserAttributes]);

  return {
    encryptMedicalHistory,
    decryptMedicalHistory,
    decryptMedicalHistoryArray,
    encryptPatientProfile,
    decryptPatientProfile,
    getUserAttributes,
    loading,
  };
};

export default useEncryption;

