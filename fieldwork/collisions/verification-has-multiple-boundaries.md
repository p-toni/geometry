# collision — verification has multiple boundaries

Status: **probing**

## Independent inputs

- `openai-2026-navier-stokes` — an AI system generated a mathematical proof and a Lean formalization of a Millennium-problem claim.
- `lean-2026-validating-proofs` — Lean distinguishes derivational checking, adversarial validation, and the separate question of what the theorem statement means.
- `demoura-2026-kernel-soundness-bug-hunt` — the checker itself has a trusted computing base and implementation failure modes; independent checking matters under stronger threat models.
- `giere-2007-distributed-cognition-without-knowing` — reliable distributed epistemic processing does not automatically settle who or what is entitled to be called a knower.

## Why this is a collision rather than an agreement

Formal verification gives an unusually strong independent constraint, but it does not collapse all epistemic questions into one green checkmark. The formal certificate can be valid while statement fidelity, trusted-base assumptions, interpretation, understanding, and responsibility remain separate.

## New distinction / contradiction

Track at least five verification boundaries:

1. **derivation validity** — does the proof term establish the formal statement?
2. **statement fidelity** — does the formal statement express the intended claim?
3. **assumption boundary** — which axioms/definitions/imports are trusted?
4. **checker boundary** — which implementation(s) must be sound?
5. **epistemic uptake** — who can responsibly rely on, explain, or act on the result?

Passing one boundary does not imply passing the next.

## Pressure on the seed

This primarily pressures the research system rather than the frozen thesis. “The world/formal system answers” must identify **which question received an answer**.

## What remains unresolved

How much statement-level understanding is required before a formally verified result should change a human learner's map, and how to price independent checking when theorem generation and formalization are both AI-mediated.

## Candidate discriminating probe

`probes/navier-stokes-statement-fidelity.md` compares the public/Clay claim with the independently specified Comparator challenge before treating Lean acceptance as evidence for the broader informal statement.
