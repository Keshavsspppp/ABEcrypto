# Speciality-Based Attribute-Based Encryption (ABE) for Medical Records

## Overview

This implementation extends the existing ABE system to support speciality-based access control for medical records. When a doctor adds a medical record, it is automatically encrypted such that:

1. **The patient** can always access their own records
2. **The doctor who created the record** can access it
3. **Doctors with the same speciality** can access it (e.g., all cardiologists can access cardiology records)
4. **Other specialist doctors** must request access and get patient approval
5. **Administrators** have full access for system management

## Architecture

### Key Components

1. **Smart Contract** (`web3/contracts/Healthcare.sol`)
   - Added `speciality` field to Doctor struct
   - Added `AccessRequest` struct for tracking access requests
   - Implemented access request management functions
   - Added speciality-based filtering functions

2. **Encryption Utility** (`utils/encryption.js`)
   - Enhanced policy creation to include doctor speciality
   - Support for multi-doctor access based on speciality
   - Speciality attribute in user attributes

3. **IPFS Service** (`utils/ipfs.js`)
   - Updated to support speciality-based encryption
   - Medical record encryption includes speciality in policy

4. **Hooks**
   - `useAccessRequests.js` - Manages access request operations
   - Updated `useContract.js` - Includes speciality in doctor registration

5. **UI Components**
   - `AccessRequestModal.jsx` - For doctors to request access
   - `AccessRequestList.jsx` - Display access requests
   - `PatientAccessRequests.jsx` - Patient management page
   - Updated `DoctorMedicalRecords.jsx` - Integrated access requests

## Smart Contract Updates

### New Struct

```solidity
struct AccessRequest {
    uint id;
    uint patientId;
    uint doctorId;
    uint medicalRecordIndex;
    string reason;
    uint timestamp;
    string status; // "pending", "approved", "denied"
}
```

### New Functions

```solidity
// Request access to a patient's medical record
function REQUEST_ACCESS(uint _patientId, uint _medicalRecordIndex, string memory _reason) public onlyDoctor

// Approve access request (patient only)
function APPROVE_ACCESS_REQUEST(uint _requestId) public

// Deny access request (patient only)
function DENY_ACCESS_REQUEST(uint _requestId) public

// Get all access requests for a patient
function GET_PATIENT_ACCESS_REQUESTS(uint _patientId) public view returns (AccessRequest[] memory)

// Get all access requests made by a doctor
function GET_DOCTOR_ACCESS_REQUESTS(uint _doctorId) public view returns (AccessRequest[] memory)

// Check if doctor has access to specific medical record
function HAS_ACCESS_TO_RECORD(uint _patientId, uint _medicalRecordIndex, address _doctorAddress) public view returns (bool)

// Get doctors by speciality
function GET_DOCTORS_BY_SPECIALITY(string memory _speciality) public view returns (Doctor[] memory)
```

### Modified Functions

```solidity
// Now requires speciality parameter
function ADD_DOCTOR(string memory _IPFS_URL, address _address, string calldata _name, string memory _type, string memory _speciality) public payable
```

## Access Control Policy

### Policy Structure

When a medical record is created, an access policy is generated:

```javascript
{
  type: 'OR',
  conditions: [
    // Patient access
    { attribute: 'role', operator: '===', value: 'patient' },
    { attribute: 'patientId', operator: '===', value: patientId },
    
    // Creating doctor access
    { attribute: 'role', operator: '===', value: 'doctor' },
    { attribute: 'doctorId', operator: '===', value: doctorId },
    
    // Same speciality access
    { attribute: 'role', operator: '===', value: 'doctor' },
    { attribute: 'speciality', operator: '===', value: doctorSpeciality },
    
    // Approved doctors access
    { attribute: 'role', operator: '===', value: 'doctor' },
    { attribute: 'doctorId', operator: 'in', value: approvedDoctorIds },
    
    // Admin access
    { attribute: 'role', operator: '===', value: 'admin' }
  ]
}
```

### User Attributes

Users are identified by the following attributes:

```javascript
{
  address: '0x...',           // Wallet address
  role: 'doctor',             // 'doctor', 'patient', or 'admin'
  patientId: 1,               // Patient ID (if patient)
  doctorId: 2,                // Doctor ID (if doctor)
  speciality: 'Cardiology'    // Doctor speciality (if doctor)
}
```

## Workflow

### 1. Doctor Registration with Speciality

```javascript
await registerDoctor(
  ipfsUrl,
  address,
  name,
  "doctor",
  registrationFee,
  "Cardiology" // Speciality
);
```

### 2. Adding Medical Record (Automatic Encryption)

When a cardiologist adds a medical record:

```javascript
await updatePatientMedicalHistory(patientId, "Patient has hypertension");
```

The system automatically:
- Detects the doctor's speciality (Cardiology)
- Creates a policy allowing access to all cardiologists
- Encrypts the record with this policy
- Stores the encrypted record on the blockchain

### 3. Cross-Speciality Access Request

When a neurologist wants to access a cardiology record:

```javascript
// Doctor submits request
await requestAccess(patientId, medicalRecordIndex, "Need to review for comprehensive diagnosis");
```

The system:
- Creates an AccessRequest in the smart contract
- Notifies the patient
- Waits for patient approval

### 4. Patient Approval/Denial

Patient reviews and approves/denies:

```javascript
// Patient approves
await approveAccessRequest(requestId);

// Or patient denies
await denyAccessRequest(requestId);
```

### 5. Accessing Record After Approval

Once approved, the system:
- Updates the access policy to include the approved doctor
- Re-encrypts or maintains access through the smart contract
- Doctor can now decrypt and view the record

## Usage Examples

### For Doctors

#### Viewing Patient Records

```javascript
import { useHealthcareContract } from '../hooks/useContract';
import useAccessRequests from '../hooks/useAccessRequests';

function DoctorRecords() {
  const { getPatientMedicalHistory } = useHealthcareContract();
  const { requestAccess, hasAccessToRecord } = useAccessRequests();
  
  const handleViewRecord = async (patientId, recordIndex) => {
    // Check if doctor has access
    const hasAccess = await hasAccessToRecord(patientId, recordIndex, doctorAddress);
    
    if (!hasAccess) {
      // Request access
      await requestAccess(patientId, recordIndex, "Need for consultation");
      return;
    }
    
    // Get the record
    const history = await getPatientMedicalHistory(patientId);
    // Display the record
  };
}
```

#### Requesting Access

```javascript
<AccessRequestModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  patient={selectedPatient}
  medicalRecordIndex={recordIndex}
  onSubmit={async (patientId, index, reason) => {
    await requestAccess(patientId, index, reason);
  }}
/>
```

### For Patients

#### Managing Access Requests

```javascript
import useAccessRequests from '../hooks/useAccessRequests';

function PatientAccessRequests() {
  const { 
    approveAccessRequest,
    denyAccessRequest,
    getPatientAccessRequests 
  } = useAccessRequests();
  
  const handleApprove = async (requestId) => {
    await approveAccessRequest(requestId);
    // Refresh requests list
  };
  
  const handleDeny = async (requestId) => {
    await denyAccessRequest(requestId);
    // Refresh requests list
  };
}
```

## Security Considerations

### Encryption

1. **Hybrid Encryption**: Uses AES-256 for data and ABE for key encryption
2. **Policy-Based**: Access is controlled by cryptographic policies, not just smart contract checks
3. **Speciality Isolation**: Records are encrypted such that only doctors with the correct speciality can decrypt (unless explicitly approved)

### Smart Contract Security

1. **Role-Based Access Control**: Only registered doctors can request access
2. **Patient Ownership**: Only patients can approve/deny access to their records
3. **Audit Trail**: All access requests are logged on-chain
4. **Immutability**: Access request history is permanent and auditable

### Best Practices

1. **Minimal Access**: Doctors should only request access when medically necessary
2. **Clear Reasons**: Access requests should include detailed medical justification
3. **Regular Review**: Patients should regularly review pending access requests
4. **Revocation**: Implement access revocation for long-term security (future enhancement)

## Integration Steps

### 1. Deploy Updated Smart Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to network
npx hardhat run scripts/deploy.js --network <network-name>

# Update CONTRACT_ADDRESS in config/contract.js
```

### 2. Update Contract ABI

After deployment, update the ABI in `config/contract.js` with the new contract functions.

### 3. Add Navigation Links

Add links to access request pages in patient dashboard:

```jsx
<Link href="/patient/access-requests">
  <FiShield /> Manage Access Requests
</Link>
```

### 4. Test the Flow

1. Register two doctors with different specialities
2. Register a patient
3. Doctor A (Cardiology) adds a medical record
4. Doctor B (Neurology) tries to access - should be prompted to request
5. Doctor B submits access request
6. Patient approves the request
7. Doctor B can now access the record

## API Reference

### useAccessRequests Hook

```javascript
const {
  requestAccess,              // (patientId, recordIndex, reason) => Promise
  approveAccessRequest,       // (requestId) => Promise
  denyAccessRequest,          // (requestId) => Promise
  getPatientAccessRequests,   // (patientId) => Promise<AccessRequest[]>
  getDoctorAccessRequests,    // (doctorId) => Promise<AccessRequest[]>
  hasAccessToRecord,          // (patientId, recordIndex, doctorAddress) => Promise<boolean>
  getDoctorsBySpeciality,     // (speciality) => Promise<Doctor[]>
  loading                     // boolean
} = useAccessRequests();
```

### Encryption Utility

```javascript
import abeEncryption from '../utils/encryption';

// Create policy with speciality
const policy = abeEncryption.createMedicalRecordPolicy(
  patientId,
  doctorId,
  doctorSpeciality,
  allowAdmin,
  approvedDoctorIds
);

// Get user attributes
const attributes = abeEncryption.getUserAttributes(
  address,
  role,
  patientId,
  doctorId,
  speciality
);

// Encrypt data
const encrypted = await abeEncryption.encrypt(data, policy);

// Decrypt data
const decrypted = await abeEncryption.decrypt(encrypted, attributes);
```

## Future Enhancements

1. **Time-Limited Access**: Allow temporary access that expires after a set time
2. **Access Revocation**: Allow patients to revoke previously granted access
3. **Emergency Access**: Break-glass mechanism for emergency situations
4. **Audit Logs UI**: Display detailed access logs to patients
5. **Multi-Speciality Records**: Records that span multiple specialities
6. **Graduated Access**: Different levels of access (view-only, full access)
7. **Delegate Management**: Allow patients to delegate access management to family members
8. **Smart Recommendations**: Suggest access approvals based on treatment context

## Troubleshooting

### Common Issues

1. **Decryption Fails**
   - Check that user attributes match the policy
   - Verify doctor speciality is correctly set
   - Ensure access request has been approved

2. **Access Request Not Showing**
   - Verify contract is deployed and ABI is updated
   - Check that doctor is registered and approved
   - Ensure patient ID is correct

3. **Encryption Errors**
   - Verify crypto-js is installed
   - Check that doctor details include speciality
   - Review policy creation logs

### Debug Mode

Enable detailed logging:

```javascript
// In utils/encryption.js
console.log("Policy:", policy);
console.log("User Attributes:", userAttributes);
console.log("Policy Satisfaction:", satisfied);
```

## License

This implementation is part of the ABEcrypto project and follows the same license.

## Contributors

- Implemented speciality-based ABE system
- Added access request workflow
- Created patient access management interface

## Support

For issues or questions, please open an issue on the GitHub repository.
