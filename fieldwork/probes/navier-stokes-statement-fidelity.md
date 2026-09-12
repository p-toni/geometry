# probe — Navier–Stokes statement fidelity

Status: **answered for Clay C/D; broader public narrative remains separately scoped**  
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

verification_target: >
  Semantic fidelity of the Comparator challenge to Clay alternatives C and D;
  not the correctness of the proof body itself.
independent_verifier: >
  Clay's official problem statement + the separately authored Formal Conjectures
  challenge lineage + Lean Comparator challenge definitions.
independence_rationale: >
  The public claim, challenge statement lineage, and checking machinery are not
  a single prose self-evaluation by the proof-generating system.
trusted_base: >
  Accuracy of the Clay statement, the semantic translation from Lean definitions,
  and the Formal Conjectures/Comparator statement lineage.

result: >
  A for the core Clay C/D claim. The Comparator theorem and its definitions
  materially match the official breakdown alternatives. Stronger public/paper
  properties such as zero initial velocity and an explicit finite-time blow-up
  mechanism are not all exposed by the Comparator theorem signature and should
  be treated as separate verification targets.
would_change_if_wrong: >
  If B, a Lean-valid proof could not by itself promote the broader Clay claim.
  Because A survives for C/D, the remaining verification burden moves downstream
  to proof checking, trusted-base assumptions, and mathematical uptake.
status: answered
```

## Method

The proof body was not used to decide statement fidelity. I compared the official Clay alternatives C/D against the public Comparator theorem signatures and the definitions they quantify over.

Checklist:

| Material condition | Clay C/D | Comparator challenge | Audit |
|---|---|---|---|
| viscosity | arbitrary `ν > 0` | theorem parameter `nu` with `hnu : nu > 0` | aligned |
| dimension | 3 | `ℝ³` / `Fin 3` | aligned |
| initial velocity, R3 | smooth, divergence-free, rapid spatial decay | `InitialVelocityConditionDecay` | aligned |
| force, R3 | smooth, rapid decay in space and time | `ForceConditionDecay` | aligned in mathematical intent; formal version uses norms of iterated Fréchet derivatives |
| equation / incompressibility / initial condition | equations (1)–(3) | `NavierStokesExistenceAndSmoothness` | aligned |
| global smoothness | `p,u ∈ C∞` on `t ≥ 0` | `ContDiffOn` for velocity and pressure | aligned |
| R3 bounded energy | uniform finite kinetic energy | `MemLp` plus uniform integral bound | aligned in mathematical intent; `MemLp` makes integrability explicit |
| periodic initial data / force | condition (8) plus decay (9) | periodic initial/force structures plus time decay | aligned |
| periodic solution | periodic velocity and smooth `p,u`; errata adds periodic pressure | formal structure includes periodic velocity and pressure | aligned with errata |
| breakdown conclusion | no global physically reasonable solution | negation of existence of a formal solution structure | aligned |

The Comparator submission exposes exactly the two Clay breakdown theorem names and permits only the standard `propext`, `Quot.sound`, and `Classical.choice` axioms in the challenge configuration. The repository also provides Comparator + external-checker instructions; that concerns derivational validation, a separate boundary from this probe.

## Observation

The core Millennium claim passes this semantic-fidelity audit: I found no material weakening or mismatch that would make the Comparator theorem a different proposition from Clay alternatives C/D.

A useful seam appeared immediately afterward. OpenAI's public explanation contains stronger descriptive claims — notably a construction that starts from zero initial velocity / “at rest” and develops a finite-time singularity. The Comparator theorem signature does **not** require `u₀ = 0`; it only proves the broader existential breakdown alternative. The proof repository contains additional construction lemmas about time localization and zero initial velocity, but those are not the same verification target as the Comparator C/D challenge.

So:

> **Lean/Comparator can certify the Clay alternative while still leaving stronger narrative properties to separate certificates.**

This is not a defect. It is precisely why verification targets must be named.

## What changed

The probe did **not** revise the Geometry seed.

It did change the research system. “Verified” now needs an object:

- verified derivation of which statement?
- faithful to which intended claim?
- under which assumptions?
- checked by which trusted base?
- licensing which downstream conclusion?

The first promoted probe therefore survived, but its main output is a sharper verification boundary rather than a thesis update.
