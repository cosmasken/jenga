main.tsx:70 🔧 Environment Configuration Check:
main.tsx:71 VITE_DYNAMIC_ENVIRONMENT_ID: ✅ Set
main.tsx:75 VITE_BLAST_API_PROJECT_ID: ⚠️ Missing (using fallback RPC)
main.tsx:78 🌐 Using fallback RPC: https://rpc.testnet.citrea.xyz
main.tsx:79 💡 For better performance, add your Blast API project ID to .env
main.tsx:82 VITE_ROSCA_FACTORY_ADDRESS: ⚠️ Using default
migration.ts:54 📝 No migration needed, already on version: 2.0.0
main.tsx:121 🚀 Starting app with Dynamic Labs integration
main.tsx:122 Environment ID: 2762a57b...
main.tsx:123 Network Config: Citrea Testnet
chunk-IF3SVANV.js?v=4848d4e8:2247 [DynamicSDK] [INFO]: Warning!
chunk-IF3SVANV.js?v=4848d4e8:2247 [DynamicSDK] [INFO]: This is a browser feature intended for developers. You are reading this message because you opened the browser console, a developer tool.1. Never share your tokens or sensitive information with anyone.2. Do not paste any code you do not fully understand.3. If someone instructed you to do this, it is likely a scam.Injecting code into your browser could result in loss of tokens or control of your account that cannot be recovered or protected.
useDashboardData.ts:74 💾 Loading ROSCAs from localStorage for user: 0x09aB514B6974601967E7b379478EFf4073cceD06
useDashboardData.ts:90 ✅ Loaded 0 valid ROSCA addresses from storage
useDashboardData.ts:93 💡 No ROSCAs found in storage.
useDashboardData.ts:94    → Create a new ROSCA to get started
useDashboardData.ts:95    → Or use "Add ROSCA" to track an existing ROSCA address
useDashboardData.ts:74 💾 Loading ROSCAs from localStorage for user: 0x09aB514B6974601967E7b379478EFf4073cceD06
useDashboardData.ts:90 ✅ Loaded 0 valid ROSCA addresses from storage
useDashboardData.ts:93 💡 No ROSCAs found in storage.
useDashboardData.ts:94    → Create a new ROSCA to get started
useDashboardData.ts:95    → Or use "Add ROSCA" to track an existing ROSCA address
Dashboard.tsx:152 Navigating to create chama page
useDashboardData.ts:74 💾 Loading ROSCAs from localStorage for user: 0x09aB514B6974601967E7b379478EFf4073cceD06
useDashboardData.ts:90 ✅ Loaded 0 valid ROSCA addresses from storage
useDashboardData.ts:93 💡 No ROSCAs found in storage.
useDashboardData.ts:94    → Create a new ROSCA to get started
useDashboardData.ts:95    → Or use "Add ROSCA" to track an existing ROSCA address
useDashboardData.ts:74 💾 Loading ROSCAs from localStorage for user: 0x09aB514B6974601967E7b379478EFf4073cceD06
useDashboardData.ts:90 ✅ Loaded 0 valid ROSCA addresses from storage
useDashboardData.ts:93 💡 No ROSCAs found in storage.
useDashboardData.ts:94    → Create a new ROSCA to get started
useDashboardData.ts:95    → Or use "Add ROSCA" to track an existing ROSCA address
useRosca.ts:177 🔗 Getting wallet client from Dynamic Labs...
useRosca.ts:179 ✅ Wallet client obtained successfully
useRosca.ts:177 🔗 Getting wallet client from Dynamic Labs...
useRosca.ts:179 ✅ Wallet client obtained successfully
useRosca.ts:259 ✅ Transaction submitted: 0x3f122ce1c287fbad8d66b4ea490228abf837f5f9c6c2d4464a6ace9f6e66d792
useRosca.ts:262 ⏳ Waiting for transaction confirmation...
useRosca.ts:264 ✅ Transaction confirmed: 0x3f122ce1c287fbad8d66b4ea490228abf837f5f9c6c2d4464a6ace9f6e66d792
useRosca.ts:346 ✅ Extracted ROSCA address from receipt: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
useDashboardData.ts:334 ➕ Adding ROSCA manually: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
useDashboardData.ts:344 ✅ ROSCA added and stored locally
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:74 💾 Loading ROSCAs from localStorage for user: 0x09aB514B6974601967E7b379478EFf4073cceD06
useDashboardData.ts:90 ✅ Loaded 1 valid ROSCA addresses from storage
useDashboardData.ts:74 💾 Loading ROSCAs from localStorage for user: 0x09aB514B6974601967E7b379478EFf4073cceD06
useDashboardData.ts:90 ✅ Loaded 1 valid ROSCA addresses from storage
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
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
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:872 Failed to get chama info: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:836:15)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:872
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:194 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: Error: Failed to get ROSCA info
    at Object.getChamaInfo (useRosca.ts:873:13)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
    at async useDashboardData.ts:225:30
overrideMethod @ hook.js:608
(anonymous) @ useDashboardData.ts:194
await in (anonymous)
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useDashboardData.ts:239 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
useDashboardData.ts:263 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
useDashboardData.ts:216 🔄 Fetching data for 1 ROSCAs...
useRosca.ts:581 Failed to get ROSCA info: AbiFunctionNotFoundError: Function "token" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.

Docs: https://viem.sh/docs/contract/encodeFunctionData
Version: viem@2.33.3
    at prepareEncodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2472:13)
    at chunk-ACIYF7DR.js?v=4848d4e8:2490:12
    at encodeFunctionData (chunk-ACIYF7DR.js?v=4848d4e8:2491:5)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:1096:20)
    at readContract (chunk-L6APSQ7K.js?v=4848d4e8:7270:29)
    at Proxy.<anonymous> (chunk-L6APSQ7K.js?v=4848d4e8:1729:73)
    at useRosca.ts:556:23
    at async Object.getChamaInfo (useRosca.ts:833:20)
    at async useDashboardData.ts:144:25
    at async Promise.all (index 0)
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:581
await in (anonymous)
(anonymous) @ useRosca.ts:833
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
useRosca.ts:835 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ hook.js:608
(anonymous) @ useRosca.ts:835
await in (anonymous)
(anonymous) @ useDashboardData.ts:144
(anonymous) @ useDashboardData.ts:224
(anonymous) @ useDashboardData.ts:289
setTimeout
(anonymous) @ useDashboardData.ts:287
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
 Failed to get ROSCA info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:351
await in (anonymous)
(anonymous) @ useRosca.ts?t=1755707765315:542
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get ROSCA info for: 0xfc325d5b43adae40267453042b6bd39f4b5effc0
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:544
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 Failed to get chama info: 
overrideMethod @ installHook.js:1
(anonymous) @ useRosca.ts?t=1755707765315:577
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:86
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ❌ Failed to fetch chama data for 0xfc325d5b43adae40267453042b6bd39f4b5effc0: 
overrideMethod @ installHook.js:1
(anonymous) @ useDashboardData.ts?t=1755707765315:128
await in (anonymous)
(anonymous) @ useDashboardData.ts?t=1755707765315:149
(anonymous) @ useDashboardData.ts?t=1755707765315:198
setTimeout
(anonymous) @ useDashboardData.ts?t=1755707765315:196
commitHookEffectListMount @ chunk-Z2GUPSCO.js?v=4848d4e8:16915
commitPassiveMountOnFiber @ chunk-Z2GUPSCO.js?v=4848d4e8:18156
commitPassiveMountEffects_complete @ chunk-Z2GUPSCO.js?v=4848d4e8:18129
commitPassiveMountEffects_begin @ chunk-Z2GUPSCO.js?v=4848d4e8:18119
commitPassiveMountEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:18109
flushPassiveEffectsImpl @ chunk-Z2GUPSCO.js?v=4848d4e8:19490
flushPassiveEffects @ chunk-Z2GUPSCO.js?v=4848d4e8:19447
(anonymous) @ chunk-Z2GUPSCO.js?v=4848d4e8:19328
workLoop @ chunk-Z2GUPSCO.js?v=4848d4e8:197
flushWork @ chunk-Z2GUPSCO.js?v=4848d4e8:176
performWorkUntilDeadline @ chunk-Z2GUPSCO.js?v=4848d4e8:384
 ✅ Successfully loaded 0 valid ROSCAs out of 1 total
 📊 Dashboard stats calculated: {userChamas: 0, totalDeposited: '0.0000', totalSaved: '0.0000'}
 🔄 Fetching data for 1 ROSCAs...
