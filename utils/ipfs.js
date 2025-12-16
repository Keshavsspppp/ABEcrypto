import { PINATA_JWT, PINATA_GATEWAY } from "../config/contract";
import abeEncryption from "./encryption";

const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  } catch (e) {
    // Fallback: attempt shallow normalization of common BigInt fields
    const normalize = (v) => (typeof v === "bigint" ? v.toString() : v);
    const shallow = Array.isArray(obj)
      ? obj.map(normalize)
      : Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, normalize(v)]));
    return JSON.stringify(shallow);
  }
};

class IPFSService {
  constructor() {
    this.pinataJWT = PINATA_JWT;
    this.gateway = PINATA_GATEWAY;
    
    // Debug logging in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[IPFS Service] Initialized with JWT:', !!this.pinataJWT, this.pinataJWT ? `(length: ${this.pinataJWT.length})` : 'MISSING');
      console.log('[IPFS Service] Gateway:', this.gateway);
      
      if (!this.pinataJWT) {
        console.warn('[IPFS Service] WARNING: Pinata JWT is not configured. EMR uploads will fail.');
        console.warn('[IPFS Service] Please set NEXT_PUBLIC_PINATA_JWT in .env.local and restart the dev server.');
      }
    }
  }

  async uploadToIPFS(file, metadata = {}) {
    try {
      // Check if Pinata JWT is configured
      if (!this.pinataJWT) {
        console.error("Pinata JWT is missing. Check NEXT_PUBLIC_PINATA_JWT in .env.local");
        throw new Error(
          "Pinata JWT is not configured. Please set NEXT_PUBLIC_PINATA_JWT in your .env.local file. Get your JWT from https://app.pinata.cloud/"
        );
      }
      
      // Do not log JWT to avoid leaking secrets in the browser console

      const formData = new FormData();
      formData.append("file", file);

      const pinataMetadata = JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || "healthcare-file",
          uploadedAt: new Date().toISOString(),
          ...metadata.keyvalues,
        },
      });

      formData.append("pinataMetadata", pinataMetadata);

      formData.append(
        "pinataOptions",
        JSON.stringify({
          cidVersion: 1,
        })
      );

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.pinataJWT}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorText = "";
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          errorText = await response.text();
          console.error("Pinata API Error Response:", errorText);
        } catch (e) {
          console.error("Could not read error response:", e);
        }
        
        if (response.status === 403) {
          // Try to parse Pinata's error response for more details
          try {
            const errorJson = JSON.parse(errorText);
            const pinataError = errorJson.error?.details || errorJson.error?.reason || errorJson.error?.message || "";
            errorMessage = `Pinata authentication failed (403): ${pinataError || "Invalid or missing JWT token"}. Please check your NEXT_PUBLIC_PINATA_JWT in .env.local file. Get your JWT from https://app.pinata.cloud/`;
          } catch (e) {
            errorMessage = "Pinata authentication failed (403). Please check your NEXT_PUBLIC_PINATA_JWT in .env.local file. Get your JWT from https://app.pinata.cloud/";
          }
        } else if (response.status === 401) {
          errorMessage = "Invalid Pinata JWT token (401). Please verify your token at https://app.pinata.cloud/";
        } else {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.details || errorJson.error?.reason || errorJson.error?.message || errorMessage;
          } catch (e) {
            // If parsing fails, use the default message
          }
        }
        
        console.error("Pinata Error:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return {
        hash: result.IpfsHash,
        url: `${this.gateway}/ipfs/${result.IpfsHash}`,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
      };
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    }
  }

  async uploadJSONToIPFS(jsonData, metadata = {}) {
    try {
      // Check if Pinata JWT is configured
      if (!this.pinataJWT) {
        console.error("Pinata JWT is missing. Check NEXT_PUBLIC_PINATA_JWT in .env.local");
        throw new Error(
          "Pinata JWT is not configured. Please set NEXT_PUBLIC_PINATA_JWT in your .env.local file. Get your JWT from https://app.pinata.cloud/"
        );
      }

      const payload = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: metadata.name || "healthcare-metadata",
          keyvalues: {
            type: metadata.type || "healthcare-json",
            uploadedAt: new Date().toISOString(),
            ...(metadata.keyvalues || {}),
          },
        },
        pinataOptions: {
          cidVersion: 1,
        },
      };

      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.pinataJWT}`,
        },
        body: safeStringify(payload),
      });

      if (!response.ok) {
        let errorText = "";
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          errorText = await response.text();
          console.error("Pinata API Error Response:", errorText);
        } catch (e) {
          console.error("Could not read error response:", e);
        }
        
        if (response.status === 403) {
          // Try to parse Pinata's error response for more details
          try {
            const errorJson = JSON.parse(errorText);
            const pinataError = errorJson.error?.details || errorJson.error?.reason || errorJson.error?.message || "";
            errorMessage = `Pinata authentication failed (403): ${pinataError || "Invalid or missing JWT token"}. Please check your NEXT_PUBLIC_PINATA_JWT in .env.local file. Get your JWT from https://app.pinata.cloud/`;
          } catch (e) {
            errorMessage = "Pinata authentication failed (403). Please check your NEXT_PUBLIC_PINATA_JWT in .env.local file. Get your JWT from https://app.pinata.cloud/";
          }
        } else if (response.status === 401) {
          errorMessage = "Invalid Pinata JWT token (401). Please verify your token at https://app.pinata.cloud/";
        } else {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.details || errorJson.error?.reason || errorJson.error?.message || errorMessage;
          } catch (e) {
            // If parsing fails, use the default message
          }
        }
        
        console.error("Pinata Error:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return {
        hash: result.IpfsHash,
        url: `${this.gateway}/ipfs/${result.IpfsHash}`,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
      };
    } catch (error) {
      console.error("Error uploading JSON to IPFS:", error);
      throw error;
    }
  }

  async fetchFromIPFS(hash) {
    try {
      const response = await fetch(`${this.gateway}/ipfs/${hash}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching from IPFS:", error);
      throw error;
    }
  }

  async uploadDoctorProfile(profileData, profileImage) {
    try {
      let imageHash = null;
      if (profileImage) {
        const imageResult = await this.uploadToIPFS(profileImage, {
          name: `doctor-profile-${Date.now()}`,
          type: "doctor-profile-image",
        });
        imageHash = imageResult.hash;
      }

      const metadata = {
        ...profileData,
        profileImage: imageHash,
        timestamp: new Date().toISOString(),
        type: "doctor-profile",
      };

      const metadataResult = await this.uploadJSONToIPFS(metadata, {
        name: `doctor-metadata-${profileData.name || "unknown"}`,
        type: "doctor-metadata",
      });

      return {
        metadataHash: metadataResult.hash,
        metadataUrl: metadataResult.url,
        imageHash,
        imageUrl: imageHash ? `${this.gateway}/ipfs/${imageHash}` : null,
      };
    } catch (error) {
      console.error("Error uploading doctor profile:", error);
      throw error;
    }
  }

  async uploadPatientProfile(profileData, profileImage) {
    try {
      let imageHash = null;
      if (profileImage) {
        const imageResult = await this.uploadToIPFS(profileImage, {
          name: `patient-profile-${Date.now()}`,
          type: "patient-profile-image",
        });
        imageHash = imageResult.hash;
      }

      const metadata = {
        ...profileData,
        profileImage: imageHash,
        timestamp: new Date().toISOString(),
        type: "patient-profile",
      };

      const metadataResult = await this.uploadJSONToIPFS(metadata, {
        name: `patient-metadata-${profileData.name || "unknown"}`,
        type: "patient-metadata",
      });

      return {
        metadataHash: metadataResult.hash,
        metadataUrl: metadataResult.url,
        imageHash,
        imageUrl: imageHash ? `${this.gateway}/ipfs/${imageHash}` : null,
      };
    } catch (error) {
      console.error("Error uploading patient profile:", error);
      throw error;
    }
  }

  async uploadMedicineData(medicineData, medicineImage) {
    try {
      let imageHash = null;
      if (medicineImage) {
        const imageResult = await this.uploadToIPFS(medicineImage, {
          name: `medicine-image-${Date.now()}`,
          type: "medicine-image",
        });
        imageHash = imageResult.hash;
      }

      const metadata = {
        ...medicineData,
        medicineImage: imageHash,
        timestamp: new Date().toISOString(),
        type: "medicine-data",
      };

      const metadataResult = await this.uploadJSONToIPFS(metadata, {
        name: `medicine-metadata-${medicineData.name || "unknown"}`,
        type: "medicine-metadata",
      });

      return {
        metadataHash: metadataResult.hash,
        metadataUrl: metadataResult.url,
        imageHash,
        imageUrl: imageHash ? `${this.gateway}/ipfs/${imageHash}` : null,
      };
    } catch (error) {
      console.error("Error uploading medicine data:", error);
      throw error;
    }
  }

  getIPFSUrl(hash) {
    return `${this.gateway}/ipfs/${hash}`;
  }

  /**
   * Upload encrypted medical record to IPFS
   * Uses ABE + AES hybrid encryption
   */
  async uploadEncryptedMedicalRecord(
    medicalRecordData,
    accessPolicy,
    metadata = {}
  ) {
    try {
      // Encrypt the medical record data
      const encryptedPackage = await abeEncryption.encrypt(
        medicalRecordData,
        accessPolicy
      );

      // Upload encrypted package to IPFS
      const result = await this.uploadJSONToIPFS(encryptedPackage, {
        name: metadata.name || `encrypted-medical-record-${Date.now()}`,
        type: "encrypted-medical-record",
        keyvalues: {
          encrypted: "true",
          algorithm: "ABE-AES-Hybrid",
          ...metadata.keyvalues,
        },
      });

      return {
        ...result,
        encrypted: true,
        policy: accessPolicy,
      };
    } catch (error) {
      console.error("Error uploading encrypted medical record:", error);
      throw error;
    }
  }

  /**
   * Upload encrypted medical record with hybrid encryption
   * @param {File} file - Medical record file
   * @param {Object} policy - CP-ABE access policy
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Upload result with IPFS hash and encrypted key
   */
  async uploadEncryptedMedicalRecordFile(file, policy, metadata = {}) {
    try {
      if (!file) {
        throw new Error("File is required");
      }

      console.log("[IPFS] Starting encrypted medical record upload:", {
        fileName: file.name,
        fileSize: file.size,
        policyType: policy.type
      });

      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Encrypt with hybrid AES + CP-ABE
      const encryptedPackage = await abeEncryption.encryptMedicalRecord(
        fileBuffer,
        policy,
        {
          ...metadata,
          fileName: file.name,
          mimeType: file.type,
          originalSize: file.size
        }
      );

      // Upload encrypted data to IPFS
      const encryptedBlob = new Blob([encryptedPackage.encryptedData], {
        type: "application/octet-stream"
      });

      const dataResult = await this.uploadToIPFS(encryptedBlob, {
        name: `encrypted-medical-${Date.now()}.enc`,
        type: "encrypted-medical-data"
      });

      // Create metadata package with encrypted key
      const metadataPackage = {
        encryptedDataHash: dataResult.IpfsHash,
        encryptedKey: encryptedPackage.encryptedKey,
        policy: encryptedPackage.policy,
        algorithm: encryptedPackage.algorithm,
        timestamp: encryptedPackage.timestamp,
        metadata: encryptedPackage.metadata
      };

      // Upload metadata to IPFS
      const metadataResult = await this.uploadJSONToIPFS(metadataPackage, {
        name: `medical-metadata-${Date.now()}.json`,
        type: "medical-record-metadata",
        keyvalues: {
          encrypted: "true",
          algorithm: "AES-256-GCM+CP-ABE",
          ...metadata
        }
      });

      console.log("[IPFS] Medical record uploaded successfully:", {
        metadataHash: metadataResult.IpfsHash,
        dataHash: dataResult.IpfsHash
      });

      return {
        metadataHash: metadataResult.IpfsHash,
        dataHash: dataResult.IpfsHash,
        encryptedKey: encryptedPackage.encryptedKey,
        policy: encryptedPackage.policy,
        success: true
      };
    } catch (error) {
      console.error("[IPFS] Upload error:", error);
      throw new Error(`Failed to upload encrypted medical record: ${error.message}`);
    }
  }

  /**
   * Download and decrypt medical record
   * @param {string} metadataHash - IPFS hash of metadata
   * @param {Object} userAttributes - User's CP-ABE attributes
   * @returns {Promise<Object>} Decrypted medical record
   */
  async downloadAndDecryptMedicalRecord(metadataHash, userAttributes) {
    try {
      console.log("[IPFS] Downloading medical record:", { metadataHash });

      // Fetch metadata
      const metadata = await this.fetchFromIPFS(metadataHash);

      if (!metadata || !metadata.encryptedDataHash) {
        throw new Error("Invalid metadata structure");
      }

      // Fetch encrypted data
      const encryptedDataResponse = await fetch(
        this.getIPFSUrl(metadata.encryptedDataHash)
      );
      const encryptedData = await encryptedDataResponse.text();

      // Create encrypted package
      const encryptedPackage = {
        encryptedData: encryptedData,
        encryptedKey: metadata.encryptedKey,
        policy: metadata.policy,
        metadata: metadata.metadata
      };

      // Decrypt with user attributes
      const decryptedData = await abeEncryption.decryptMedicalRecord(
        encryptedPackage,
        userAttributes
      );

      console.log("[IPFS] Medical record decrypted successfully");

      return {
        data: decryptedData,
        metadata: metadata.metadata,
        timestamp: metadata.timestamp,
        success: true
      };
    } catch (error) {
      console.error("[IPFS] Download/decrypt error:", error);
      throw new Error(`Failed to access medical record: ${error.message}`);
    }
  }

  async uploadEncryptedPatientProfile(
    profileData,
    profileImage,
    patientId,
    doctorId = null
  ) {
    try {
      let imageHash = null;
      if (profileImage) {
        const imageResult = await this.uploadToIPFS(profileImage, {
          name: `patient-profile-${Date.now()}`,
          type: "patient-profile-image",
        });
        imageHash = imageResult.hash;
      }

      // Create access policy for patient profile
      const accessPolicy = abeEncryption.createMedicalRecordPolicy(
        patientId,
        doctorId,
        true // allow admin
      );

      // Encrypt sensitive profile data
      const sensitiveData = {
        ...profileData,
        profileImage: imageHash,
        timestamp: new Date().toISOString(),
        type: "patient-profile",
      };

      const encryptedPackage = await abeEncryption.encrypt(
        sensitiveData,
        accessPolicy
      );

      // Upload encrypted package
      const metadataResult = await this.uploadJSONToIPFS(encryptedPackage, {
        name: `encrypted-patient-profile-${profileData.name || "unknown"}`,
        type: "encrypted-patient-profile",
        keyvalues: {
          encrypted: "true",
          algorithm: "ABE-AES-Hybrid",
          patientId: patientId.toString(),
        },
      });

      return {
        metadataHash: metadataResult.hash,
        metadataUrl: metadataResult.url,
        imageHash,
        imageUrl: imageHash ? `${this.gateway}/ipfs/${imageHash}` : null,
        encrypted: true,
      };
    } catch (error) {
      console.error("Error uploading encrypted patient profile:", error);
      throw error;
    }
  }

  /**
   * Fetch and decrypt patient profile from IPFS
   */
  async fetchAndDecryptPatientProfile(hash, userAttributes) {
    try {
      const encryptedPackage = await this.fetchFromIPFS(hash);

      // Check if encrypted
      if (!encryptedPackage.encryptedData || !encryptedPackage.encryptedKey) {
        // Not encrypted, return as-is (backward compatibility)
        return encryptedPackage;
      }

      // Decrypt
      const decryptedData = await abeEncryption.decrypt(
        encryptedPackage,
        userAttributes
      );

      return decryptedData;
    } catch (error) {
      console.error("Error fetching and decrypting patient profile:", error);
      throw error;
    }
  }

  /**
   * Encrypt medical history entry
   */
  async encryptMedicalHistoryEntry(entry, patientId, doctorId = null) {
    try {
      const accessPolicy = abeEncryption.createMedicalRecordPolicy(
        patientId,
        doctorId,
        true
      );

      const encryptedPackage = await abeEncryption.encrypt(
        { entry, timestamp: new Date().toISOString() },
        accessPolicy
      );

      return encryptedPackage;
    } catch (error) {
      console.error("Error encrypting medical history entry:", error);
      throw error;
    }
  }

  /**
   * Decrypt medical history entry
   */
  async decryptMedicalHistoryEntry(encryptedEntry, userAttributes) {
    try {
      const decryptedData = await abeEncryption.decrypt(
        encryptedEntry,
        userAttributes
      );
      return decryptedData.entry;
    } catch (error) {
      console.error("Error decrypting medical history entry:", error);
      throw error;
    }
  }

  // Add: Upload encrypted EMR attachment (file + metadata) with AES-256-GCM
  async uploadEncryptedPatientEMRAttachment(file, { description, accessPolicy }, patientId, doctorId = null) {
    try {
      if (!file) throw new Error("No attachment file provided");
      
      // Check if Pinata JWT is configured
      if (!this.pinataJWT) {
        console.error("[EMR Upload] Pinata JWT is missing. Cannot upload file.");
        throw new Error(
          "Pinata JWT is not configured. Please set NEXT_PUBLIC_PINATA_JWT in your .env.local file and restart the dev server. Get your JWT from https://app.pinata.cloud/"
        );
      }

      // Use provided policy or create default policy
      let policy = accessPolicy;
      if (!policy) {
        policy = abeEncryption.createMedicalRecordPolicy(
          patientId,
          doctorId,
          true
        );
      }

      // Encrypt file with AES-256-GCM + CP-ABE
      console.log("Starting EMR file encryption...", { fileName: file.name, fileSize: file.size, policy });
      let encryptedEMR;
      try {
        encryptedEMR = await abeEncryption.encryptEMRFile(file, policy);
        console.log("File encrypted successfully", { encryptedSize: encryptedEMR.encryptedFileData?.length });
      } catch (encryptError) {
        console.error("Encryption failed:", encryptError);
        throw new Error(`File encryption failed: ${encryptError.message || encryptError}`);
      }

      // Upload encrypted file to IPFS (encryptedEMR.encryptedFileData is base64 string)
      // Convert base64 to blob for upload
      let encryptedFile;
      try {
        const binaryString = atob(encryptedEMR.encryptedFileData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const encryptedBlob = new Blob([bytes], { type: 'application/octet-stream' });
        encryptedFile = new File([encryptedBlob], `encrypted-${file.name}`, { type: 'application/octet-stream' });
        console.log("Converted encrypted file to blob", { blobSize: encryptedBlob.size });
      } catch (convertError) {
        console.error("Base64 to blob conversion failed:", convertError);
        throw new Error(`Failed to prepare encrypted file for upload: ${convertError.message || convertError}`);
      }
      
      let fileResult;
      try {
        fileResult = await this.uploadToIPFS(encryptedFile, {
        name: `patient-emr-encrypted-${patientId}-${Date.now()}`,
        type: "patient-emr-encrypted-file",
        keyvalues: { 
          patientId: patientId?.toString() || "",
          encrypted: "true",
          algorithm: "ABE-AES-GCM-Hybrid"
        },
        });
        console.log("Encrypted file uploaded to IPFS", { hash: fileResult.hash });
      } catch (uploadError) {
        console.error("IPFS file upload failed:", uploadError);
        throw new Error(`Failed to upload encrypted file to IPFS: ${uploadError.message || uploadError}`);
      }

      // Encrypt metadata with CP-ABE
      let encryptedMetadata;
      try {
        encryptedMetadata = await abeEncryption.encrypt(
        {
          description: description || "",
          encryptedFileHash: fileResult.hash,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          timestamp: new Date().toISOString(),
          type: "patient-emr-attachment",
          originalFileSize: file.size,
        },
        policy
        );
        console.log("Metadata encrypted successfully");
      } catch (metadataError) {
        console.error("Metadata encryption failed:", metadataError);
        throw new Error(`Failed to encrypt metadata: ${metadataError.message || metadataError}`);
      }

      // Store encrypted metadata + encrypted AES key reference
      const metadataPackage = {
        ...encryptedMetadata,
        encryptedFileHash: fileResult.hash,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        timestamp: new Date().toISOString(),
      };

      // Upload encrypted JSON metadata
      let jsonResult;
      try {
        jsonResult = await this.uploadJSONToIPFS(metadataPackage, {
        name: `patient-emr-attachment-${patientId}-${Date.now()}`,
        type: "patient-emr-attachment",
        keyvalues: {
          patientId: patientId?.toString() || "",
          encrypted: "true",
          algorithm: "ABE-AES-GCM-Hybrid",
        },
        });
        console.log("Metadata uploaded to IPFS", { hash: jsonResult.hash });
      } catch (metadataUploadError) {
        console.error("IPFS metadata upload failed:", metadataUploadError);
        throw new Error(`Failed to upload metadata to IPFS: ${metadataUploadError.message || metadataUploadError}`);
      }

      return {
        attachmentHash: jsonResult.hash,
        attachmentUrl: jsonResult.url,
        encryptedFileHash: fileResult.hash,
        encryptedFileUrl: `${this.gateway}/ipfs/${fileResult.hash}`,
        encrypted: true,
        policy: policy,
      };
    } catch (error) {
      console.error("Error uploading encrypted patient EMR attachment:", error);
      throw error;
    }
  }

  // Add: List patient EMR attachments (Pinata pinList)
  async listPatientEMRAttachments(patientId, pageLimit = 50) {
    try {
      if (!this.pinataJWT) {
        throw new Error("Pinata JWT not configured. Set NEXT_PUBLIC_PINATA_JWT.");
      }
      
      // Build query parameters for GET request
      // Pinata requires metadata queries in nested format: metadata[keyvalues][key][value] and metadata[keyvalues][key][op]
      const url = new URL("https://api.pinata.cloud/data/pinList");
      url.searchParams.set("status", "pinned");
      url.searchParams.set("pageLimit", pageLimit.toString());
      
      // Add metadata filters with proper format
      url.searchParams.set("metadata[keyvalues][type][value]", "patient-emr-attachment");
      url.searchParams.set("metadata[keyvalues][type][op]", "eq");
      
      // Only add patientId filter if patientId is provided
      if (patientId) {
        url.searchParams.set("metadata[keyvalues][patientId][value]", patientId.toString());
        url.searchParams.set("metadata[keyvalues][patientId][op]", "eq");
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.pinataJWT}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Pinata pinList error:", text);
        throw new Error(`Failed to list attachments: ${response.status}`);
      }

      const data = await response.json();
      const rows = data?.rows || [];
      return rows.map((r) => ({
        hash: r.ipfs_pin_hash,
        url: `${this.gateway}/ipfs/${r.ipfs_pin_hash}`,
        metadata: r.metadata,
        datePinned: r.date_pinned,
      }));
    } catch (error) {
      console.error("Error listing patient EMR attachments:", error);
      return [];
    }
  }

  // Add: Fetch and decrypt a patient EMR attachment metadata and file
  async fetchAndDecryptPatientEMRAttachment(hash, userAttributes) {
    try {
      const encryptedPackage = await this.fetchFromIPFS(hash);

      if (!encryptedPackage?.encryptedData || !encryptedPackage?.encryptedKey) {
        // Not encrypted (unlikely for attachments), return raw
        return encryptedPackage;
      }

      // Decrypt metadata
      const decryptedMetadata = await abeEncryption.decrypt(encryptedPackage, userAttributes);

      // Fetch and decrypt the actual encrypted file if hash exists
      let decryptedFileBlob = null;
      let fileUrl = null;
      
      if (decryptedMetadata.encryptedFileHash) {
        try {
          // Fetch encrypted file from IPFS
          const encryptedFileResponse = await fetch(`${this.gateway}/ipfs/${decryptedMetadata.encryptedFileHash}`);
          
          // Convert response to base64
          const arrayBuffer = await encryptedFileResponse.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const binaryString = String.fromCharCode.apply(null, uint8Array);
          const encryptedFileBase64 = btoa(binaryString);
          
          // Decrypt file using AES-256-GCM
          decryptedFileBlob = await abeEncryption.decryptEMRFile(
            {
              encryptedFileData: encryptedFileBase64,
              encryptedKey: encryptedPackage.encryptedKey,
              policy: encryptedPackage.policy
            },
            userAttributes,
            true // return as Blob
          );
          
          // Create object URL for viewing/downloading
          fileUrl = URL.createObjectURL(decryptedFileBlob);
        } catch (fileError) {
          console.error("Error decrypting EMR file:", fileError);
          // Continue without file if decryption fails
        }
      }

      return {
        ...decryptedMetadata,
        fileUrl: fileUrl,
        decryptedFileBlob: decryptedFileBlob,
        encryptedFileHash: decryptedMetadata.encryptedFileHash,
      };
    } catch (error) {
      console.error("Error fetching/decrypting patient EMR attachment:", error);
      throw error;
    }
  }

  /**
   * Generate a deterministic-ish UUID for request tracking
   */
  generateRequestId() {
    try {
      if (typeof crypto !== "undefined" && crypto?.randomUUID) {
        return crypto.randomUUID();
      }
      if (typeof crypto !== "undefined" && crypto?.getRandomValues) {
        const array = new Uint32Array(4);
        crypto.getRandomValues(array);
        return Array.from(array, (num) =>
          num.toString(16).padStart(8, "0")
        ).join("-");
      }
    } catch (error) {
      console.warn("UUID generation fallback triggered:", error);
    } 
    return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  /**
   * REMOVE: Create a doctor-to-patient medical record access request
   */
  // async createRecordAccessRequest({
  //   patientId,
  //   doctorId,
  //   doctorAddress,
  //   doctorName,
  //   doctorSpecialty,
  //   patientAddress,
  //   reason,
  //   recordIndex,
  //   recordType = "medicalHistory",
  //   recordLabel,
  // }) {
  //   if (!patientId || !doctorId) {
  //     throw new Error("Patient ID and doctor ID are required for access request");
  //   }

  //   const requestId = this.generateRequestId();
  //   const payload = {
  //     type: "medical-access-request",
  //     action: "request",
  //     status: "pending",
  //     requestId,
  //     patientId,
  //     patientAddress: patientAddress?.toLowerCase() || null,
  //     doctorId,
  //     doctorAddress: doctorAddress?.toLowerCase() || null,
  //     doctorName: doctorName || null,
  //     doctorSpecialty: doctorSpecialty || null,
  //     recordIndex,
  //     recordType,
  //     recordLabel: recordLabel || null,
  //     reason: reason || "",
  //     createdAt: new Date().toISOString(),
  //   };

  //   const metadata = {
  //     name: `medical-access-request-${requestId}`,
  //     type: "medical-access-request",
  //     keyvalues: {
  //       patientId: String(patientId),
  //       doctorId: String(doctorId),
  //       requestId,
  //       recordType,
  //     },
  //   };

  //   const result = await this.uploadJSONToIPFS(payload, metadata);
  //   return {
  //     requestId,
  //     hash: result.hash,
  //     url: result.url,
  //     payload,
  //   };
  // }

  /**
   * KEEP: Aggregate raw request/decision entries into consolidated requests
   * This is needed for displaying existing requests to patients
   */
  aggregateRecordAccessRequests(entries) {
    const map = {};
    entries.forEach((entry) => {
      const requestId =
        entry?.data?.requestId ||
        entry?.metadata?.requestId ||
        entry?.metadata?.keyvalues?.requestId;
      if (!requestId) return;

      if (!map[requestId]) {
        map[requestId] = {
          requestId,
          history: [],
        };
      }

      map[requestId].history.push(entry);

      if (entry.data?.action === "request" || !map[requestId].initial) {
        map[requestId].initial = {
          ...entry.data,
          ipfsHash: entry.ipfsHash,
          pinnedAt: entry.pinnedAt,
        };
        map[requestId].patientId = entry.data?.patientId;
        map[requestId].doctorId = entry.data?.doctorId;
        map[requestId].doctorSpecialty = entry.data?.doctorSpecialty;
        map[requestId].recordIndex = entry.data?.recordIndex ?? null;
        map[requestId].recordType = entry.data?.recordType || "medicalHistory";
        map[requestId].recordLabel = entry.data?.recordLabel || null;
        map[requestId].reason = entry.data?.reason || "";
        map[requestId].doctorName = entry.data?.doctorName || null;
        map[requestId].doctorAddress = entry.data?.doctorAddress || null;
        map[requestId].patientAddress = entry.data?.patientAddress || null;
        map[requestId].status = entry.data?.status || "pending";
        map[requestId].createdAt = entry.data?.createdAt || entry.pinnedAt;
      }

      if (entry.data?.action === "decision") {
        map[requestId].decision = {
          ...entry.data,
          ipfsHash: entry.ipfsHash,
          pinnedAt: entry.pinnedAt,
        };
        map[requestId].status = entry.data?.status || map[requestId].status;
        map[requestId].decisionMessage = entry.data?.decisionMessage || null;
        map[requestId].decisionAt = entry.data?.decisionAt || entry.pinnedAt;
        map[requestId].grantPackage = entry.data?.grantPackage || null;
      }
    });

    return Object.values(map)
      .map((request) => ({
        ...request,
        history: request.history.sort(
          (a, b) =>
            new Date(a.data?.createdAt || a.pinnedAt || 0) -
            new Date(b.data?.createdAt || b.pinnedAt || 0)
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.decisionAt || b.createdAt || 0) -
          new Date(a.decisionAt || a.createdAt || 0)
      );
  }

  /**
   * KEEP: List record access requests filtered by patient/doctor
   * This is needed for patients to view their pending requests
   */
  async listRecordAccessRequests({ patientId, doctorId, recordType, pageLimit = 50 } = {}) {
    try {
      if (!this.pinataJWT) {
        throw new Error("Pinata JWT not configured. Set NEXT_PUBLIC_PINATA_JWT.");
      }

      const url = new URL("https://api.pinata.cloud/data/pinList");
      url.searchParams.set("status", "pinned");
      url.searchParams.set("pageLimit", pageLimit.toString());
      url.searchParams.set(
        "metadata[keyvalues][type][value]",
        "medical-access-request"
      );
      url.searchParams.set("metadata[keyvalues][type][op]", "eq");

      if (patientId) {
        url.searchParams.set(
          "metadata[keyvalues][patientId][value]",
          String(patientId)
        );
        url.searchParams.set("metadata[keyvalues][patientId][op]", "eq");
      }
      if (doctorId) {
        url.searchParams.set(
          "metadata[keyvalues][doctorId][value]",
          String(doctorId)
        );
        url.searchParams.set("metadata[keyvalues][doctorId][op]", "eq");
      }
      if (recordType) {
        url.searchParams.set(
          "metadata[keyvalues][recordType][value]",
          recordType
        );
        url.searchParams.set("metadata[keyvalues][recordType][op]", "eq");
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.pinataJWT}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Pinata access request pinList error:", text);
        throw new Error(`Failed to list access requests: ${response.status}`);
      }

      const data = await response.json();
      const rows = data?.rows || [];

      const entries = await Promise.all(
        rows.map(async (row) => {
          try {
            const payload = await this.fetchFromIPFS(row.ipfs_pin_hash);
            return {
              ipfsHash: row.ipfs_pin_hash,
              pinnedAt: row.date_pinned,
              metadata: row.metadata,
              data: payload,
            };
          } catch (error) {
            console.error("Failed to fetch access request payload:", error);
            return null;
          }
        })
      );

      const filteredEntries = entries.filter(Boolean);
      return this.aggregateRecordAccessRequests(filteredEntries);
    } catch (error) {
      console.error("Error listing record access requests:", error);
      return [];
    }
  }

  /**
   * KEEP: Log patient decision (approve/deny) for a record access request
   * This is needed for patients to approve/deny requests
   */
  async logRecordAccessDecision({
    requestId,
    patientId,
    doctorId,
    status,
    decisionMessage,
    grantPackage = null,
  }) {
    if (!requestId || !patientId || !doctorId) {
      throw new Error("requestId, patientId, and doctorId are required");
    }

    if (!["approved", "denied"].includes(status)) {
      throw new Error("status must be 'approved' or 'denied'");
    }

    const payload = {
      type: "medical-access-request",
      action: "decision",
      requestId,
      patientId,
      doctorId,
      status,
      decisionMessage: decisionMessage || "",
      grantPackage: grantPackage || null,
      decisionAt: new Date().toISOString(),
    };

    const metadata = {
      name: `medical-access-request-decision-${requestId}-${status}`,
      type: "medical-access-request",
      keyvalues: {
        patientId: String(patientId),
        doctorId: String(doctorId),
        requestId,
        status,
      },
    };

    const result = await this.uploadJSONToIPFS(payload, metadata);
    return {
      hash: result.hash,
      url: result.url,
      payload,
    };
  }
}

export const ipfsService = new IPFSService();
export default ipfsService;
