main.tsx:69 🔧 Environment Configuration Check:
main.tsx:70 VITE_DYNAMIC_ENVIRONMENT_ID: ✅ Set
main.tsx:74 VITE_BLAST_API_PROJECT_ID: ⚠️ Missing (using fallback RPC)
main.tsx:77 🌐 Using fallback RPC: https://rpc.testnet.citrea.xyz
main.tsx:78 💡 For better performance, add your Blast API project ID to .env
main.tsx:81 VITE_CHAMA_FACTORY_ADDRESS: ⚠️ Using default
main.tsx:117 🚀 Starting app with Dynamic Labs integration
main.tsx:118 Environment ID: 2762a57b...
main.tsx:119 Network Config: Citrea Testnet
Dashboard.tsx:134 User not logged in, redirecting to home
chunk-IF3SVANV.js?v=4848d4e8:2247 [DynamicSDK] [INFO]: Warning!
chunk-IF3SVANV.js?v=4848d4e8:2247 [DynamicSDK] [INFO]: This is a browser feature intended for developers. You are reading this message because you opened the browser console, a developer tool.1. Never share your tokens or sensitive information with anyone.2. Do not paste any code you do not fully understand.3. If someone instructed you to do this, it is likely a scam.Injecting code into your browser could result in loss of tokens or control of your account that cannot be recovered or protected.
Dashboard.tsx:134 User not logged in, redirecting to home
useDashboardData.ts:136 🔄 Fetching dashboard data...
useRosca.ts:513 Failed to get ROSCA info: ContractFunctionExecutionError: The contract function "recruitmentCompleteTime" reverted.

Contract Call:
  address:   0xEa353D5A300966f8598161F05f0945b570d8B499
  function:  recruitmentCompleteTime()

Docs: https://viem.sh/docs/contract/readContract
Version: viem@2.33.3
    at getContractError (chunk-L6APSQ7K.js?v=4848d4e8:311:10)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1114:11)
    at async Promise.all (index 8)
    at async useRosca.ts:487:11
    at async Object.getChamaInfo (useRosca.ts:717:20)
    at async useDashboardData.ts:74:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:140:32Caused by: ContractFunctionRevertedError: The contract function "recruitmentCompleteTime" reverted.

Version: viem@2.33.3
    at chunk-L6APSQ7K.js?v=4848d4e8:302:14
    at getContractError (chunk-L6APSQ7K.js?v=4848d4e8:310:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1114:11)
    at async Promise.all (index 8)
    at async useRosca.ts:487:11
    at async Object.getChamaInfo (useRosca.ts:717:20)
    at async useDashboardData.ts:74:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:140:32
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:513
await in (anonymous)
(anonymous) @ useRosca.ts:717
(anonymous) @ useDashboardData.ts:74
(anonymous) @ useDashboardData.ts:139
(anonymous) @ useDashboardData.ts:188
setTimeout
(anonymous) @ useDashboardData.ts:186
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
performSyncWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18868
flushSyncCallbacks @ chunk-Z2GUPSCO.js?v=4848d4e8:9119
commitRootImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19432
commitRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:19277
finishConcurrentRender @ chunk-Z2GUPSCO.js?v=4848d4e8:18805
performConcurrentWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18718
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:719 Failed to get ROSCA info for: 0xEa353D5A300966f8598161F05f0945b570d8B499
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:719
await in (anonymous)
(anonymous) @ useDashboardData.ts:74
(anonymous) @ useDashboardData.ts:139
(anonymous) @ useDashboardData.ts:188
setTimeout
(anonymous) @ useDashboardData.ts:186
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
performSyncWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18868
flushSyncCallbacks @ chunk-Z2GUPSCO.js?v=4848d4e8:9119
commitRootImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19432
commitRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:19277
finishConcurrentRender @ chunk-Z2GUPSCO.js?v=4848d4e8:18805
performConcurrentWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18718
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:747 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:720:15)
    at async useDashboardData.ts:74:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:140:32
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:747
await in (anonymous)
(anonymous) @ useDashboardData.ts:74
(anonymous) @ useDashboardData.ts:139
(anonymous) @ useDashboardData.ts:188
setTimeout
(anonymous) @ useDashboardData.ts:186
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
performSyncWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18868
flushSyncCallbacks @ chunk-Z2GUPSCO.js?v=4848d4e8:9119
commitRootImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19432
commitRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:19277
finishConcurrentRender @ chunk-Z2GUPSCO.js?v=4848d4e8:18805
performConcurrentWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18718
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:115 Failed to fetch chama data for 0xEa353D5A300966f8598161F05f0945b570d8B499: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:748:13)
    at async useDashboardData.ts:74:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:140:32
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:115
await in (anonymous)
(anonymous) @ useDashboardData.ts:139
(anonymous) @ useDashboardData.ts:188
setTimeout
(anonymous) @ useDashboardData.ts:186
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
performSyncWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18868
flushSyncCallbacks @ chunk-Z2GUPSCO.js?v=4848d4e8:9119
commitRootImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19432
commitRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:19277
finishConcurrentRender @ chunk-Z2GUPSCO.js?v=4848d4e8:18805
performConcurrentWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18718
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:166 ✅ Dashboard data fetched: {userChamas: 0, totalDeposited: 0, totalSaved: 0}
Dashboard.tsx:134 User not logged in, redirecting to home
Dashboard.tsx:134 User not logged in, redirecting to home
Dashboard.tsx:134 User not logged in, redirecting to home
Dashboard.tsx:134 User not logged in, redirecting to home
useDashboardData.ts:136 🔄 Fetching dashboard data...
useRosca.ts:513 Failed to get ROSCA info: ContractFunctionExecutionError: The contract function "status" reverted.

Contract Call:
  address:   0xEa353D5A300966f8598161F05f0945b570d8B499
  function:  status()

Docs: https://viem.sh/docs/contract/readContract
Version: viem@2.33.3
    at getContractError (chunk-L6APSQ7K.js?v=4848d4e8:311:10)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1114:11)
    at async Promise.all (index 4)
    at async useRosca.ts:487:11
    at async Object.getChamaInfo (useRosca.ts:717:20)
    at async useDashboardData.ts:74:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:140:32Caused by: ContractFunctionRevertedError: The contract function "status" reverted.

Version: viem@2.33.3
    at chunk-L6APSQ7K.js?v=4848d4e8:302:14
    at getContractError (chunk-L6APSQ7K.js?v=4848d4e8:310:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1114:11)
    at async Promise.all (index 4)
    at async useRosca.ts:487:11
    at async Object.getChamaInfo (useRosca.ts:717:20)
    at async useDashboardData.ts:74:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:140:32
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:513
await in (anonymous)
(anonymous) @ useRosca.ts:717
(anonymous) @ useDashboardData.ts:74
(anonymous) @ useDashboardData.ts:139
(anonymous) @ useDashboardData.ts:188
setTimeout
(anonymous) @ useDashboardData.ts:186
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
performSyncWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18868
flushSyncCallbacks @ chunk-Z2GUPSCO.js?v=4848d4e8:9119
commitRootImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19432
commitRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:19277
finishConcurrentRender @ chunk-Z2GUPSCO.js?v=4848d4e8:18805
performConcurrentWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18718
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:719 Failed to get ROSCA info for: 0xEa353D5A300966f8598161F05f0945b570d8B499
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:719
await in (anonymous)
(anonymous) @ useDashboardData.ts:74
(anonymous) @ useDashboardData.ts:139
(anonymous) @ useDashboardData.ts:188
setTimeout
(anonymous) @ useDashboardData.ts:186
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
performSyncWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18868
flushSyncCallbacks @ chunk-Z2GUPSCO.js?v=4848d4e8:9119
commitRootImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19432
commitRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:19277
finishConcurrentRender @ chunk-Z2GUPSCO.js?v=4848d4e8:18805
performConcurrentWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18718
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:747 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:720:15)
    at async useDashboardData.ts:74:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:140:32
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:747
await in (anonymous)
(anonymous) @ useDashboardData.ts:74
(anonymous) @ useDashboardData.ts:139
(anonymous) @ useDashboardData.ts:188
setTimeout
(anonymous) @ useDashboardData.ts:186
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
performSyncWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18868
flushSyncCallbacks @ chunk-Z2GUPSCO.js?v=4848d4e8:9119
commitRootImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19432
commitRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:19277
finishConcurrentRender @ chunk-Z2GUPSCO.js?v=4848d4e8:18805
performConcurrentWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18718
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:115 Failed to fetch chama data for 0xEa353D5A300966f8598161F05f0945b570d8B499: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:748:13)
    at async useDashboardData.ts:74:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:140:32
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:115
await in (anonymous)
(anonymous) @ useDashboardData.ts:139
(anonymous) @ useDashboardData.ts:188
setTimeout
(anonymous) @ useDashboardData.ts:186
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
performSyncWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18868
flushSyncCallbacks @ chunk-Z2GUPSCO.js?v=4848d4e8:9119
commitRootImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19432
commitRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:19277
finishConcurrentRender @ chunk-Z2GUPSCO.js?v=4848d4e8:18805
performConcurrentWorkOnRoot @ chunk-Z2GUPSCO.js?v=4848d4e8:18718
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:166 ✅ Dashboard data fetched: {userChamas: 0, totalDeposited: 0, totalSaved: 0}

=============================================================================
🔧 MIGRATION FIXES APPLIED (2025-08-20)
=============================================================================

ISSUE: Contract function reverts when calling enhanced ROSCA functions
- ERROR: ContractFunctionExecutionError: recruitmentCompleteTime() reverted
- ERROR: ContractFunctionExecutionError: status() reverted
- CAUSE: App was trying to call new enhanced ROSCA functions on old contract 0xEa353D5A300966f8598161F05f0945b570d8B499

FIXES IMPLEMENTED:

1. ✅ Enhanced Error Handling in useRosca.ts
   - Added contract compatibility check before calling enhanced functions
   - App now detects old contracts and skips them gracefully
   - Warning messages help identify incompatible contracts

2. ✅ Migration System Added
   - Created src/utils/migration.ts for handling contract upgrades
   - Automatic localStorage cleanup on app startup
   - Version tracking to prevent repeat migrations
   - User notification system for migration completion

3. ✅ Migration-Safe Storage
   - Updated useDashboardData.ts to use migration-safe storage functions
   - Old contract addresses automatically filtered out
   - Prevents future issues with incompatible contracts

4. ✅ Environment Variable Fix
   - Fixed main.tsx to check VITE_ROSCA_FACTORY_ADDRESS instead of VITE_CHAMA_FACTORY_ADDRESS
   - Proper logging for contract configuration

5. ✅ Automatic Migration on Startup
   - Migration runs automatically when app loads
   - Clears old localStorage data that might contain incompatible addresses
   - Shows user notification when migration completes

RESULT:
- App should no longer attempt to call enhanced functions on old contracts
- localStorage is cleaned of old contract addresses
- Users get a smooth migration experience with notifications
- Future contract upgrades will be handled automatically

TEST STEPS:
1. Clear browser localStorage (or let migration handle it)
2. Refresh the app
3. Check console for migration messages
4. Verify no more contract function revert errors
5. Create/join new ROSCAs using enhanced contract system

=============================================================================
