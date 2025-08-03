# 🗳️ VoteUp – Decentralized E2E Verifiable Voting DApp

VoteUp is a decentralized voting platform built on the Ethereum blockchain that supports **end-to-end verifiable elections**. It ensures transparency, integrity, and **voter privacy** through a commit-reveal voting scheme. The system supports role-based permissions (admin, voters, candidates), on-chain result validation, and real-time frontend interactions — all in a trustless, decentralized environment.

---


## 📌 Table of Contents

* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Architecture](#%EF%B8%8F-architecture)
* [Smart Contract Overview](#-smart-contract-overview)
* [Installation and Running Locally](#%EF%B8%8F-installation-and-running-locally)
* [Usage Flow](#-usage-flow)
* [Commit-Reveal Voting Explained](#-commit-reveal-voting-explained)
* [Benefits](#-benefits)
* [File Structure](#-file-structure)
* [Contributing](#-contributing)
* [License](#-license)
* [Contact](#-contact)

---

## ✅ Features

* **📿 Candidate & Voter Registration**
  Users can request registration; election admins must approve to ensure legitimacy.

* **🔐 End-to-End Verifiable Voting**
  Uses a **commit-reveal** scheme to keep votes private and later verifiable.

* **🧠 Election Lifecycle Management**
  Admins can create elections, approve users, start/end elections, and fetch results.

* **🔠 Responsive React Frontend**
  Built with React, Tailwind, and Framer Motion for smooth UX.

* **⚡ Real-Time Feedback**
  Users get live election updates, success/failure toasts, countdowns, and more.

* **⚙️ Automatic Smart Contract Deployment**
  Each election triggers a fresh contract deployment on Sepolia via `ethers.js`.

---

## 🧠 Tech Stack

![React](https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=Vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000.svg?style=for-the-badge&logo=Vercel&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4.svg?style=for-the-badge&logo=Tailwind-CSS&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer-0055FF.svg?style=for-the-badge&logo=Framer&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636.svg?style=for-the-badge&logo=Solidity&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D.svg?style=for-the-badge&logo=Ethereum&logoColor=white)
![Ethers.js](https://img.shields.io/badge/Ethers-2535A0.svg?style=for-the-badge&logo=Ethers&logoColor=white)
![Web3.js](https://img.shields.io/badge/web3.js-F16822?style=for-the-badge&logo=web3.js&logoColor=white)
![MetaMask](https://img.shields.io/badge/MetaMask-F6851B.svg?style=for-the-badge&logo=metamask&logoColor=white)
![Foundry](https://img.shields.io/badge/Foundry-FF4A4A.svg?style=for-the-badge&logo=wrench&logoColor=white)



| Layer          | Tools / Frameworks                                                            |
| -------------- | ----------------------------------------------------------------------------- |
| **Frontend**   | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router DOM     |
| **Blockchain** | Solidity, Ethereum (Sepolia), Ethers.js                                       |
| **Tooling**    | Foundry (smart contract testing), Dexie.js (IndexedDB), Canvas Confetti, XLSX |
| **Web3**       | MetaMask, Wallet API via Ethers.js                                            |

---

## 🏗️ Architecture

```
Browser UI (React + Tailwind + Framer)
   |
   |---> Web3 Provider (MetaMask)
   |
   |---> Web3Context & Contract Utility Layer (ethers.js)
   |
Smart Contract Layer (Solidity on Sepolia)
   |
   |---> Voting.sol (deployed per election)
```

* **Frontend:** Fully interactive UI for elections, voting, results, and admin actions.
* **Contract Deployment:** Done dynamically from the frontend using a deploy function in `contract.ts`.
* **Storage:** Temporary frontend state stored using IndexedDB (`dexie`).
* **Interaction:** Ethers.js handles commitVote, revealVote, and other contract interactions.

---

## 🔐 Smart Contract Overview

**File:** `contracts/Voting.sol`

### Core Modules:

| Function                         | Description                                              |
| -------------------------------- | -------------------------------------------------------- |
| `createElection()`               | Deploys new election contract                            |
| `requestCandidateRegistration()` | Candidate applies for a role                             |
| `requestVoterRegistration()`     | Voter applies for a role                                 |
| `approveCandidate()`             | Admin approves candidates                                |
| `approveVoter()`                 | Admin approves voters                                    |
| `commitVote(bytes32 hash)`       | Voter commits a hashed vote (hash of candidateId + salt) |
| `revealVote(candidateId, salt)`  | Reveals original vote during reveal phase                |
| `getResults()`                   | Returns election results after reveal period ends        |

---

## ⚙️ Installation and Running Locally

### 🖥️ Clone the Repository

```bash
git clone https://github.com/Het2239/VoteUp.git
cd VoteUp
```

### 🗆 Install Dependencies

```bash
npm install
```

### 🚀 Run the Development Server

```bash
npm run dev
```

Navigate to:
[http://localhost:3000](http://localhost:3000)

> 📝 You do **not** need to manually deploy contracts. The app auto-deploys a new smart contract to Sepolia testnet whenever a new election is created. The actual port/URL may vary; check your terminal after starting the server.

---

## 🧪 Usage Flow

### 1. **Election Creation**

* Admin creates an election via frontend.
* Contract is deployed to Sepolia dynamically.

### 2. **Candidate & Voter Registration**

* Users apply via the frontend.
* Admin views pending requests and approves them on-chain.

### 3. **Commit Phase (Voting Period)**

* Voter casts a hash of `(candidateId + salt)` using `commitVote`.

### 4. **Reveal Phase (Post-Voting)**

* Voter reveals original `(candidateId, salt)` using `revealVote`.
* Contract verifies: `keccak256(candidateId + salt) === committedHash`.

### 5. **Results**

* After reveal deadline, results are computed and displayed.
* Frontend shows:

  * 🏆 Winner(s) (with tie handling)
  * 📊 Vote breakdown
  * ✅ Reveal status per voter

---

## 🧠 Commit-Reveal Voting Explained

**What is Commit-Reveal Voting?**

Commit-reveal is a two-phase voting scheme:

1. **Commit Phase:** Voters submit a hashed version of their vote (typically `hash(vote + secret)`), committing to their choice without revealing it.
2. **Reveal Phase:** Voters later disclose their vote and secret. The system verifies that the original hash matches.

This ensures:

* **Privacy**: Votes remain hidden during the election.
* **Verifiability**: Everyone can later verify each vote.
* **Fairness**: No early reveals influence others.

---

## ✨ Benefits

### 🔒 Privacy and Secrecy

* Votes are hidden during the commit phase.
* Prevents vote buying or coercion since votes aren’t visible.

### 🗞️ Verifiability

* Each voter can verify their vote via their hash.
* Anyone can audit if results match committed and revealed votes.

### 🏧 Decentralization

* Elections aren’t controlled by a central authority.
* Contracts enforce rules in a censorship-resistant way.

### 🔄 Fairness

* All votes are revealed at the same time, or none.
* Prevents influencing voters based on early disclosures.

### 🔐 Security

| Aspect        | Contribution of Commit-Reveal Voting        |
| ------------- | ------------------------------------------- |
| Immutability  | Contracts can't be modified post-deployment |
| Vote Secrecy  | Hash prevents early knowledge               |
| Integrity     | Reveal must match prior commitment          |
| Double Voting | Tracked per voter address                   |
| Transparency  | All logic is on-chain and inspectable       |

### ⚡ Efficiency

* Gas-efficient: only a hash is stored during commit.
* Minimal on-chain data usage.
* No need to store full vote data on-chain.

> ⚠️ Requires users to interact **twice** (commit + reveal)

### 🛡️ Reliability

* **Deterministic**: Results are final once reveals are done.
* **Robust**: Cannot be taken down or altered.
* **Graceful Failure Handling**:

  * Votes not revealed can be skipped.
  * Reveal reminders and auto-enforced deadlines can help.

---

## 📊 Comparison with Traditional Voting

| Feature                  | Traditional Voting | VoteUp (Commit-Reveal) |
| ------------------------ | ------------------ | ---------------------- |
| Transparency             | Low                | High                   |
| Tamper-proof             | No                 | Yes                    |
| Privacy                  | Medium             | Strong (commit phase)  |
| Cost                     | High               | Low (post-deployment)  |
| Accessibility            | Limited            | Global (Web3 wallet)   |
| End-to-End Verifiability | No                 | Yes                    |

---

## 🎯 Summary

VoteUp delivers a secure, decentralized, and verifiable voting experience through commit-reveal logic.

| Property     | Strength |
| ------------ | -------- |
| Security     | ✅✅✅✅     |
| Efficiency   | ✅✅✅      |
| Reliability  | ✅✅✅✅     |
| Privacy      | ✅✅✅✅     |
| Transparency | ✅✅✅✅     |

It’s ideal for:

* DAOs
* Campus/University elections
* Local and community decision-making

---

## 📁 File Structure

```
VoteUp/
├── contracts/                  # Voting.sol smart contract
├── src/
│   ├── components/             # UI components (Cards, Modals, Voting UI)
│   ├── contexts/               # Web3 & Theme context
│   ├── utils/                  # Ethers interaction, deployment, vote logic
│   ├── App.tsx                 # Root React component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── public/
├── index.html                  # Base HTML
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 📚 Contributing

We welcome contributions from the community! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request with a clear description.

Whether it's bug fixes, feature additions, or documentation updates — all contributions are appreciated.

---

## 📜 License

This project is licensed under the **MIT License**.
See [LICENSE](./LICENSE) for more details.

---

## 📬 Contact

Created with ❤️ by **Het Chavadiya**

* 📧 Email: [hetchavadiya@gmail.com](mailto:hetchavadiya@gmail.com)
* 👩‍💻 LinkedIn: [linkedin.com/in/hetchavadiya](https://linkedin.com/in/hetchavadiya)
* 💍 GitHub: [@Het2239](https://github.com/Het2239)

> If you use this project or find it helpful, feel free to ⭐ the repo!
