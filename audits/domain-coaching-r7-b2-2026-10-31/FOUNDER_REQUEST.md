# DOMAIN_COACHING_R7-B.2 — Founder request (verbatim)

Direct Founder request for DOMAIN_COACHING_R7-B.2, delivered to the project agent runtime (`tools/agent-runtime/`) as the mission request on 2026-10-31 (America/Sao_Paulo). It is the authority for this mission. Recorded verbatim below the rule; the only change is line endings, CRLF → LF (the repository convention). Replacing every LF of the body with CRLF gives back the delivered bytes, SHA-256 `3850ec317374ea8f29eac621e13ec5d54aa5b9f398e8e73aa526a034aa66cad7`. The escaped Markdown (`\#`, `\_`, `&#x20;`) is as delivered.

---

\# DOMAIN\_COACHING\_R7-B.2



\## AUTHORIZATION



Founder authorizes one narrow runtime mission:



`DOMAIN\_COACHING\_R7-B.2`



This mission exists only to resolve the remaining R7-B.1 blocker:



`QE-R7B1-04`



R7-C is NOT authorized.



Do not broaden the mission.



\---



\# BASELINE



Authoritative predecessor:



`DOMAIN\_COACHING\_R7-B.1`



Status:



`CLOSED NOT\_READY`



with exactly one blocking finding:



`QE-R7B1-04`



R7-B.1 closure commit:



`2c6cb931ccc6ad42964db89c33235ab4b0bfa52c`



Runtime freeze under review:



`R7B1-FREEZE-2`



The Agent Execution Runtime infrastructure may exist on top of this baseline, but it does not change Coaching Core authority or the R7-B.1 findings.



\---



\# BLOCKER TO RESOLVE



\## QE-R7B1-04



Known reproduced behavior:



In the week an athlete returns from a break:



1\. late evidence can arrive describing training performed before the break;

2\. afterward, the athlete can report pain associated with an exercise;

3\. the R7-A late-evidence clarification/question path currently runs before the clinical-screen path;

4\. the system can therefore ask the athlete to confirm the interruption rather than routing the pain report to the required human/clinical path.



This violates the existing invariant:



`clinical-screen-first`



The issue is pre-existing relative to the B.1 correction cycle and was reproduced on the final B.1 bytes.



\---



\# MISSION OBJECTIVE



Make the smallest correct runtime change such that:



> whenever an input/state requires the clinical safety screen, that safety path has precedence over the late-evidence clarification path and other nonclinical re-entry questions.



The correction must preserve the valid R7-A late-evidence behavior everywhere that clinical screening is not required.



\---



\# IMPORTANT



This is NOT permission to redesign the intake/state machine.



This is NOT permission to rewrite R7-A.



This is NOT permission to clean up nearby code.



This is NOT permission to revisit closed R7-B blockers.



This is NOT permission to begin R7-C.



\---



\# MUST PRESERVE



Preserve all already-passing behavior from:



\- R7-A;

\- R7-B0;

\- R7-B;

\- R7-B.1.



Specifically preserve the B.1 closures for:



\- taper/race/post-event substitution familiarity;

\- reconstructed novice-template persistence;

\- factual correction + block choice;

\- SKILL\_MISMATCH fallback;

\- QE-R7B-01 residual;

\- QE-R7B-05 residual;

\- clinical-screen behavior already corrected for block-choice paths;

\- no-lower-skill-option behavior.



Do not reopen these absent a demonstrated regression caused by this change.



\---



\# SAFETY INVARIANT



The priority must remain conceptually:



```text

clinical/safety requirement

&#x20;       ↓

takes precedence

&#x20;       ↓

nonclinical clarification / late-evidence question

```



Do not solve this by suppressing legitimate late evidence.



Do not discard athlete evidence.



Do not fabricate clinical interpretation.



When human/clinical escalation is required, preserve the existing human-routing semantics.



\---



\# IMPLEMENTATION STRATEGY



Start from the reproduced `QE-R7B1-04` case.



1\. Reproduce it on the authoritative baseline.

2\. Identify the smallest ordering/precedence defect.

3\. Add a failing regression test/probe before or with the fix.

4\. Correct only the necessary decision path.

5\. Verify the specific blocker.

6\. Run the relevant inherited regression suites.

7\. Run targeted adversarial cases around the changed precedence.

8\. Freeze only when evidence is complete.



Avoid broad refactors.



\---



\# REQUIRED ADVERSARIAL NEIGHBORS



At minimum distinguish:



\### A

Late pre-break training evidence, no pain/clinical signal.



Expected:



existing late-evidence behavior remains valid.



\### B

Pain/clinical signal requiring safety screen, no late evidence.



Expected:



existing clinical-screen behavior.



\### C

Late evidence + pain/clinical signal in return/re-entry state.



Expected:



clinical screen wins.



\### D

Factual correction unrelated to clinical safety + late evidence.



Expected:



do not accidentally route nonclinical corrections to clinical handling.



\### E

Block choice + clinical signal.



Expected:



preserve the prior B.1 clinical-screen correction.



\### F

Equipment/skill substitution + no clinical signal.



Expected:



preserve B.1 substitution behavior.



\---



\# QUALITY / EVIDENCE



Do not reduce any existing gate.



Use deterministic local tooling for large test/probe outputs whenever appropriate.



Use the Agent Execution Runtime checkpoints at meaningful semantic boundaries.



Delegate bounded engineering work to Codex only when useful and verifiable.



Claude remains responsible for semantic/safety judgment.



Required evidence should include:



\- direct reproduction before fix;

\- direct blocker regression after fix;

\- relevant inherited tests;

\- targeted adversarial neighbors;

\- mutation or equivalent negative-control evidence where proportionate;

\- comparison against R7B1-FREEZE-2 for paths outside the affected behavior.



Do not rerun unrelated expensive evidence merely for ceremony if unchanged evidence can safely be inherited.



\---



\# REVIEW



Because the remaining blocker is explicitly safety/order related, require the smallest competent independent review necessary to answer:



1\. Does clinical screening now reliably precede the late-evidence question when required?

2\. Was legitimate R7-A late-evidence behavior preserved?

3\. Did the fix regress any of the B.1 closures?

4\. Is there any new route that can bypass the required safety handling?



Do not add reviewers without a concrete consumer/question.



\---



\# CORRECTION POLICY



This is a narrow closure mission.



If review finds an issue caused by the B.2 change, allow only the minimum correction necessary under the project's existing loop policy.



Do not convert B.2 into another broad runtime round.



\---



\# GIT / EXECUTION



Use the Agent Execution Runtime.



The runtime owns routine session transitions, checkpoints and executor routing.



Use isolated worktrees/branches.



Normal Git lifecycle is agent-owned:



\- validate baseline;

\- branch;

\- commit;

\- push;

\- verify remote HEAD.



Do not:



\- merge main;

\- force push;

\- destructive reset;

\- rewrite history;

\- delete remote refs;

\- touch credentials.



Founder should not be asked to relay prompts between sessions or between Claude and Codex.



\---



\# TERMINAL CONDITIONS



\## CLOSED\_READY



Only if:



\- QE-R7B1-04 is demonstrably closed;

\- clinical-screen-first precedence is proven;

\- relevant R7-A behavior remains valid;

\- B.1 closed behaviors remain valid;

\- required review accepts the final bytes;

\- no new blocker remains.



Then:



`R7B\_RUNTIME\_REPERTOIRE\_READY = READY`



may be set only if all other inherited requirements remain satisfied.



This does NOT automatically imply:



`V1\_COACHING\_AUTHORITY\_READY = YES`



and does NOT authorize R7-C.



\---



\## CLOSED\_NOT\_READY



If a real blocker remains, close honestly with:



\- exact reproducer;

\- evidence;

\- owner;

\- next narrow action.



Do not continue indefinitely.



\---



\# STOP\_WHEN



Stop immediately when the B.2 question is answered with sufficient evidence.



No opportunistic cleanup.



No new architecture.



No catalogue expansion.



No product work.



No Figma work.



No R7-C.



The only question this mission must answer is:



> Is QE-R7B1-04 closed correctly, with clinical safety precedence restored and the valid predecessor behavior preserved?

