# Interrupted run-5 judge artifacts (no verdict)

The files directly in this folder (`*.mjs` and `out/`) were written on 2026-11-01 between 01:29 and 01:33 by the first ssctr judge instance dispatched in supervised session 5 (U4b). That session ended its turn while the judge was still running in the background, so the supervisor stopped the judge (`.agent-runtime/sessions/0005.stderr.log`). The judge recorded **no verdict and no findings**.

Classification (Founder resolution 2026-11-01T12:11:17Z): mission artifacts, preserved as written and committed for provenance; they are **not** a review and are not evidence for any gate. `dual.mjs`, `s5-downstream.mjs` and `s5-factual-proposal.mjs` are byte-identical copies of the Engineering probes in `reviews/engineering/probes/`. Empty `out/*.txt|json` files are outputs of a command that had not finished.

The one ssctr review of this gate (session 6) is a fresh instance that writes its probes under `probes/r1/` and does not modify these files.
