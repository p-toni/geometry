# collision — reliability can live above the components

Status: **open**

## Independent inputs

- `von-neumann-1956-reliable-unreliable` — redundant architectures can implement a reliable logical function using unreliable physical components under specified noise assumptions.
- `shapiro-et-al-2011-crdts` — replicas can converge despite asynchronous local updates when merge/update operations satisfy algebraic constraints.
- `mccolgan-difrisco-2024-developmental-system-drift` — a conserved phenotype can persist while underlying developmental mechanisms diverge.

## Why this is a collision rather than an agreement

The three cases preserve different things by different mechanisms: logical correctness through active error suppression, replicated state through monotone/commutative structure, and phenotype across evolutionary drift. Calling all of them “robustness” would erase the mechanism.

What collides is the assumption that persistence at level L requires persistence or reliability at level L-1.

## New distinction / contradiction

Separate at least:

- **component fidelity** — individual carriers remain correct/stable;
- **architectural correction** — deviations are detected or statistically suppressed;
- **algebraic convergence** — allowed local changes force eventual agreement;
- **functional persistence** — output/capability remains despite implementation drift;
- **specification correctness** — the preserved behavior is actually the behavior wanted.

A system can score high on one and low on another.

## Pressure on the seed

“Invariant” may sometimes name a **maintained relation** rather than a passively surviving feature. Some invariants exist because the system spends work restoring them.

That makes error correction and repair candidates for first-class operators in any account of persistent geometry.

## What remains unresolved

How to distinguish a genuinely maintained invariant from an observer choosing a coarse level at which deviations disappear. The repair mechanism should be identifiable if “maintenance” is doing explanatory work.

## Candidate discriminating probe

Use a simple noisy Boolean circuit or replicated-state toy model. Compare raw component error with logical/output error as redundancy or merge constraints change. The probe succeeds if system-level reliability improves while component reliability is held fixed, and if removing the restoring constraint collapses the effect.
