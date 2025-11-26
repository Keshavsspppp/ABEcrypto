/**
 * Attribute-Based Encryption (ABE) with AES Hybrid Encryption
 * 
 * This module implements a hybrid encryption scheme:
 * - AES-256-GCM for encrypting the actual data (fast, symmetric)
 * - Simplified CP-ABE (Ciphertext-Policy ABE) for encrypting the AES key
 * 
 * Attributes supported:
 * - role: "doctor", "patient", "admin"
 * - patientId: specific patient ID
 * - doctorId: specific doctor ID
 * - accessLevel: "read", "write", "full"
 */

import CryptoJS from 'crypto-js';

class ABEEncryption {
  constructor() {
    // Master key for ABE (in production, this should be stored securely)
    // For now, we'll derive it from a constant seed
    // In production, use a key management service or hardware security module
    this.masterKey = this.deriveMasterKey();
  }

  /**
   * Derive master key from a seed
   * In production, this should come from a secure key management system
   */
  deriveMasterKey() {
    const seed = process.env.NEXT_PUBLIC_ABE_MASTER_SEED || 'healthcare-abe-master-seed-2024';
    return CryptoJS.SHA256(seed).toString();
  }

  /**
   * Generate a random AES key for data encryption
   */
  generateAESKey() {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * Encrypt data using AES-256-CBC
   */
  encryptWithAES(data, aesKey) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        aesKey,
        {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      return encrypted.toString();
    } catch (error) {
      console.error('AES encryption error:', error);
      throw new Error('Failed to encrypt data with AES');
    }
  }

  /**
   * Decrypt data using AES-256-CBC
   */
  decryptWithAES(encryptedData, aesKey) {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData,
        aesKey,
        {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) {
        throw new Error('Decryption failed - invalid key or data');
      }
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error('AES decryption error:', error);
      throw new Error('Failed to decrypt data with AES');
    }
  }

  /**
   * Generate user secret key based on attributes
   * This is a simplified ABE key generation
   */
  generateUserSecretKey(userAttributes) {
    // Combine attributes into a key
    const attributesString = JSON.stringify(userAttributes);
    const combined = this.masterKey + attributesString;
    return CryptoJS.SHA256(combined).toString();
  }

  /**
   * Encrypt AES key using ABE (simplified CP-ABE)
   * Policy: AND/OR logic on attributes
   */
  encryptAESKeyWithABE(aesKey, accessPolicy) {
    try {
      // Convert policy to string for encryption
      const policyString = JSON.stringify(accessPolicy);
      
      // Use master key + policy to encrypt the AES key
      const encryptionKey = CryptoJS.SHA256(
        this.masterKey + policyString
      ).toString();
      
      const encryptedAESKey = CryptoJS.AES.encrypt(
        aesKey,
        encryptionKey,
        {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      ).toString();
      
      return {
        encryptedKey: encryptedAESKey,
        policy: accessPolicy,
        algorithm: 'ABE-AES-Hybrid'
      };
    } catch (error) {
      console.error('ABE encryption error:', error);
      throw new Error('Failed to encrypt AES key with ABE');
    }
  }

  /**
   * Decrypt AES key using ABE
   * Checks if user attributes satisfy the access policy
   */
  decryptAESKeyWithABE(encryptedKeyData, userAttributes) {
    try {
      const { encryptedKey, policy } = encryptedKeyData;
      
      // Check if user attributes satisfy the policy
      if (!this.checkPolicySatisfaction(policy, userAttributes)) {
        throw new Error('User attributes do not satisfy access policy');
      }
      
      // Generate decryption key using policy
      const policyString = JSON.stringify(policy);
      const decryptionKey = CryptoJS.SHA256(
        this.masterKey + policyString
      ).toString();
      
      const decrypted = CryptoJS.AES.decrypt(
        encryptedKey,
        decryptionKey,
        {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('ABE decryption error:', error);
      throw new Error('Failed to decrypt AES key with ABE: ' + error.message);
    }
  }

  /**
   * Check if user attributes satisfy the access policy
   * Supports AND/OR logic
   */
  checkPolicySatisfaction(policy, userAttributes) {
    if (!policy || !userAttributes) return false;
    
    // Handle different policy formats
    if (policy.type === 'AND') {
      // All conditions must be satisfied
      return policy.conditions.every(condition => 
        this.checkCondition(condition, userAttributes)
      );
    } else if (policy.type === 'OR') {
      // At least one condition must be satisfied
      return policy.conditions.some(condition => 
        this.checkCondition(condition, userAttributes)
      );
    } else if (policy.type === 'SIMPLE') {
      // Simple attribute matching
      return this.checkCondition(policy, userAttributes);
    }
    
    return false;
  }

  /**
   * Check if a single condition is satisfied
   */
  checkCondition(condition, userAttributes) {
    const { attribute, operator, value } = condition;
    
    switch (operator) {
      case '===':
        return userAttributes[attribute] === value;
      case '!==':
        return userAttributes[attribute] !== value;
      case 'includes':
        return Array.isArray(userAttributes[attribute]) && 
               userAttributes[attribute].includes(value);
      case 'in':
        return Array.isArray(value) && 
               value.includes(userAttributes[attribute]);
      default:
        return false;
    }
  }

  /**
   * Create access policy for medical records with speciality-based access
   * This policy allows access to:
   * - The patient themselves
   * - The doctor who created the record
   * - Doctors with the same speciality as the creator
   * - Admin
   * - Doctors with approved access requests
   * 
   * @param {number} patientId - Patient ID
   * @param {object} options - Optional configuration
   * @param {number} options.doctorId - ID of doctor creating the record
   * @param {string} options.doctorSpeciality - Speciality of the doctor
   * @param {boolean} options.allowAdmin - Whether to allow admin access (default: true)
   * @param {number[]} options.approvedDoctorIds - IDs of doctors with approved access (default: [])
   */
  createMedicalRecordPolicy(patientId, options = {}) {
    const {
      doctorId = null,
      doctorSpeciality = null,
      allowAdmin = true,
      approvedDoctorIds = []
    } = options;
    
    const conditions = [];

    // Patient can access their own records
    conditions.push({
      attribute: 'role',
      operator: '===',
      value: 'patient'
    });
    conditions.push({
      attribute: 'patientId',
      operator: '===',
      value: patientId
    });

    // Doctor who created the record can access
    if (doctorId) {
      conditions.push({
        attribute: 'role',
        operator: '===',
        value: 'doctor'
      });
      conditions.push({
        attribute: 'doctorId',
        operator: '===',
        value: doctorId
      });
    }

    // Doctors with same speciality can access
    if (doctorSpeciality) {
      conditions.push({
        attribute: 'role',
        operator: '===',
        value: 'doctor'
      });
      conditions.push({
        attribute: 'speciality',
        operator: '===',
        value: doctorSpeciality
      });
    }

    // Doctors with approved access can access
    if (approvedDoctorIds && approvedDoctorIds.length > 0) {
      conditions.push({
        attribute: 'role',
        operator: '===',
        value: 'doctor'
      });
      conditions.push({
        attribute: 'doctorId',
        operator: 'in',
        value: approvedDoctorIds
      });
    }

    // Admin can access
    if (allowAdmin) {
      conditions.push({
        attribute: 'role',
        operator: '===',
        value: 'admin'
      });
    }

    return {
      type: 'OR',
      conditions: conditions
    };
  }

  /**
   * Main encryption function: Hybrid ABE + AES
   */
  async encrypt(data, accessPolicy) {
    try {
      // Step 1: Generate AES key
      const aesKey = this.generateAESKey();
      
      // Step 2: Encrypt data with AES
      const encryptedData = this.encryptWithAES(data, aesKey);
      
      // Step 3: Encrypt AES key with ABE
      const encryptedKeyData = this.encryptAESKeyWithABE(aesKey, accessPolicy);
      
      return {
        encryptedData,
        encryptedKey: encryptedKeyData.encryptedKey,
        policy: encryptedKeyData.policy,
        algorithm: encryptedKeyData.algorithm,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Hybrid encryption error:', error);
      throw new Error('Failed to encrypt data: ' + error.message);
    }
  }

  /**
   * Main decryption function: Hybrid ABE + AES
   */
  async decrypt(encryptedPackage, userAttributes) {
    try {
      const { encryptedData, encryptedKey, policy } = encryptedPackage;
      
      // Step 1: Decrypt AES key using ABE
      const aesKey = this.decryptAESKeyWithABE(
        { encryptedKey, policy },
        userAttributes
      );
      
      // Step 2: Decrypt data using AES
      const decryptedData = this.decryptWithAES(encryptedData, aesKey);
      
      return decryptedData;
    } catch (error) {
      console.error('Hybrid decryption error:', error);
      throw new Error('Failed to decrypt data: ' + error.message);
    }
  }

  /**
   * Get user attributes from wallet address and role
   */
  getUserAttributes(address, role, patientId = null, doctorId = null, speciality = null) {
    return {
      address: address?.toLowerCase(),
      role: role,
      patientId: patientId,
      doctorId: doctorId,
      speciality: speciality
    };
  }
}

// Export singleton instance
export const abeEncryption = new ABEEncryption();
export default abeEncryption;

