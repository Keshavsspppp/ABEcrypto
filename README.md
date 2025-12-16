# ABEcrypto 🔐

ABEcrypto is a **decentralized healthcare data management system** that combines **Attribute-Based Encryption (ABE)**, **blockchain smart contracts**, and **IPFS** to enable **secure, privacy-preserving, and fine-grained access control** for electronic medical records (EMR).

The system ensures that sensitive patient data can only be accessed by authorized medical professionals while maintaining transparency and decentralization.

---

## 📌 Motivation

Traditional healthcare systems store medical records on centralized servers, making them vulnerable to:
- Data breaches
- Unauthorized access
- Single points of failure
ABEcrypto addresses these issues by encrypting medical data at the client side and enforcing access control through cryptographic policies and blockchain verification.

---

## ✨ Key Features

- **Attribute-Based Encryption (ABE)**  
  Medical records are encrypted using access policies based on user attributes such as role, specialization, and organization.

- **Decentralized Storage with IPFS**  
  Encrypted files are stored off-chain on IPFS to ensure scalability and immutability.

- **Blockchain-Based Access Control**  
  Smart contracts manage user registration, doctor approval, and access authorization.
- **Role-Specific Dashboards**  
  Separate interfaces for patients and doctors to manage records and permissions.

- **Web3 Wallet Authentication**  
  Secure authentication via MetaMask using Wagmi and Ethers.js.

---

## 🧠 Technology Stack

| Layer | Technologies |
|------|-------------|
| Frontend | Next.js, React |
| Blockchain | Solidity (EVM-compatible) |
| Smart Contracts | Hardhat |
| Web3 | Wagmi, Ethers.js |
| Storage | IPFS (Pinata) |
| Cryptography | AES + Attribute-Based Encryption |






---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Keshavsspppp/ABEcrypto.git
cd ABEcrypto
```

### 2.install Dependencies
```npm install```

Configure Environment Variables
```
Create a .env.local file:

NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET=your_pinata_secret
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address


⚠️ Never commit .env.local to version control.
```
⛓ Smart Contract Deployment
```cd web3
npx hardhat compile
npx hardhat run scripts/deploy.js --network <network>
```

Update the deployed contract address in .env.local.

▶️ Running the Application
```npm run dev```


Access the application at:

```http://localhost:3000```

🔐 Encryption Workflow

Patient uploads a medical record

Record is encrypted using a randomly generated AES key

AES key is encrypted using ABE with a defined access policy

Encrypted file is uploaded to IPFS

Encrypted key and metadata are stored on the blockchain

Only users whose attributes satisfy the policy can decrypt the record

🛡 Security Considerations

All medical records remain encrypted off-chain

Access policies are cryptographically enforced

Blockchain provides tamper-proof access control

No sensitive secrets are stored in the repository

🚧 Future Enhancements

Time-limited access permissions

Emergency access with patient consent

Audit logs and access history

Key revocation and rotation

Mobile application support
