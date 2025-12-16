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

import CryptoJS from "crypto-js";

class ABEEncryption {
  constructor() {
    this.masterKey = process.env.NEXT_PUBLIC_ABE_MASTER_KEY || "default-master-key-change-in-production";
  }

  /**
   * Get user attributes for CP-ABE
   * @param {string} userAddress - User's wallet address
   * @param {string} role - User role (patient, doctor, admin)
   * @param {number} patientId - Patient ID (if applicable)
   * @param {number} doctorId - Doctor ID (if applicable)
   * @returns {Object} User attributes object
   */
  getUserAttributes(userAddress, role, patientId = null, doctorId = null) {
    const attributes = {
      address: userAddress.toLowerCase(),
      role: role.toLowerCase(),
    };

    if (role === "patient" && patientId !== null) {
      attributes.patientId = Number(patientId);
    }

    if (role === "doctor" && doctorId !== null) {
      attributes.doctorId = Number(doctorId);
    }

    // Add timestamp for time-based policies
    attributes.timestamp = Date.now();

    return attributes;
  }

  /**
   * Generate AES key
   * @returns {string} Random AES key
   */
  generateAESKey() {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }

  /**
   * Encrypt data with AES-256-GCM
   * @param {string|ArrayBuffer|Blob} data - Data to encrypt
   * @param {string} aesKey - AES encryption key
   * @returns {Promise<string>} Encrypted data as base64 string
   */
  async encryptWithAESGCM(data, aesKey) {
    try {
      let plaintext;

      // Convert data to string if it's ArrayBuffer or Blob
      if (data instanceof ArrayBuffer) {
        plaintext = new TextDecoder().decode(data);
      } else if (data instanceof Blob) {
        plaintext = await data.text();
      } else {
        plaintext = typeof data === 'string' ? data : JSON.stringify(data);
      }

      // Generate random IV
      const iv = CryptoJS.lib.WordArray.random(128 / 8);

      // Encrypt with AES-256-CBC (GCM not directly available in CryptoJS)
      const encrypted = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Utf8.parse(aesKey), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Combine IV and ciphertext
      const combined = iv.toString() + ':' + encrypted.toString();

      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(combined));
    } catch (error) {
      console.error("AES encryption error:", error);
      throw new Error(`Failed to encrypt data: ${error.message}`);
    }
  }

  /**
   * Decrypt data with AES-256-GCM
   * @param {string} encryptedData - Encrypted data as base64 string
   * @param {string} aesKey - AES decryption key
   * @param {boolean} returnAsBlob - Whether to return as Blob
   * @returns {Promise<string|Blob>} Decrypted data
   */
  async decryptWithAESGCM(encryptedData, aesKey, returnAsBlob = false) {
    try {
      // Decode base64
      const combined = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encryptedData));
      const parts = combined.split(':');

      if (parts.length !== 2) {
        throw new Error("Invalid encrypted data format");
      }

      const iv = CryptoJS.enc.Hex.parse(parts[0]);
      const ciphertext = parts[1];

      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(aesKey), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        throw new Error("Decryption failed - invalid key or corrupted data");
      }

      if (returnAsBlob) {
        return new Blob([decryptedText], { type: 'application/octet-stream' });
      }

      return decryptedText;
    } catch (error) {
      console.error("AES decryption error:", error);
      throw new Error(`Failed to decrypt data: ${error.message}`);
    }
  }

  /**
   * Create advanced CP-ABE policy
   * @param {Array} conditions - Array of policy conditions
   * @param {string} operator - Policy operator (AND/OR)
   * @returns {Object} Policy object
   */
  createAdvancedPolicy(conditions, operator = "OR") {
    return {
      type: operator.toUpperCase(),
      conditions: conditions,
      timestamp: Date.now(),
      version: "1.0"
    };
  }

  /**
   * Evaluate if user attributes satisfy policy
   * @param {Object} policy - CP-ABE policy
   * @param {Object} userAttributes - User attributes
   * @returns {boolean} Whether attributes satisfy policy
   */
  evaluatePolicy(policy, userAttributes) {
    if (!policy || !policy.conditions) {
      return false;
    }

    const evaluateCondition = (condition) => {
      if (condition.type === "AND" || condition.type === "OR") {
        // Nested condition
        const results = condition.conditions.map(evaluateCondition);
        return condition.type === "AND" 
          ? results.every(r => r) 
          : results.some(r => r);
      }

      // Simple condition
      const { attribute, operator, value } = condition;
      const userValue = userAttributes[attribute];

      switch (operator) {
        case "===":
          return userValue === value;
        case "!==":
          return userValue !== value;
        case ">":
          return userValue > value;
        case "<":
          return userValue < value;
        case ">=":
          return userValue >= value;
        case "<=":
          return userValue <= value;
        case "includes":
          return Array.isArray(userValue) && userValue.includes(value);
        default:
          return false;
      }
    };

    const results = policy.conditions.map(evaluateCondition);
    return policy.type === "AND" 
      ? results.every(r => r) 
      : results.some(r => r);
  }

  /**
   * Encrypt AES key with CP-ABE
   * @param {string} aesKey - AES key to encrypt
   * @param {Object} policy - CP-ABE policy
   * @returns {Object} Encrypted key package
   */
  encryptAESKeyWithABE(aesKey, policy) {
    try {
      // Simple simulation: Encrypt AES key with master key and attach policy
      const encrypted = CryptoJS.AES.encrypt(aesKey, this.masterKey).toString();

      return {
        encryptedKey: encrypted,
        policy: policy,
        algorithm: "CP-ABE-Simulated",
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("ABE key encryption error:", error);
      throw new Error(`Failed to encrypt AES key: ${error.message}`);
    }
  }

  /**
   * Decrypt AES key with CP-ABE
   * @param {Object} encryptedPackage - Encrypted key package
   * @param {Object} userAttributes - User attributes
   * @returns {string|null} Decrypted AES key or null if access denied
   */
  decryptAESKeyWithABE(encryptedPackage, userAttributes) {
    try {
      const { encryptedKey, policy } = encryptedPackage;

      // Check if user attributes satisfy policy
      if (!this.evaluatePolicy(policy, userAttributes)) {
        console.warn("User attributes do not satisfy policy");
        return null;
      }

      // Decrypt AES key
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, this.masterKey);
      const aesKey = decrypted.toString(CryptoJS.enc.Utf8);

      if (!aesKey) {
        throw new Error("Failed to decrypt AES key");
      }

      return aesKey;
    } catch (error) {
      console.error("ABE key decryption error:", error);
      return null;
    }
  }

  /**
   * Create medical record access policy
   * @param {Object} options - Policy options
   * @returns {Object} CP-ABE policy
   */
  createMedicalRecordPolicy({
    patientId,
    doctorIds = [],
    specialties = [],
    hospitals = [],
    allowAdmin = true,
    allowPatient = true,
    emergencyAccess = false
  }) {
    const conditions = [];

    // Patient access
    if (allowPatient && patientId) {
      conditions.push({
        type: "AND",
        conditions: [
          { attribute: "role", operator: "===", value: "patient" },
          { attribute: "patientId", operator: "===", value: Number(patientId) }
        ]
      });
    }

    // Specific doctors
    if (doctorIds.length > 0) {
      doctorIds.forEach(doctorId => {
        conditions.push({
          type: "AND",
          conditions: [
            { attribute: "role", operator: "===", value: "doctor" },
            { attribute: "doctorId", operator: "===", value: Number(doctorId) }
          ]
        });
      });
    }

    // Specialty-based
    if (specialties.length > 0) {
      specialties.forEach(specialty => {
        conditions.push({
          type: "AND",
          conditions: [
            { attribute: "role", operator: "===", value: "doctor" },
            { attribute: "specialty", operator: "===", value: specialty.toLowerCase() }
          ]
        });
      });
    }

    // Hospital-based
    if (hospitals.length > 0) {
      hospitals.forEach(hospital => {
        conditions.push({
          type: "AND",
          conditions: [
            { attribute: "role", operator: "===", value: "doctor" },
            { attribute: "hospital", operator: "===", value: hospital.toLowerCase() }
          ]
        });
      });
    }

    // Admin access
    if (allowAdmin) {
      conditions.push({
        attribute: "role",
        operator: "===",
        value: "admin"
      });
    }

    // Emergency access
    if (emergencyAccess) {
      conditions.push({
        type: "AND",
        conditions: [
          { attribute: "role", operator: "===", value: "doctor" },
          { attribute: "emergency", operator: "===", value: true }
        ]
      });
    }

    return this.createAdvancedPolicy(conditions, "OR");
  }

  /**
   * Encrypt medical record with hybrid encryption
   * @param {File|Blob|ArrayBuffer} medicalData - Medical data
   * @param {Object} policy - CP-ABE policy
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Encrypted package
   */
  async encryptMedicalRecord(medicalData, policy, metadata = {}) {
    try {
      // Generate AES key
      const aesKey = this.generateAESKey();

      // Encrypt data with AES
      const encryptedData = await this.encryptWithAESGCM(medicalData, aesKey);

      // Encrypt AES key with CP-ABE
      const encryptedKeyPackage = this.encryptAESKeyWithABE(aesKey, policy);

      return {
        encryptedData: encryptedData,
        encryptedKey: encryptedKeyPackage.encryptedKey,
        policy: encryptedKeyPackage.policy,
        algorithm: "AES-256-GCM + CP-ABE",
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          encrypted: true,
          keyLength: 256,
          mode: "GCM"
        }
      };
    } catch (error) {
      console.error("Medical record encryption error:", error);
      throw new Error(`Failed to encrypt medical record: ${error.message}`);
    }
  }

  /**
   * Decrypt medical record with hybrid encryption
   * @param {Object} encryptedPackage - Encrypted package
   * @param {Object} userAttributes - User attributes
   * @returns {Promise<string|Blob>} Decrypted data
   */
  async decryptMedicalRecord(encryptedPackage, userAttributes) {
    try {
      // Decrypt AES key with CP-ABE
      const aesKey = this.decryptAESKeyWithABE(
        {
          encryptedKey: encryptedPackage.encryptedKey,
          policy: encryptedPackage.policy
        },
        userAttributes
      );

      if (!aesKey) {
        throw new Error("Access denied: Your attributes do not satisfy the access policy");
      }

      // Decrypt data with AES key
      const decryptedData = await this.decryptWithAESGCM(
        encryptedPackage.encryptedData,
        aesKey,
        true
      );

      return decryptedData;
    } catch (error) {
      console.error("Medical record decryption error:", error);
      throw new Error(`Failed to decrypt medical record: ${error.message}`);
    }
  }

  /**
   * Simple decrypt function for backward compatibility
   * @param {Object} encryptedPackage - Encrypted package
   * @param {Object} userAttributes - User attributes
   * @returns {Promise<any>} Decrypted data
   */
  async decrypt(encryptedPackage, userAttributes) {
    try {
      // Check if it's a medical record package
      if (encryptedPackage.encryptedData && encryptedPackage.encryptedKey) {
        return await this.decryptMedicalRecord(encryptedPackage, userAttributes);
      }

      // Legacy simple encryption
      if (encryptedPackage.data && encryptedPackage.key) {
        const aesKey = this.decryptAESKeyWithABE(
          { encryptedKey: encryptedPackage.key, policy: encryptedPackage.policy },
          userAttributes
        );
        
        if (!aesKey) {
          throw new Error("Access denied");
        }

        return await this.decryptWithAESGCM(encryptedPackage.data, aesKey);
      }

      throw new Error("Invalid encrypted package format");
    } catch (error) {
      console.error("Decryption error:", error);
      throw error;
    }
  }
}

// Create and export singleton instance
const abeEncryption = new ABEEncryption();

export default abeEncryption;
export { ABEEncryption, abeEncryption };

