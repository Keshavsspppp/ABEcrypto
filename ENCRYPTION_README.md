# Attribute-Based Encryption (ABE) with AES - Implementation Guide

## Overview

This project now includes **Hybrid Attribute-Based Encryption (ABE) with AES** for securing sensitive healthcare data. The implementation uses:

- **AES-256-CBC** for encrypting the actual data (fast, symmetric encryption)
- **Simplified CP-ABE (Ciphertext-Policy ABE)** for encrypting the AES key based on user attributes

## Architecture

### Hybrid Encryption Flow

1. **Data Encryption:**
   - Generate a random AES-256 key
   - Encrypt data with AES
   - Encrypt the AES key using ABE based on access policy
   - Store both encrypted data and encrypted key

2. **Data Decryption:**
   - User provides attributes (role, patientId, doctorId)
   - Check if attributes satisfy the access policy
   - Decrypt AES key using ABE
   - Decrypt data using AES key

## Files Added/Modified

### New Files

1. **`utils/encryption.js`** - Core encryption utility
   - `ABEEncryption` class with hybrid encryption methods
   - Policy creation and validation
   - Attribute-based access control

2. **`hooks/useEncryption.js`** - React hook for encryption
   - Easy-to-use encryption/decryption functions
   - Automatic user attribute detection
   - Medical history encryption helpers

### Modified Files

1. **`utils/ipfs.js`** - Added encryption methods:
   - `uploadEncryptedMedicalRecord()` - Upload encrypted records to IPFS
   - `fetchAndDecryptMedicalRecord()` - Fetch and decrypt records
   - `uploadEncryptedPatientProfile()` - Encrypt patient profiles
   - `fetchAndDecryptPatientProfile()` - Decrypt patient profiles

2. **`hooks/useContract.js`** - Updated contract functions:
   - `updatePatientMedicalHistory()` - Now encrypts before storing
   - `getPatientMedicalHistory()` - Now decrypts when fetching

3. **`package.json`** - Added dependency:
   - `crypto-js@^4.2.0` - For AES encryption

## Usage

### Basic Encryption

```javascript
import abeEncryption from '../utils/encryption';

// Create access policy
const policy = abeEncryption.createMedicalRecordPolicy(
  patientId,    // Patient ID
  doctorId,    // Doctor ID (optional)
  true         // Allow admin access
);

// Encrypt data
const encrypted = await abeEncryption.encrypt(data, policy);

// Decrypt data
const userAttributes = {
  address: '0x...',
  role: 'doctor',
  doctorId: 1,
  patientId: 1
};
const decrypted = await abeEncryption.decrypt(encrypted, userAttributes);
```

### Using the Hook

```javascript
import { useEncryption } from '../hooks/useEncryption';

function MyComponent() {
  const { encryptMedicalHistory, decryptMedicalHistory } = useEncryption();
  
  // Encrypt before storing
  const encrypted = await encryptMedicalHistory(
    "Patient has high blood pressure",
    patientId,
    doctorId
  );
  
  // Decrypt when reading
  const decrypted = await decryptMedicalHistory(encryptedEntry);
}
```

### Automatic Encryption in Contract Hook

The `useHealthcareContract` hook now automatically encrypts/decrypts:

```javascript
const { updatePatientMedicalHistory, getPatientMedicalHistory } = useHealthcareContract();

// Automatically encrypts before storing
await updatePatientMedicalHistory(patientId, "New medical record");

// Automatically decrypts when fetching
const history = await getPatientMedicalHistory(patientId);
```

## Access Policies

### Policy Types

1. **OR Policy** - At least one condition must be satisfied
2. **AND Policy** - All conditions must be satisfied
3. **Simple Policy** - Single attribute matching

### Default Medical Record Policy

The default policy allows access to:
- The patient themselves (`role === 'patient' && patientId === X`)
- Assigned doctor (`role === 'doctor' && doctorId === Y`)
- Admin (`role === 'admin'`)

## Attributes

Supported attributes:
- `role`: "doctor", "patient", "admin"
- `patientId`: Specific patient ID
- `doctorId`: Specific doctor ID
- `address`: Wallet address

## Security Considerations

1. **Master Key**: Currently uses a seed-based master key. In production:
   - Use a Hardware Security Module (HSM)
   - Use a key management service (AWS KMS, Azure Key Vault)
   - Store master key securely

2. **Key Storage**: AES keys are encrypted with ABE but stored with the data. Consider:
   - Separate key storage
   - Key rotation policies

3. **Policy Enforcement**: Policies are enforced client-side. For production:
   - Add server-side validation
   - Use smart contracts for policy verification
   - Implement audit logging

## Environment Variables

Add to `.env.local`:

```env
# Optional: Custom master seed for ABE
NEXT_PUBLIC_ABE_MASTER_SEED=your-secure-seed-here
```

**Warning**: In production, never expose the master seed in client-side code. Use a secure key management system.

## Backward Compatibility

The implementation maintains backward compatibility:
- Old unencrypted data is still readable
- New data is encrypted by default
- Decryption gracefully falls back if attributes don't match

## Testing

To test encryption:

1. Install dependencies:
```bash
npm install
```

2. Update medical history (will be encrypted):
```javascript
await updatePatientMedicalHistory(patientId, "Test encrypted record");
```

3. Fetch medical history (will be decrypted):
```javascript
const history = await getPatientMedicalHistory(patientId);
```

## Future Enhancements

1. **Full CP-ABE Implementation**: Replace simplified ABE with full CP-ABE library
2. **Key Rotation**: Implement key rotation for long-term data
3. **Policy Updates**: Allow updating access policies
4. **Audit Logging**: Log all encryption/decryption operations
5. **Smart Contract Integration**: Store policies on-chain

## Troubleshooting

### Decryption Fails

- Check user attributes match the policy
- Verify the user has the correct role
- Ensure patientId/doctorId are correct

### Encryption Errors

- Check crypto-js is installed: `npm install crypto-js`
- Verify master seed is set (optional)
- Check browser console for detailed errors

## References

- [Crypto-JS Documentation](https://cryptojs.gitbook.io/)
- [Attribute-Based Encryption](https://en.wikipedia.org/wiki/Attribute-based_encryption)
- [Hybrid Encryption](https://en.wikipedia.org/wiki/Hybrid_cryptosystem)

