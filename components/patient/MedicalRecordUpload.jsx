import { useState } from "react";
import { FiUpload, FiFile, FiShield, FiX } from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import Button from "../common/Button";
import Input from "../common/Input";
import { useHealthcareContract } from "../../hooks/useContract";
import ipfsService from "../../utils/ipfs";
import abeEncryption from "../../utils/encryption";
import toast from "react-hot-toast";

const MedicalRecordUpload = ({ patientId, doctors = [], onSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [specialties, setSpecialties] = useState("");
  const [hospitals, setHospitals] = useState("");
  const [allowAdmin, setAllowAdmin] = useState(true);
  const [emergencyAccess, setEmergencyAccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { uploadEncryptedMedicalRecord } = useHealthcareContract();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDoctorToggle = (doctorId) => {
    setSelectedDoctors((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    if (!patientId) {
      toast.error("Patient ID is required");
      return;
    }

    try {
      setUploading(true);
      const loadingToast = toast.loading("Encrypting and uploading medical record...");

      console.log("📋 Starting upload process...");
      console.log("Patient ID:", patientId);
      console.log("File:", file.name, file.size, "bytes");

      // Step 1: Read file as ArrayBuffer
      const fileBuffer = await readFileAsArrayBuffer(file);
      console.log("✅ File read successfully");

      // Step 2: Create access policy
      const specialtiesArray = specialties
        ? specialties.split(",").map((s) => s.trim()).filter((s) => s)
        : [];
      const hospitalsArray = hospitals
        ? hospitals.split(",").map((h) => h.trim()).filter((h) => h)
        : [];

      const policy = abeEncryption.createMedicalRecordPolicy({
        patientId: Number(patientId),
        doctorIds: selectedDoctors,
        specialties: specialtiesArray,
        hospitals: hospitalsArray,
        allowAdmin,
        allowPatient: true,
        emergencyAccess,
      });

      console.log("📋 Created access policy:", policy);

      // Step 3: Encrypt file with hybrid encryption
      const encryptedPackage = await abeEncryption.encryptMedicalRecord(
        fileBuffer,
        policy,
        {
          description: description,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          patientId: Number(patientId),
        }
      );

      console.log("🔒 File encrypted successfully");

      // Step 4: Upload encrypted package to IPFS
      const ipfsHash = await ipfsService.uploadToIPFS(
        JSON.stringify(encryptedPackage)
      );

      console.log("📤 Uploaded to IPFS:", ipfsHash);

      // Step 5: Store on blockchain
      const receipt = await uploadEncryptedMedicalRecord(
        Number(patientId),
        ipfsHash,
        encryptedPackage.encryptedKey,
        policy
      );

      console.log("✅ Stored on blockchain:", receipt.transactionHash);

      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-semibold">Medical record uploaded successfully!</p>
          <p className="text-xs mt-1">IPFS: {ipfsHash.slice(0, 15)}...</p>
          <p className="text-xs">Tx: {receipt.transactionHash.slice(0, 15)}...</p>
        </div>,
        { duration: 5000 }
      );

      // Reset form
      setFile(null);
      setDescription("");
      setSelectedDoctors([]);
      setSpecialties("");
      setHospitals("");
      setAllowAdmin(true);
      setEmergencyAccess(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("❌ Error uploading medical record:", error);
      toast.error(error.message || "Failed to upload medical record");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medical Record File *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {file ? (
              <>
                <FiFile className="h-12 w-12 text-teal-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                  }}
                >
                  <FiX className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </>
            ) : (
              <>
                <FiUpload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG, DOC up to 10MB
                </p>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the medical record (e.g., Blood test results from Dec 2024)..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          disabled={uploading}
        />
      </div>

      {/* Access Policy Section */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MdSecurity className="h-6 w-6 text-purple-600" />
          <h3 className="font-bold text-gray-900">Access Policy (CP-ABE)</h3>
        </div>

        {/* Grant Access to Specific Doctors */}
        {doctors && doctors.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grant Access to Specific Doctors
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded p-3 bg-white">
              {doctors.map((doctor) => (
                <label
                  key={doctor.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDoctors.includes(Number(doctor.id))}
                    onChange={() => handleDoctorToggle(Number(doctor.id))}
                    disabled={uploading}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm">
                    Dr. {doctor.name || `Doctor #${doctor.id}`}
                    {doctor.specialization && (
                      <span className="text-gray-500 ml-1">
                        ({doctor.specialization})
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            {selectedDoctors.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                ✓ {selectedDoctors.length} doctor(s) selected
              </p>
            )}
          </div>
        )}

        {/* Required Specialties */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Specialties (comma-separated)
          </label>
          <Input
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="e.g., Cardiology, Neurology"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Any doctor with these specialties can access this record
          </p>
        </div>

        {/* Allowed Hospitals */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Hospitals (comma-separated)
          </label>
          <Input
            value={hospitals}
            onChange={(e) => setHospitals(e.target.value)}
            placeholder="e.g., AIIMS, Apollo Hospital"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Doctors from these hospitals can access this record
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowAdmin}
              onChange={(e) => setAllowAdmin(e.target.checked)}
              disabled={uploading}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              Allow admin override (for audits)
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emergencyAccess}
              onChange={(e) => setEmergencyAccess(e.target.checked)}
              disabled={uploading}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              Enable emergency access (any doctor in emergency situations)
            </span>
          </label>
        </div>
      </div>

      {/* Encryption Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiShield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">🔒 Hybrid Encryption</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Your file will be encrypted with <strong>AES-256-GCM</strong></li>
              <li>The encryption key is protected using <strong>CP-ABE</strong></li>
              <li>Encrypted data is stored on <strong>IPFS</strong></li>
              <li>Access control is enforced by <strong>smart contracts</strong></li>
              <li>Only authorized users matching the policy can decrypt</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || !description.trim() || uploading}
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Encrypting and Uploading...
          </>
        ) : (
          <>
            <FiUpload className="h-4 w-4 mr-2" />
            Upload & Encrypt Medical Record
          </>
        )}
      </Button>

      {/* Info Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Once uploaded, the medical record will be permanently stored on the blockchain. 
          Make sure all information is accurate and the access policy is configured correctly.
        </p>
      </div>
    </div>
  );
};

export default MedicalRecordUpload;