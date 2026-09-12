# probe — Navier–Stokes statement fidelity

Status: **proposed**  
Tests: `verification-has-multiple-boundaries`

## Verification contract

```yaml
claim: >
  The formal Navier–Stokes Comparator challenge being independently checked
  materially matches the informal breakdown claim used to present the result.
scope: >
  OpenAI's R3 and periodic breakdown results, the Clay alternatives C/D,
  and the trusted Comparator challenge statements.
claim_type: formal / semantic-fidelity

alternatives:
  A: >
    Material quantifiers, regularity assumptions, forcing conditions, energy
    conditions, periodicity requirements, and conclusion align closely enough
    that independent proof checking bears directly on the intended claim.
  B: >
    At least one material condition is omitted, weakened, strengthened, or
    translated differently enough that the formal certificate establishes a
    meaningfully narrower or different proposition.

discriminator: >
  Independently translate the trusted Comparator theorem statements and their
  referenced definitions back into ordinary mathematical language, then compare
  them against the Clay problem statement and the public theorem claim using a
  predeclared checklist of material conditions.
expected_if_A: >
  No material mismatch on the checklist; remaining uncertainty moves to proof
  checking, trusted-base assumptions, and expert mathematical uptake.
expected_if_B: >
  One or more material mismatches that change what the formal certificate licenses.

independent_verifier: >
  Clay's official problem statement + the separately authored Formal Conjectures
  challenge lineage + Lean Comparator/external checker infrastructure.
independence_rationale: >
  The public claim, challenge statement lineage, and checking machinery are not
  a single prose self-evaluation by the proof-generating system.

result:
would_change_if_wrong: >
  If B, a Lean-valid proof cannot by itself promote the broader public claim.
  If A, the verification boundary moves downstream to proof/checker trust and
  mathematical interpretation rather than statement mismatch.
status: proposed
```

## Method

Before opening the proof body, extract the theorem signatures and all definitions that contribute material assumptions. Build a checklist for viscosity, dimension, initial smoothness/divergence/decay, force smoothness/decay, time domain, energy conditions, periodicity, and the exact breakdown conclusion. Compare the same checklist against the Clay wording and public statement.

Only after the semantic comparison passes should the proof certificate be treated as verifying the intended claim.

## Observation

Not run yet.

## What changed

Nothing yet. Promotion created a question with a verifier; it did not create a result.
