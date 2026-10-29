# DOMAIN_COACHING_R6 — Founder bound on further review cycles (2026-10-26)

A direct Founder message to the Claude Code continuation session (fourth session), sent while SSCTR round 11 was running. It bounds the fix-and-review cycle of R6. It does not change the original authority in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md) or the [continuation request](FOUNDER_CONTINUATION_REQUEST.md). Reproduced verbatim:

> - Mais um ciclo, no máximo, e só se o bloqueio for novo, estreito e só de runtime.
> - Qualquer outra coisa fecha com bloqueio explícito e segue para a R7: o D52 falhando de novo, pedido de mudança na política ou necessidade de decisão minha, pois estasmos parecendo presos em um loop infinito nesse momento

## The rule, as the continuation root applies it

After SSCTR round 11 returns:

| Round 11 outcome | What happens |
|---|---|
| `freezeVerdict.runtimeMayBeFrozen === true` | The normal path: FREEZE-2, the single post-fix rerun, the judges, deliverables and closure (`CURRENT_TASK.md` steps 4–6). |
| Freeze NO, and every blocking item is **new, narrow and runtime-only** | **One last cycle** is allowed: fix, tests, author evidence, dossier and one narrow SSCTR round 12 at the same policy hash. If round 12 does not allow the freeze, R6 closes with an explicit blocker. There is no round 13. |
| Freeze NO for any other reason | R6 **closes with an explicit blocker** and the next step is DOMAIN_COACHING_R7. There is no further SSCTR round in R6. |

"Any other reason" covers three cases:
- **D52 fails again.** A blocking item is D52, part of it, or a change the SSCTR requires to the D52 fix or to one of its four dossier questions.
- **The policy must change.** The SSCTR requires any change to the policy text.
- **The Founder must decide.** The resolution needs a Founder-owned decision.

The terms in the table mean:
- **New:** not D52 and not a restatement of an earlier defect.
- **Narrow:** a bounded runtime defect, fixable with targeted regression tests and re-checkable in a narrow review at the same hash, without redesigning behaviour across envelopes.
- **Runtime-only:** no policy byte changes and no Founder or Product decision.

Where a case is borderline, R6 closes. The bound exists to stop the loop. Non-blocking recommendations never open a cycle.

## Closing with an explicit blocker

When R6 closes with a blocker:
- **What stops.** The runtime is not edited again, no SSCTR round follows, and FREEZE-2 does not happen. `freeze-r6-2.mjs` refuses without the SSCTR's freeze verdict anyway.
- **The blocker record.** It is written down with its ids, the SSCTR's stated required change, the reason it is outside this bound, its owner and its evidence paths. It goes first in `OPEN_GAPS_R6` and in the R7 entry.
- **What still runs.** Independent work that needs no FREEZE-2 still runs. The main item is the coaching-quality judge on the first evaluation, which is the primary record bound to FREEZE-1. Work that depends on FREEZE-2 is recorded as not run, with the reason: the post-fix rerun, the engineering re-review of FREEZE-2 and the R5 reclassification.
- **Verdicts.** They follow the evidence, with no forced READY. The KMP prep gate is NOT_READY, and `NEXT_ENGINEERING_STEP` is DOMAIN_COACHING_R7 with this blocker as its first item.
- **R7 is not started here.** It needs its own Founder-authorized mission definition.
- **Verification.** `VERIFICATION.json` reports honestly whatever fails because the fixed runtime has no freeze.
