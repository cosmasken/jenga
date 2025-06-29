# 🧱 Jenga – Bitcoin-Native Community Lending Circles on Citrea

## 🌀 What it does

Jenga enables communities to create and participate in Bitcoin-based saving circles (Chamas) using Citrea. It brings informal financial practices—like rotating savings, P2P stacking, and group credit—on-chain in a non-custodial, transparent, and trustless way.

Users can form or join a circle, contribute BTC (on Citrea), receive payouts in turn, and build on-chain credit history with reputation scores.

## 🛠️ The problem it solves

Across the Global South, informal saving groups are a lifeline—yet they're vulnerable to fraud, require trust, and exclude participants from modern digital finance.

Jenga solves this by:
- Automating group saving cycles with smart contracts
- Eliminating the need for a trusted treasurer
- Providing financial transparency and privacy using zk-proofs
- Keeping everything Bitcoin-native, removing the need for wrapped tokens or centralized apps

## ⚔️ Challenges we ran into

- Designing smart contracts that reflect real-world group dynamics while remaining trustless
- Integrating zkEVM features on Citrea
- Adapting UX for Bitcoin-denominated values (e.g., sats)
- Building a frontend that's both static and functional with no backend while enabling real interaction with the zkEVM contracts

## 🧰 Technologies we used

- Citrea zkEVM for L2 execution
- Solidity for smart contracts
- Vue.js and TailwindCSS for the static frontend
- Ethers.js for contract interaction
- MetaMask for wallet integration
- Zero-Knowledge Proofs (zk-SNARKs – in progress) for private contributions

## 🧱 How we built it

- Designed the savings logic around ROSCAs (Rotating Savings and Credit Associations)
- Wrote modular smart contracts for:
  - Chama group creation and joining
  - Scheduled contributions and automatic payouts
  - Penalty enforcement and reputation tracking
- Deployed contracts on Citrea testnet
- Developed a static frontend with wallet connection, real contract calls, and UI for tracking contribution status and history
- Began integrating zk circuits to prove contribution history without revealing wallet details

## 📚 What we learned

- Building for a Bitcoin rollup like Citrea introduces a unique design space, especially when working with zkEVM and a Bitcoin-centric UX
- Real-world financial behaviors can be modeled effectively with simple yet robust smart contract systems
- zk-integration adds privacy without compromising composability—but requires thoughtful UI/UX and circuit design
- Community-first DeFi needs to balance simplicity with security

## 🔮 What's next for Jenga

- 🧾 Finalize and deploy zkProof circuit for private contribution verification
- 📱 Launch mobile-first version for underserved communities
- 🌍 Pilot Jenga with real community savings groups in Kenya and Nigeria
- 🎯 Expand into credit scoring and DeFi borrowing based on on-chain reputation
- ⛓️ Explore DAO governance for group treasuries and long-term savings vaults
