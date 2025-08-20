# Sacco (ROSCA) – Citrea Testnet dApp

A React + TypeScript decentralized application for managing ROSCAs (rotating savings and credit associations) on the Citrea testnet. This app lets users create, join, and contribute to native-ETH ROSCAs deployed via a factory contract. It integrates Dynamic Labs for wallet onboarding and uses viem for on-chain reads/writes.

## Key Features
- Create ROSCAs using a factory contract (native ETH only)
- Join and contribute with native ETH (no ERC20 approvals needed)
- View ROSCA status, rounds, members, and contributions
- Wallet onboarding and session management via Dynamic Labs
- Citrea testnet RPC support with optional Blast API fallback

## Project Structure
- Frontend: React + Vite + TypeScript in this repository
- Contracts: Hardhat project under `contract/`
  - Factory + ROSCA implementation
  - Deployment scripts and example networks
- ABIs: Committed in `src/abi/`
- Hooks and logic: `src/hooks/` (notably `useRosca.ts`)

## Prerequisites
- Node.js 18+ and npm (or pnpm/yarn)
- A Citrea testnet wallet with test ETH
- Dynamic Labs environment configured

## Environment Variables
Create a `.env` file in the project root (same directory as package.json). The app reads variables via Vite (prefix VITE_):

- VITE_DYNAMIC_ENVIRONMENT_ID: Your Dynamic Labs environment ID
- VITE_BLAST_API_PROJECT_ID: Optional; if unset, the app uses the default Citrea RPC
- VITE_ROSCA_FACTORY_ADDRESS: Optional; defaults are provided for Citrea testnet

Example `.env`:
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_env_id
VITE_BLAST_API_PROJECT_ID=your_blast_project_id_optional
VITE_ROSCA_FACTORY_ADDRESS=0xFactoryAddressOnCitrea

Tip: Never commit real secrets. `.env` is already gitignored.

## Install and Run (Frontend)
- Install dependencies
  npm install

- Start the dev server
  npm run dev

- Build for production
  npm run build

- Preview the production build
  npm run preview

The dev server prints a local URL. Open it in the browser and connect your wallet via the Dynamic widget.

## Contracts (Hardhat)
The contracts live under `contract/` and are configured for Citrea testnet.

- Install dependencies
  cd contract
  npm install

- Compile
  npx hardhat compile

- Test (if tests are added)
  npx hardhat test

- Deploy to Citrea testnet (example consolidated script)
  node scripts/deploy-all.js

Deployment outputs are written to `contract/deployments/`. Update `VITE_ROSCA_FACTORY_ADDRESS` with the factory address if you deploy a new one.

Note: `contract/artifacts/` and `contract/cache/` are ignored by git.

## How It Works (High-Level)
- Factory creates a ROSCA instance with contribution amount, round duration, and max members.
- App treats all ROSCAs as native ETH (no token() ABI calls). Functions that send ETH (join, contribute) include the required value.
- The UI fetches ROSCA info via view functions (status, rounds, members) and displays progress.

## Common Tasks
- Create a ROSCA: Use the Create flow in the app; the factory emits the new address. Store that address in the dashboard.
- Join a ROSCA: Provide the required deposit; the app sends ETH in the transaction.
- Contribute: Sends the contribution amount in ETH for the current round.

## Troubleshooting
- AbiFunctionNotFoundError: We removed all calls to `token()` for native-ETH ROSCAs. If you see ABI errors, ensure you’re pointing at the correct, updated ABIs in `src/abi/` and using the factory-deployed contracts.
- Wallet not detected: Ensure your browser wallet supports the Citrea testnet and that Dynamic Labs is configured.
- RPC rate limits: If you see RPC failures, set `VITE_BLAST_API_PROJECT_ID` or try again later.
- Local storage ROSCAs list: The dashboard stores added ROSCA addresses locally for convenience.

## Scripts and Utilities
- `scripts/deploy-factory.js` (root): Example automation for deployment flows
- `contract/scripts/deploy-all.js`: Deploys contracts to Citrea testnet

## Contributing
- Use feature branches and open PRs.
- Keep ABIs in sync with deployed contracts.
- Avoid committing large artifacts or secrets.

## License
MIT (or project-specific license).
