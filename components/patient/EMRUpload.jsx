import { useState, useRef } from "react";
import { Button } from "../common";
import { FiFileText, FiUpload, FiX, FiAlertCircle } from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import toast from "react-hot-toast";

const EMRUpload = ({ onFileSelect, disabled = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF and image files (PNG, JPG) are allowed");
        e.target.value = '';
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      // Don't automatically call onFileSelect - wait for user to click upload button
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      toast.error("File input not available. Please refresh the page.");
    }
  };

  const handleRemoveFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,application/pdf"
        className="hidden"
        id="emr-upload-input"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors bg-gray-50">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full">
              <FiUpload className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click to upload EMR file
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, PNG, or JPG (Max 10MB)
              </p>
            </div>
            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={disabled}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              <FiFileText className="h-4 w-4 mr-2" />
              Select File
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-emerald-200 rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FiFileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-600">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={handleButtonClick}
                disabled={disabled}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={handleRemoveFile}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <FiX className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-white rounded-lg p-2 border border-emerald-200">
              <MdSecurity className="h-4 w-4" />
              <span>File will be encrypted with AES-256-GCM + CP-ABE</span>
            </div>
            {onFileSelect && (
              <Button
                type="button"
                onClick={() => {
                  if (selectedFile && onFileSelect) {
                    onFileSelect(selectedFile);
                  }
                }}
                disabled={disabled}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
              >
                <FiUpload className="h-4 w-4 mr-2" />
                Upload & Configure Access
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EMRUpload;

