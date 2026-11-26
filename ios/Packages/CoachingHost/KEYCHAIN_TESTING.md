# CoachingHost: Keychain in automated tests

**Rule.** `swift test` on macOS never touches the login keychain. The tests run without any authorization dialog, in any session, any worktree and CI. The production Keychain path is unchanged.

## The problem (2026-11-26)

`swift test` asked again and again for access to items of the service `fit.vilumo.repmile.lab.coachinghost`, even after "Always Allow". Three causes worked together:

1. **The tests used the macOS login keychain.** On macOS, `SecItem*` without `kSecUseDataProtectionKeychain` reaches the legacy file-based login keychain. Its items carry an ACL that trusts the creating application by its code identity. That is not the iOS data-protection Keychain that production uses.
2. **The test binaries are signed ad hoc.** `CoachingHostPackageTests.xctest` and `coachinghost-proc` are linker-signed (`Signature=adhoc`, `TeamIdentifier=not set`), so their CDHash changes at every rebuild. "Always Allow" adds that exact binary to the item's ACL, and the next build is a different binary. So it prompts again, every time.
3. **Two processes shared items.** The cross-process tests create an item in one binary (xctest or `coachinghost-proc`) and read or delete it in the other. That always prompts. When a prompt went unanswered, the item could not be deleted: 12 `test.*` items were left in the login keychain.

The data-protection Keychain on macOS would avoid the ACL prompts. But it needs a `keychain-access-groups` entitlement and a team-signed binary, which `swift test` binaries cannot have. Weakening ACLs, partition lists or the login keychain, or storing a keychain password in a script, is not acceptable.

## The fix

| Where | What |
|---|---|
| `KeychainItems.Storage` (`Sources/CoachingHost/Keychain.swift`) | `.system` is the real Keychain: production, and every iOS run. `.file(URL)` exists **only in test builds** (`COACHINGHOST_TESTING`). Production `CoachingHost.open` always uses `.system`; the storage cannot be set from outside the module. |
| `TestKeychainFile` (`Sources/CoachingHost/TestKeychainFile.swift`, `#if COACHINGHOST_TESTING`) | A file-backed stand-in with the same answers as the Keychain: `errSecSuccess`, `errSecItemNotFound`, `errSecDuplicateItem`. It has the same atomicity across processes: add-if-absent is a hard `link(2)`, update is tmp + fsync + rename, and nothing is ever deleted before an add. `MacKeychainIntegrationTests.testFileStorageMatchesTheKeychainContract` checks this contract. |
| `TestEnv.keychainDirectory` / `TestEnv.items(_:)` (`Tests/CoachingHostTests/Support.swift`) | On macOS this is `~/Library/Application Support/coachinghost-tests/keychain/`, shared by xctest and `coachinghost-proc`, which gets it through `--keychain-dir`. On iOS it is nil, so the iPhone tests use the real Keychain. Every test builds its items through these helpers or `HostFixture`. |
| **Tripwire** (`KeychainItems.init`, `#if COACHINGHOST_TESTING && os(macOS)`) | Under XCTest on macOS, a `.system` `KeychainItems` for the production service is a `fatalError` that names this file. A future test that forgets the test storage fails loudly instead of prompting a person. |
| `coachinghost-proc` | Refuses to start without `--keychain-dir`. |

**Where the real Keychain is still tested:**
- **iPhone (production Keychain, data protection):** every device suite (`CoachingHostLab`, `tools/device-lock/with-device.sh coachinghost`). It covers the class `AfterFirstUnlockThisDeviceOnly`, the anchor, the key and the locked-device phase. There are no ACL prompts on iOS.
- **macOS, opt-in and isolated:** run `CH_REAL_KEYCHAIN=1 swift test --filter MacKeychainIntegrationTests`. It uses a service unique to the run (`fit.vilumo.repmile.lab.coachinghost.it.<uuid>`), and one process creates, uses and removes everything. A process is never asked for access to an item it created itself, so this does not prompt, even right after a rebuild.

## Rules for new tests and pipelines

- Do not construct `KeychainItems(...)` in macOS tests without `storage: TestEnv.keychainStorage`. Use `TestEnv.items(prefix)` or `HostFixture`.
- Do not call `CoachingHost.openForTesting` without `testKeychainDirectory: TestEnv.keychainDirectory`. The tripwire catches both.
- A new helper process gets `--keychain-dir`.
- CI needs no keychain set-up, no unlocked login keychain, no `security` commands and no secrets.
- If a dialog ever appears again, find the test that bypassed `TestEnv` (the tripwire should already have stopped it). Never click "Always Allow" as a fix: it lasts for one build only.

## Validation

`audits/v1-ios-coachinghost-2026-11-24/results/mac/keychain-autonomy.log` records three consecutive full runs: a clean rebuild (`rm -rf .build`), an incremental run, and a recompilation after touching sources. It also records the opt-in real-Keychain test. Every run ran under a 900 s alarm, because a dialog would block a Keychain call. The number of login-keychain items for the service did not change: nothing was read or written there.

## Leftovers from before the fix

The 12 `test.*` items that earlier runs left in the login keychain are inert: no test reads them any more. Removing them is optional; it is a manual one-off by the owner of the Mac:

```sh
security dump-keychain | grep -A14 '"svce"<blob>="fit.vilumo.repmile.lab.coachinghost"' | sed -n 's/.*"acct"<blob>="\(test\.[^"]*\)".*/\1/p' |
  while read a; do security delete-generic-password -s fit.vilumo.repmile.lab.coachinghost -a "$a" >/dev/null; done
```

macOS may ask for confirmation once per item, because their ACLs name old test builds. Only `test.*` accounts are matched.
