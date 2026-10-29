# Holdout metadata preflight

The sealed corpus has raw SHA256 `9557f4bf539073301cde242172cd019983ebf8997fc16b91aae37e634f0cf5c5`. The first executor invocation stopped at the metadata digest assertion before iterating or evaluating any case: the independent manifest named the digest `corpusRawSha256`, while the frozen executor expects `corpusSha256`.

The independent author was asked to preserve the exact original manifest separately and add only the identical-value alias plus provenance note. No corpus fact, qualitative expectation, timestamp of corpus sealing, runtime, policy, freeze or executor is changed. There is no discarded first-case result: FIRST_EVALUATION.json did not exist at this preflight failure. The first actual runtime evaluation remains exclusive-create and immutable.
