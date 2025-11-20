import { PINATA_JWT, PINATA_GATEWAY } from "../config/contract";
import abeEncryption from "./encryption";

class IPFSService {
  constructor() {
    this.pinataJWT = PINATA_JWT;
    this.gateway = PINATA_GATEWAY;
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

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.pinataJWT}`,
          },
          body: JSON.stringify({
            pinataContent: jsonData,
            pinataMetadata: {
              name: metadata.name || "healthcare-metadata",
              keyvalues: {
                type: metadata.type || "healthcare-json",
                uploadedAt: new Date().toISOString(),
                ...metadata.keyvalues,
              },
            },
            pinataOptions: {
              cidVersion: 1,
            },
          }),
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
   * Fetch and decrypt medical record from IPFS
   */
  async fetchAndDecryptMedicalRecord(hash, userAttributes) {
    try {
      // Fetch encrypted package from IPFS
      const encryptedPackage = await this.fetchFromIPFS(hash);

      // Check if it's encrypted
      if (!encryptedPackage.encryptedData || !encryptedPackage.encryptedKey) {
        // Not encrypted, return as-is (backward compatibility)
        return encryptedPackage;
      }

      // Decrypt using ABE + AES
      const decryptedData = await abeEncryption.decrypt(
        encryptedPackage,
        userAttributes
      );

      return decryptedData;
    } catch (error) {
      console.error("Error fetching and decrypting medical record:", error);
      throw error;
    }
  }

  /**
   * Upload encrypted patient profile to IPFS
   */
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
}

export const ipfsService = new IPFSService();
export default ipfsService;
