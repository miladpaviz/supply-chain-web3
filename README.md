# Web3 Medicine Supply Chain DApp

A professional decentralized application for managing medicine supply chains with on-chain status tracking and immutable notes.

## 🚀 Features
- **Blockchain Integration:** Every status update is recorded on the Ethereum blockchain (Ganache).
- **On-Chain Notes:** Added support for immutable status notes stored directly in the `Shipment` struct.
- **Off-Chain Sync:** High-performance MongoDB cache (with in-memory fallback for demo).
- **Premium UI:** Modern dark-mode React interface with real-time transaction feedback.
- **Automated Testing:** Dedicated script to verify the full Web3 + Backend sync flow.

## 🛠 Tech Stack
- **Smart Contracts:** Solidity, Truffle, Web3.js
- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React, Tailwind CSS, Lucide Icons

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MetaMask Browser Extension

### 2. Launch Local Blockchain
```bash
npx ganache --port 8545 --chain.chainId 12345 --chain.networkId 12345
```

### 3. Deploy Contract
```bash
npx truffle migrate --reset
```

### 4. Setup Backend
```bash
cd backend
npm install
npm start
```

### 5. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing the New Feature
To verify the "Update Status with Note" feature without manual MetaMask interaction:
1. Ensure Ganache and Backend are running.
2. Run the automated test script:
```bash
node scripts/test_note.js
```
3. Refresh the UI at `http://localhost:5173/shipments` to see the automated entry.

## 📄 License
MIT
